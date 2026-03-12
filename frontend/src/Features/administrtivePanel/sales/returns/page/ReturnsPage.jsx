// page/ReturnsPage.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ReturnsToolbar from '../components/ReturnsToolbar';
import ReturnsTable from '../components/ReturnsTable';
import Pagination from '../components/Pagination';
import FormReturn from '../components/FormReturn';
import DetailReturn from '../components/DetailReturn';
import CancelReturn from '../components/CancelReturn';
import { 
  getReturns, 
  getAllReturns, 
  createReturn, 
  updateReturn
} from '../data/returnsService';
import { filterReturns, exportToExcel, paginateData } from '../utils/returnsHelpers';
import { useAlert } from '../../../../shared/alerts/useAlert';

const RECORDS_PER_PAGE = 13;

function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnToCancel, setReturnToCancel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showConfirm, showSuccess, showError } = useAlert();

  useEffect(() => {
    loadReturns();
  }, []);

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

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleNew = () => {
    setSelectedReturn(null);
    setFormOpen(true);
  };

  const handleEdit = (returnData) => {
    if (returnData.estado === 'Anulada') {
      showError('Error', 'No se puede editar una devolución anulada');
      return;
    }
    setSelectedReturn(returnData);
    setFormOpen(true);
  };

  const handleInfo = (returnData) => {
    setSelectedReturn(returnData);
    setDetailOpen(true);
  };

  const handleCancelClick = (returnData) => {
    if (returnData.estado === 'Anulada') {
      showError('Error', 'La devolución ya está anulada');
      return;
    }
    setReturnToCancel(returnData);
    setCancelOpen(true);
  };

  const handleCancelSuccess = () => {
    loadReturns();
  };

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

  const handleExport = () => {
    try {
      const allReturns = getAllReturns();
      const { headers, data } = exportToExcel(allReturns);
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
      XLSX.utils.book_append_sheet(wb, ws, 'Devoluciones');
      XLSX.writeFile(wb, `devoluciones_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showSuccess('Exportación exitosa', 'El archivo Excel se generó correctamente');
    } catch (error) {
      showError('Error', 'No se pudo exportar el archivo');
    }
  };

  const filteredReturns = filterReturns(returns, searchTerm);
  const { currentData, totalPages, startIndex } = paginateData(
    filteredReturns,
    currentPage,
    RECORDS_PER_PAGE
  );

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

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      <ReturnsToolbar
        search={searchTerm}
        onSearchChange={handleSearchChange}
        onNew={handleNew}
        onExport={handleExport}
      />

      <div className="bg-white rounded-xl shadow-md">
        <ReturnsTable
          data={currentData}
          startIndex={startIndex}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onCancel={handleCancelClick}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{currentData.length}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{filteredReturns.length}</span>
        </p>

        {totalPages > 1 && (
          <div className="bg-white shadow-md rounded-xl px-3 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <FormReturn
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        returnData={selectedReturn}
        onSave={handleSave}
      />

      <DetailReturn
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        devolucion={selectedReturn}
      />

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