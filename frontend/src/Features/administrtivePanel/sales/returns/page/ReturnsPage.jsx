/**
 * Archivo: ReturnsPage.jsx
 *
 * Página principal del módulo de gestión de devoluciones de ventas.
 * Esta página es el núcleo del sistema de devoluciones y contiene toda la lógica
 * para la creación, edición, visualización y anulación de devoluciones.
 *
 * Responsabilidades principales:
 * - Cargar y mostrar la lista de devoluciones almacenadas
 * - Manejar la búsqueda y filtrado de devoluciones
 * - Permitir crear nuevas devoluciones
 * - Permitir editar devoluciones existentes
 * - Permitir ver el detalle completo de una devolución
 * - Permitir anular devoluciones
 * - Exportar devoluciones a archivo Excel con detalle de productos
 * - Manejar paginación de la tabla
 *
 * Este archivo actúa como orquestador principal, coordinando todos los
 * componentes del módulo (toolbar, tabla, modales, etc.) y los servicios
 * de almacenamiento en localStorage.
 */
import React, { useState, useEffect } from 'react';
import ReturnsToolbar from '../components/ReturnsToolbar';
import ReturnsTable from '../components/ReturnsTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import FormReturn from '../components/FormReturn';
import DetailReturn from '../components/DetailReturn';
import CancelReturn from '../components/CancelReturn';
import { 
  getReturns, 
  getAllReturns, 
  createReturn, 
  updateReturn
} from '../data/returnsService';
import { filterReturns, paginateData } from '../utils/returnsHelpers';
import { exportReturnsToExcel, exportReturnsSummaryToExcel } from '../utils/excelExporter';
import { useAlert } from '../../../../shared/alerts/useAlert';

const RECORDS_PER_PAGE = 13; // Cantidad de registros a mostrar por página en la tabla

/**
 * Componente: ReturnsPage
 *
 * Componente principal que orquesta toda la funcionalidad del módulo de devoluciones.
 * Maneja estados globales, eventos, modales y la sincronización de datos.
 */
