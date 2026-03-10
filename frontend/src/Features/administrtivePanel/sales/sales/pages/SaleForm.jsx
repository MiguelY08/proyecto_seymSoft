import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAlert } from '../../../../shared/alerts/useAlert';

import SaleDetailsForm from '../components/SaleDetailsForm';
import OrderForm       from '../components/OrderForm';
import DataSalePreview from '../components/DataSalePreview';
import { SalesDB }     from '../services/salesBD';

// ─── Generar número de factura único ──────────────────────────────────────────
const generateFactura = () =>
  String(Math.floor(100000000 + Math.random() * 900000000));

// ─── Validaciones ─────────────────────────────────────────────────────────────
const validateForm = (form, items) => {
  const errors = {};
  if (!form.clienteId)                                      errors.clienteId  = 'Seleccione un cliente.';
  if (!form.vendedorId)                                     errors.vendedorId = 'Seleccione un vendedor.';
  if (!form.metodoPago)                                     errors.metodoPago = 'Seleccione un método de pago.';
  if (!form.estado)                                         errors.estado     = 'Seleccione un estado.';
  if (!form.entrega)                                        errors.entrega    = 'Seleccione una opción de entrega.';
  // Dirección solo es obligatoria cuando la entrega es a domicilio
  if (form.entrega === 'Domicilio' && !form.direccion?.trim()) errors.direccion = 'Ingrese la dirección de entrega.';
  if (items.length === 0)                                   errors.items      = 'Agrega al menos un producto al pedido.';
  return errors;
};

// ─── SaleForm ─────────────────────────────────────────────────────────────────
function SaleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, showWarning, showSuccess } = useAlert();

  const saleToEdit = location.state?.sale ?? null;
  const isEditing  = saleToEdit !== null;

  // Una venta anulada no puede cambiar su estado
  const isAnulada  = isEditing && saleToEdit?.estado === 'Anulada';

  const [facturaNo] = useState(() =>
    isEditing ? saleToEdit.factura : generateFactura()
  );

  const [form, setForm] = useState({
    clienteId:  location.state?.newUserId
      ?? (saleToEdit ? String(saleToEdit.clienteId ?? '') : ''),
    vendedorId: saleToEdit ? String(saleToEdit.vendedorId ?? '') : '',
    metodoPago: saleToEdit?.metodoPago ?? '',
    estado:     saleToEdit?.estado     ?? '',
    entrega:    saleToEdit?.entrega    ?? '',
    direccion:  saleToEdit?.direccion  ?? '',
  });

  const [originalItems] = useState(() =>
    isEditing && saleToEdit.items ? saleToEdit.items : []
  );

  const [items,  setItems]  = useState(() => isEditing && saleToEdit.items ? saleToEdit.items : []);
  const [errors, setErrors] = useState({});

  const handleFormChange = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleItemsChange = useCallback((newItems) => {
    setItems(newItems);
    if (newItems.length > 0) setErrors((prev) => ({ ...prev, items: '' }));
  }, []);

  // ─── Cancelar ─────────────────────────────────────────────────────────────
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

  // ─── Guardar — con confirmación previa ────────────────────────────────────
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

    // 2. Alerta de confirmación — "Enviar" guarda, "Revisar" vuelve al formulario
    const result = await showConfirm(
      'info',
      '¿Listo para guardar?',
      'Revisa que todos los datos sean correctos antes de confirmar. Esta acción guardará la venta en el sistema.',
      { confirmButtonText: 'Enviar', cancelButtonText: 'Revisar' }
    );

    if (!result?.isConfirmed) return; // Usuario quiere revisar → no hacemos nada

    // 3. Guardar
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

      {/* ── Volver + Título ─────────────────────────────────────────── */}
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

      {/* ── Grid principal ───────────────────────────────────────────── */}
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
          isEditing={isEditing}
        />
      </div>

      {errors.items && (
        <p className="text-sm text-red-600 -mt-2">{errors.items}</p>
      )}

      {/* ── Botones ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* ── Vista previa ─────────────────────────────────────────────── */}
      <DataSalePreview
        form={form}
        items={items}
        facturaNo={facturaNo}
        isAnulada={isAnulada}
        motivoAnulacion={saleToEdit?.motivoAnulacion ?? ''}
        fechaAnulacion={saleToEdit?.fechaAnulacion  ?? ''}
      />
    </div>
  );
}

export default SaleForm;