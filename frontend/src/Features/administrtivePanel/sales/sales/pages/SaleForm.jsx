import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

import SaleDetailsForm          from '../components/SaleDetailsForm';
import OrderForm                from '../components/OrderForm';
import DataSalePreview          from '../components/DataSalePreview';
import { SalesDB }              from '../services/salesBD';
import { generateFactura, validateForm } from '../helpers/salesHelpers';

/**
 * Componente para crear o editar una venta.
 * Maneja el formulario de detalles de venta, productos y vista previa.
 * Incluye validación, confirmaciones y navegación.
 *
 * @component
 * @returns {JSX.Element} El formulario de venta.
 */
function SaleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, showWarning, showSuccess, showError } = useAlert();

  // Determinar si es edición y obtener datos de la venta
  const saleToEdit = location.state?.sale ?? null;
  const isEditing  = saleToEdit !== null;

  // Una venta anulada no puede cambiar su estado
  const isAnulada  = isEditing && saleToEdit?.estado === 'Anulada';

  // Generar o usar número de factura
  const [facturaNo] = useState(() =>
    isEditing ? saleToEdit.factura : generateFactura()
  );

  // Estado del formulario
  const [form, setForm] = useState({
    clienteId:  location.state?.newUserId
      ?? (saleToEdit ? String(saleToEdit.clienteId ?? '') : ''),
    vendedorId: saleToEdit ? String(saleToEdit.vendedorId ?? '') : '',
    metodoPago: saleToEdit?.metodoPago ?? '',
    estado:     saleToEdit?.estado     ?? '',
    entrega:    saleToEdit?.entrega    ?? '',
    direccion:  saleToEdit?.direccion  ?? '',
  });

  // Items originales para edición (para restaurar stock si cambian)
  const [originalItems] = useState(() =>
    isEditing && saleToEdit.items ? saleToEdit.items : []
  );

  // Items actuales del pedido
  const [items,  setItems]  = useState(() => isEditing && saleToEdit.items ? saleToEdit.items : []);
  const [errors, setErrors] = useState({});

  // Ref para los botones de acción y control de visibilidad del FAB
  const actionsRef     = useRef(null);
  const [atBottom, setAtBottom] = useState(false);

  // IntersectionObserver — detecta si los botones de acción son visibles
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToActions = () => {
    actionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Maneja cambios en los campos del formulario.
   * Actualiza el estado del formulario y limpia errores relacionados.
   *
   * @param {string} name - Nombre del campo.
   * @param {string} value - Nuevo valor del campo.
   */
  const handleFormChange = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  /**
   * Maneja cambios en la lista de items del pedido.
   * Actualiza el estado de items y limpia errores si hay items.
   *
   * @param {Array} newItems - Nueva lista de items.
   */
  const handleItemsChange = useCallback((newItems) => {
    setItems(newItems);
    if (newItems.length > 0) setErrors((prev) => ({ ...prev, items: '' }));
  }, []);

  /**
   * Maneja la cancelación del formulario.
   * Muestra una confirmación antes de navegar de vuelta.
   */
  const handleCancel = () => {
    showConfirm(
      'warning',
      '¿Deseas cancelar?',
      'Se perderán todos los cambios realizados en el formulario.',
      { confirmButtonText: 'Sí, cancelar', cancelButtonText: 'Continuar editando' }
    ).then((result) => {
      if (result.isConfirmed) navigate('/admin/sales');
    });
  };

  /**
   * Maneja el guardado de la venta.
   * Valida el formulario, confirma con el usuario y guarda o actualiza la venta.
   */
  const handleSave = async () => {
    // 1. Validar campos
    const newErrors = validateForm(form, items);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showWarning(
        'Formulario incompleto',
        'Por favor completa todos los campos obligatorios y agrega al menos un producto.'
      );
      return;
    }

    // 2. Validar crédito — solo en creación, método exclusivo "Crédito" y estado "Aprobada"
    const esCredito = Array.isArray(form.metodoPago)
      ? form.metodoPago.length === 1 && form.metodoPago[0] === 'Crédito'
      : form.metodoPago === 'Crédito';

    if (!isEditing && esCredito && form.estado === 'Aprobada') {
      const { total: totalNum } = SalesDB._calcTotals(items);
      const creditInfo = SalesDB.getCreditInfo(form.clienteId);

      if (!creditInfo.tieneCredito) {
        showError(
          'Sin crédito asignado',
          'Este cliente no tiene un límite de crédito asignado. Asígnele un cupo desde el módulo de Clientes antes de registrar ventas a crédito.'
        );
        return;
      }

      if (totalNum > creditInfo.cupoDisponible) {
        const fmt = (v) => new Intl.NumberFormat('es-CO', {
          style: 'currency', currency: 'COP', minimumFractionDigits: 0,
        }).format(v);
        showError(
          'Cupo insuficiente',
          `El total de la venta (${fmt(totalNum)}) supera el cupo disponible del cliente (${fmt(creditInfo.cupoDisponible)}). Reduzca el pedido o cambie el método de pago.`
        );
        return;
      }
    }

    // 3. Confirmación — "Enviar" guarda, "Revisar" vuelve al formulario
    const result = await showConfirm(
      'info',
      '¿Listo para guardar?',
      'Revisa que todos los datos sean correctos antes de confirmar. Esta acción guardará la venta en el sistema.',
      { confirmButtonText: 'Enviar', cancelButtonText: 'Revisar' }
    );

    if (!result?.isConfirmed) return;

    // 4. Guardar
    if (isEditing) {
      SalesDB.update(saleToEdit.id, form, items, originalItems);
      showSuccess('Venta actualizada', 'Los datos de la venta han sido actualizados correctamente.');
    } else {
      SalesDB.create(form, items, facturaNo);
      showSuccess('Venta creada', 'La venta ha sido registrada exitosamente.');
    }

    navigate('/admin/sales');
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header con botón volver y título */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1 text-sm text-[#004D77] hover:text-[#003a5c] font-medium transition-colors cursor-pointer w-fit"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
          Volver
        </button>
        <h1 className="text-xl font-bold text-[#004D77]">
          {isEditing ? `Modificando venta no. ${saleToEdit.factura}` : 'Nueva venta'}
        </h1>
        {isAnulada && (
          <p className="text-sm text-red-500 font-medium">
            Esta venta está anulada. El estado no puede modificarse.
          </p>
        )}
      </div>

      {/* Grid principal con formularios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SaleDetailsForm
          form={form}
          onChange={handleFormChange}
          errors={errors}
          isEditing={isEditing}
          isAnulada={isAnulada}
          motivoAnulacion={saleToEdit?.motivoAnulacion ?? ''}
          fechaAnulacion={saleToEdit?.fechaAnulacion  ?? ''}
        />
        <OrderForm
          items={items}
          onItemsChange={handleItemsChange}
        />
      </div>

      {/* Error de items si no hay productos */}
      {errors.items && (
        <p className="text-sm text-red-600 -mt-2">{errors.items}</p>
      )}

      {/* Vista previa de la venta */}
      <DataSalePreview
        form={form}
        items={items}
        facturaNo={facturaNo}
        isAnulada={isAnulada}
        motivoAnulacion={saleToEdit?.motivoAnulacion ?? ''}
        fechaAnulacion={saleToEdit?.fechaAnulacion  ?? ''}
      />

      {/* Botones de acción — al final del formulario */}
      <div ref={actionsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 text-sm font-semibold text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors duration-200 cursor-pointer"
        >
          {isEditing ? 'Guardar cambios' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-3 text-sm font-semibold text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      {/* FAB — sube o baja según posición */}
      <button
        type="button"
        onClick={atBottom ? scrollToTop : scrollToActions}
        title={atBottom ? 'Ir al inicio' : 'Ir a los botones'}
        className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-[#004D77] text-white shadow-lg hover:bg-[#003a5c] active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {atBottom
          ? <ChevronUp  className="w-5 h-5" strokeWidth={2.5} />
          : <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
        }
      </button>
    </div>
  );
}

export default SaleForm;