function ReturnsPage() {
  // ======================== ESTADOS PRINCIPALES ========================
  
  // Lista completa de devoluciones cargadas desde localStorage
  const [returns, setReturns] = useState([]);
  
  // Término de búsqueda ingresado por el usuario en la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Página actual que se está visualizando en la tabla (paginación)
  const [currentPage, setCurrentPage] = useState(1);
  
  // Controla la visibilidad del modal de formulario (crear/editar)
  const [formOpen, setFormOpen] = useState(false);
  
  // Controla la visibilidad del modal de detalle (visualizar información completa)
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Controla la visibilidad del modal de anulación
  const [cancelOpen, setCancelOpen] = useState(false);
  
  // Guarda la devolución seleccionada para edición o visualización
  const [selectedReturn, setSelectedReturn] = useState(null);
  
  // Guarda la devolución que va a ser anulada
  const [returnToCancel, setReturnToCancel] = useState(null);
  
  // Indicador de carga durante la obtención de datos
  const [loading, setLoading] = useState(true);

  // Hook para mostrar alertas (confirmación, éxito, error)
  const { showConfirm, showSuccess, showError } = useAlert();

  // ======================== USEEFFECT: CARGA INICIAL ========================
  
  // Este useEffect se ejecuta cuando el componente se monta (primera vez)
  // Su función es cargar las devoluciones almacenadas en localStorage
  useEffect(() => {
    loadReturns();
  }, []);

  // ======================== FUNCIONALIDAD: CARGAR DEVOLUCIONES ========================
  
  /**
   * Carga las devoluciones desde localStorage y las almacena en el estado.
   * También maneja errores y actualiza el indicador de carga.
   */
  const loadReturns = () => {
    try {
      const data = getReturns();
      setReturns(data);
    } catch (error) {
      showError('Error', 'No se pudieron cargar las devoluciones');
    } finally {
      setLoading(false);
    }
  };

  // ======================== FUNCIONALIDAD: BÚSQUEDA ========================
  
  /**
   * Actualiza el término de búsqueda y reinicia la paginación a la página 1
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // ======================== FUNCIONALIDAD: CREAR DEVOLUCIÓN ========================
  
  /**
   * Abre el modal de formulario en modo de creación (sin datos previos)
   */
  const handleNew = () => {
    setSelectedReturn(null); // Sin datos = modo creación
    setFormOpen(true);
  };

  // ======================== FUNCIONALIDAD: EDITAR DEVOLUCIÓN ========================
  
  /**
   * Abre el modal de formulario con los datos de la devolución seleccionada.
   * Valida que la devolución no esté anulada antes de permitir edición.
   * @param {Object} returnData - Devolución a editar
   */
  const handleEdit = (returnData) => {
    if (returnData.estado === 'Anulada') {
      showError('Error', 'No se puede editar una devolución anulada');
      return;
    }
    setSelectedReturn(returnData);
    setFormOpen(true);
  };

  // ======================== FUNCIONALIDAD: VER DETALLE ========================
  
  /**
   * Abre el modal de detalle para mostrar toda la información de una devolución
   * @param {Object} returnData - Devolución a visualizar
   */
  const handleInfo = (returnData) => {
    setSelectedReturn(returnData);
    setDetailOpen(true);
  };

  // ======================== FUNCIONALIDAD: ANULAR / ELIMINAR DEVOLUCIÓN ========================
  
  /**
   * Abre el modal de anulación para marcar una devolución como anulada.
   * Valida que la devolución no esté ya anulada.
   * @param {Object} returnData - Devolución a anular
   */
  const handleCancelClick = (returnData) => {
    if (returnData.estado === 'Anulada') {
      showError('Error', 'La devolución ya está anulada');
      return;
    }
    setReturnToCancel(returnData);
    setCancelOpen(true);
  };

  /**
   * Callback que se ejecuta después de anular exitosamente una devolución.
   * Recarga la lista de devoluciones desde localStorage.
   */
  const handleCancelSuccess = () => {
    loadReturns();
  };

  // ======================== FUNCIONALIDAD: GUARDAR DEVOLUCIÓN (CREAR O EDITAR) ========================
  
  /**
   * Guarda una devolución nueva o actualiza una existente.
   * Maneja tanto la creación como la edición dependiendo de si hay
   * una devolución seleccionada.
   * @param {Object} formData - Datos del formulario a guardar
   */
  const handleSave = (formData) => {
    console.log('Datos recibidos en handleSave:', formData);
    
    try {
      if (selectedReturn) {
        // Es edición
        console.log('Editando devolución con ID:', selectedReturn.id);
        const updated = updateReturn(selectedReturn.id, formData);
        
        if (updated) {
          console.log('Devolución actualizada:', updated);
          setReturns(prev => prev.map(r => r.id === selectedReturn.id ? updated : r));
          showSuccess('Devolución actualizada', 'Los datos se actualizaron correctamente');
          setFormOpen(false);
        } else {
          console.error('updateReturn devolvió null');
          showError('Error', 'No se pudo actualizar la devolución');
          return;
        }
      } else {
        // Es creación
        console.log('Creando nueva devolución');
        
        // Validar que los datos mínimos existen
        if (!formData.noFactura || !formData.cliente || !formData.asesor) {
          console.error('Faltan datos obligatorios');
          showError('Error', 'Faltan datos obligatorios en el formulario');
          return;
        }
        
        const created = createReturn(formData);
        console.log('Devolución creada:', created);
        
        if (created) {
          setReturns(prev => [...prev, created]);
          showSuccess('Devolución creada', 'La nueva devolución se creó exitosamente');
          setFormOpen(false);
        } else {
          console.error('createReturn devolvió null');
          showError('Error', 'No se pudo crear la devolución');
          return;
        }
      }
      
    } catch (error) {
      console.error('Error en handleSave:', error);
      showError('Error', `No se pudo guardar: ${error.message}`);
    }
  };

  // ======================== FUNCIONALIDAD: DESCARGAR / EXPORTAR ========================
  
  /**
   * Exporta todas las devoluciones a un archivo Excel con detalle completo.
   * Genera un archivo con tres hojas:
   * - Resumen Devoluciones
   * - Detalle Productos (cada producto devuelto con todos sus detalles)
   * - Estadísticas
   */
  const handleExport = () => {
    try {
      const allReturns = getAllReturns();
      exportReturnsToExcel(allReturns);
      showSuccess('Exportación exitosa', 'El archivo Excel se generó correctamente');
    } catch (error) {
      console.error('Error en exportación:', error);
      showError('Error', 'No se pudo exportar el archivo');
    }
  };

  // ======================== APLICAR FILTROS Y PAGINACIÓN ========================
  
  // Filtrar devoluciones según el término de búsqueda
  const filteredReturns = filterReturns(returns, searchTerm);
  
  // Obtener datos paginados para la tabla
  const paginatedResult = paginateData(
    filteredReturns,
    currentPage,
    RECORDS_PER_PAGE
  );
  
  const currentData = paginatedResult.currentData || [];

  // ======================== RENDERIZADO: INDICADOR DE CARGA ========================
  
  // Mientras se cargan los datos, mostramos un spinner de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando devoluciones...</p>
        </div>
      </div>
    );
  }

  // ======================== RENDERIZADO: INTERFAZ PRINCIPAL ========================
  
  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      {/* Toolbar: Búsqueda y botones de acción */}
      <ReturnsToolbar
        search={searchTerm}
        onSearchChange={handleSearchChange}
        onNew={handleNew}
        onExport={handleExport}
      />

      {/* Tabla de devoluciones */}
      <div className="bg-white rounded-xl shadow-md">
        <ReturnsTable
          data={currentData}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onCancel={handleCancelClick}
        />
      </div>

      {/* Paginación - mismo estilo que ClientsPage y ProvidersPage */}
      {filteredReturns.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filteredReturns.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Modal para crear/editar devolución */}
      <FormReturn
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        returnData={selectedReturn}
        onSave={handleSave}
      />

      {/* Modal para ver detalle de devolución */}
      <DetailReturn
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        devolucion={selectedReturn}
      />

      {/* Modal para anular devolución */}
      <CancelReturn
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        returnData={returnToCancel}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}

export default ReturnsPage;