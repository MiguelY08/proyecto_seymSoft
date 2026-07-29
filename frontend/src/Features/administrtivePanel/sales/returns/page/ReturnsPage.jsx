/**
 * Archivo: ReturnsPage.jsx
 * Página principal del módulo de gestión de devoluciones de ventas.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReturnsToolbar from '../components/ReturnsToolbar';
import ReturnsTable from '../components/ReturnsTable';
import SalesReturnsMetricsCards from '../components/SalesReturnsMetricsCards';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import FormReturn from '../components/FormReturn';
import DetailReturn from '../components/DetailReturn';
import CancelReturn from '../components/CancelReturn';
import { 
  getReturns, 
  getReturnById,
  createReturn, 
  updateReturn
} from '../data/returnsService';
import { filterReturnsByDateAndSearch, paginateData } from '../utils/returnsHelpers';
import { exportReturnsToExcel } from '../utils/excelExporter';
import { useAlert } from '../../../../shared/alerts/useAlert';
import Spinner from '../../../../shared/spinner';

const RECORDS_PER_PAGE = 13;

const normalizeReturn = (item = {}) => {
  const details = (item.details || item.productosDevueltos || []).map((detail) => ({
    ...detail,
    id: detail.idSaleReturnDetail || detail.id,
    idSaleReturnDetail: detail.idSaleReturnDetail || detail.id,
    idProduct: detail.idProduct || detail.productId,
    productId: detail.productId || detail.idProduct,
    productName: detail.productName || detail.nombre || '',
    barcode: detail.barcode || '',
    idBarcode: detail.idBarcode || detail.id_barcode || null,
    quantity: detail.quantity ?? detail.cantidad ?? 0,
    unitPrice: detail.unitPrice ?? detail.precioUnit ?? 0,
    reason: detail.reason || detail.motivo || '',
    reasonId: detail.reasonId || detail.idReturnReason,
    method: detail.method || detail.metodo || '',
    methodId: detail.methodId || detail.idReturnMethod,
    status: detail.status || detail.estado || 'En Proceso',
    statusId: detail.statusId || detail.idReturnStatus,
    description: detail.description || detail.descripcionMotivo || '',
    imageUrl: detail.imageUrl || detail.imagen || null,
    applyCredit: detail.applyCredit === true,
    creditApplied: detail.creditApplied === true
  }));

  const evidences = item.evidences || item.evidencias || item.sale_return_evidence || [];
  const normalized = {
    ...item,
    id: item.id || item.id_sales_return,
    idSale: item.idSale || item.id_sale,
    returnNumber: item.returnNumber || item.numeroDevolucion || '',
    invoiceNumber: item.invoiceNumber || item.numeroFactura || '',
    clientName: item.clientName || item.cliente || '',
    employeeName: item.employeeName || item.asesor || '',
    clientPhone: item.clientPhone || item.telefono || '',
    clientAddress: item.clientAddress || item.direccionCliente || '',
    hasDelivery: item.hasDelivery ?? item.domicilio ?? false,
    deliveryAddress: item.deliveryAddress || item.direccion || '',
    createdAt: item.createdAt || item.fechaCreacion || null,
    totalAmount: item.totalAmount ?? item.totalValor ?? 0,
    status: item.status || item.estado || 'En Proceso',
    evidences,
    cancellationReason: item.cancellationReason || null,
    cancelledAt: item.cancelledAt || null,
    description: item.description || item.descripcion || '',
    details
  };

  return {
    ...normalized,
    numeroDevolucion: normalized.returnNumber,
    numeroFactura: normalized.invoiceNumber,
    cliente: normalized.clientName,
    asesor: normalized.employeeName,
    telefono: normalized.clientPhone,
    direccion: normalized.deliveryAddress || normalized.clientAddress,
    fechaCreacion: normalized.createdAt,
    totalValor: normalized.totalAmount,
    estado: normalized.status,
    evidencias: normalized.evidences,
    productosDevueltos: normalized.details
  };
};

function ReturnsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [returnToCancel, setReturnToCancel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showSuccess, showError } = useAlert();

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReturns({ page: 1, limit: 100 });
      const rawData = response?.data || [];
      setReturns(rawData.map(normalizeReturn));
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar las devoluciones');
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    showSuccess('Filtros limpiados', 'Todos los filtros han sido eliminados');
  };

  const handleExport = async () => {
    try {
      const filtered = filterReturnsByDateAndSearch(returns, searchTerm, startDate, endDate);
      if (filtered.length === 0) {
        showError('Sin datos', 'No hay devoluciones para exportar');
        return;
      }
      await exportReturnsToExcel(filtered);
      showSuccess('Exportación exitosa', 'El archivo Excel se generó correctamente');
    } catch {
      showError('Error', 'No se pudo exportar el archivo');
    }
  };

  const handleNew = () => {
    setSelectedReturn(null);
    setFormOpen(true);
  };

  const loadFullReturn = async (returnData) => {
    try {
      return normalizeReturn(await getReturnById(returnData.id));
    } catch (error) {
      showError('Error', error.message || 'No se pudo cargar la devolución');
      return null;
    }
  };

  const handleEdit = async (returnData) => {
    if (returnData.status === 'Anulado') {
      showError('Error', 'No se puede editar una devolución anulada');
      return;
    }
    setFormOpen(true);
    setSelectedReturn(null);
    const fullReturn = await loadFullReturn(returnData);
    if (fullReturn) {
      setSelectedReturn(fullReturn);
    } else {
      setFormOpen(false);
    }
  };

  const handleInfo = async (returnData) => {
    setDetailOpen(true);
    setSelectedReturn(null);
    const fullReturn = await loadFullReturn(returnData);
    if (fullReturn) {
      setSelectedReturn(fullReturn);
    } else {
      setDetailOpen(false);
    }
  };

  useEffect(() => {
    const returnId = searchParams.get('returnId');
    if (!returnId || loading || detailOpen) return;

    const targetReturn = returns.find((item) => String(item.id) === String(returnId)) || {
      id: Number(returnId) || returnId
    };

    handleInfo(targetReturn);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('returnId');
    setSearchParams(nextParams, { replace: true });
  }, [detailOpen, loading, returns, searchParams, setSearchParams]);

  const handleCancelClick = async (returnData) => {
    if (returnData.status === 'Anulado') {
      showError('Error', 'La devolución ya está anulada');
      return;
    }
    setCancelOpen(true);
    setReturnToCancel(null);
    const fullReturn = await loadFullReturn(returnData);
    if (fullReturn) {
      setReturnToCancel(fullReturn);
    } else {
      setCancelOpen(false);
    }
  };

  const handleCancelSuccess = () => {
    loadReturns();
  };

  const handleSave = async (formData) => {
    if (!formData) {
      showError('Error', 'No se recibieron datos del formulario');
      return;
    }

    try {
      const createPayload = {
        idSale: formData.idSale || formData.id_sale || formData.id,
        description: formData.description || '',
        hasDelivery: formData.hasDelivery || false,
        deliveryAddress: formData.deliveryAddress || '',
        details: (formData.details || []).map(d => ({
          idProduct: d.idProduct,
          productName: d.productName || '',
          imageUrl: d.imageUrl || '',
          barcode: d.barcode || '',
          quantity: d.quantity || 1,
          unitPrice: d.unitPrice || 0,
          idReturnReason: d.idReturnReason,
          idReturnMethod: d.idReturnMethod,
          idBarcode: d.idBarcode || null,
          reasonName: d.reasonName || '',
          isDefective: d.isDefective || false,
          descripcionMotivo: d.descripcionMotivo || '',
          metodo: d.method || d.metodo || '',
          applyCredit: d.applyCredit === true,
          status: d.status || 'En Proceso'
        })),
        evidenceFiles: formData.evidenceFiles || [],
        evidenceDescription: formData.evidenceDescription || ''
      };

      if (selectedReturn) {
        const id = selectedReturn.id || selectedReturn.id_sales_return;
        const updatePayload = {
          description: formData.description || '',
          evidenceDescription: formData.evidenceDescription || '',
          details: (formData.details || []).map((detail) => ({
            idSaleReturnDetail: detail.idSaleReturnDetail || detail.id,
            idReturnStatus: detail.idReturnStatus,
            idReturnMethod: detail.idReturnMethod
          }))
        };
        const evidenceFiles = formData.evidenceFiles || [];
        const updated = await updateReturn(id, updatePayload, evidenceFiles);
        if (updated) {
          await loadReturns();
          showSuccess('Devolución actualizada', 'Los datos se actualizaron correctamente');
          setFormOpen(false);
        }
      } else {
        const created = await createReturn(createPayload, createPayload.evidenceFiles);
        if (created) {
          await loadReturns();
          showSuccess('Devolución creada', 'La nueva devolución se creó exitosamente');
          setFormOpen(false);
        }
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudo guardar');
    }
  };

  const filteredReturns = useMemo(
    () => filterReturnsByDateAndSearch(returns, searchTerm, startDate, endDate),
    [returns, searchTerm, startDate, endDate]
  );

  const paginatedResult = useMemo(
    () => paginateData(filteredReturns, currentPage, RECORDS_PER_PAGE),
    [filteredReturns, currentPage]
  );
  const currentData = paginatedResult.currentData || [];
  const startIndex = paginatedResult.startIndex || 0;
  const hasActiveFilters = searchTerm !== '' || startDate !== '' || endDate !== '';

  if (loading) {
    return <Spinner message="Cargando devoluciones..." />;
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 p-3 sm:p-4 lg:gap-3 lg:overflow-hidden">
      <ReturnsToolbar
        search={searchTerm}
        onSearchChange={handleSearchChange}
        startDate={startDate}
        onStartDate={handleStartDateChange}
        endDate={endDate}
        onEndDate={handleEndDateChange}
        onClearFilters={handleClearFilters}
        onNew={handleNew}
        onExport={handleExport}
      />

      <div className="hidden md:block">
        <SalesReturnsMetricsCards returns={returns} />
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <span className="font-medium">Filtros activos:</span>
          {searchTerm && (
            <span className="bg-gray-200 px-2 py-0.5 rounded-full">Búsqueda: {searchTerm}</span>
          )}
          {startDate && (
            <span className="bg-gray-200 px-2 py-0.5 rounded-full">Desde: {new Date(startDate).toLocaleDateString('es-CO')}</span>
          )}
          {endDate && (
            <span className="bg-gray-200 px-2 py-0.5 rounded-full">Hasta: {new Date(endDate).toLocaleDateString('es-CO')}</span>
          )}
          <span className="text-gray-400 ml-1">({filteredReturns.length} resultado{filteredReturns.length !== 1 ? 's' : ''})</span>
        </div>
      )}

      <div className="lg:w-full lg:min-w-0 lg:rounded-xl lg:bg-white lg:shadow-md">
        <ReturnsTable
          data={currentData}
          startIndex={startIndex}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onCancel={handleCancelClick}
        />
      </div>

      {filteredReturns.length > 0 && (
        <div className="lg:shrink-0">
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={filteredReturns.length}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        </div>
      )}

      <FormReturn
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setSelectedReturn(null); }}
        returnData={selectedReturn}
        onSave={handleSave}
      />

      <DetailReturn
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedReturn(null); }}
        devolucion={selectedReturn}
      />

      <CancelReturn
        isOpen={cancelOpen}
        onClose={() => { setCancelOpen(false); setReturnToCancel(null); }}
        returnData={returnToCancel}
        onSuccess={handleCancelSuccess}
      />

    </div>
  );
}

export default ReturnsPage;
