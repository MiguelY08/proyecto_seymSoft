import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LeftSectionForm from '../components/LeftSectionForm';
import RightSectionForm from '../components/RightSectionForm';
import OrdersService from '../services/ordersService';
import { useAlert } from '../../../../shared/alerts/useAlert';

/**
 * OrderForm — Modal para editar una orden existente.
 * Permite modificar dirección de entrega, estado y motivo de cancelación.
 * Incluye validación y confirmaciones para cambios críticos.
 *
 * @param {Object} order - Orden a editar.
 * @param {boolean} isOpen - Si el modal está abierto.
 * @param {Function} onClose - Callback para cerrar el modal.
 * @param {Function} onSave - Callback para guardar cambios (recibe orden actualizada).
 */
function OrderForm({ order, isOpen, onClose, onSave }) {
  const { showConfirm, showWarning, showSuccess } = useAlert();

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [formData, setFormData] = useState(() => ({
    ...order,
    direccionEntrega:  order.direccionEntrega || order.cliente?.direccion || '',
    motivoCancelacion: order.motivoCancelacion ?? '',
  }));
  const [errors, setErrors] = useState({});

  // ── Inicializar formulario al abrir ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        ...order,
        direccionEntrega:  order.direccionEntrega || order.cliente?.direccion || '',
        motivoCancelacion: order.motivoCancelacion ?? '',
      });
      setErrors({});
    }
  }, [isOpen, order?.id]);

  // ── Cerrar con confirmación — siempre ────────────────────────────────────
  const handleCerrar = async () => {
    const result = await showConfirm(
      'warning',
      '¿Salir sin guardar?',
      'Al cerrar el formulario se perderán los cambios realizados.',
      { confirmButtonText: 'Sí, salir', cancelButtonText: 'Seguir editando' }
    );
    if (result?.isConfirmed) onClose();
  };

  // ── Cambios de campo ──────────────────────────────────────────────────────
  /**
   * Maneja cambios en campos del formulario.
   * Incluye confirmación especial para cambiar a "Cancelado".
   * @param {string} name - Nombre del campo.
   * @param {any} value - Nuevo valor.
   */
  const handleChange = async (name, value) => {
    // Confirmación especial al seleccionar "Cancelado"
    if (name === 'estado' && value === 'Cancelado') {
      const result = await showConfirm(
        'warning',
        'Cancelar pedido',
        `¿Estás seguro de cambiar el estado a "Cancelado"? El pedido quedará cancelado y no podrás modificar esta acción al guardar.`,
        { confirmButtonText: 'Sí, cancelar pedido', cancelButtonText: 'No, mantener estado' }
      );
      if (!result?.isConfirmed) return; // Abortar — no cambia el estado
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── Validación ────────────────────────────────────────────────────────────
  /**
   * Valida los campos del formulario.
   * @returns {Object} Errores de validación por campo.
   */
  const validate = () => {
    const newErrors = {};
    if (!formData.direccionEntrega?.trim())
      newErrors.direccionEntrega = 'La dirección de entrega es obligatoria';
    if (!formData.estado)
      newErrors.estado = 'El estado es obligatorio';
    if (formData.estado === 'Cancelado') {
      if (!formData.motivoCancelacion?.trim())
        newErrors.motivoCancelacion = 'El motivo de cancelación es obligatorio';
      else if (formData.motivoCancelacion.trim().length < 10)
        newErrors.motivoCancelacion = 'El motivo debe tener al menos 10 caracteres';
    }
    return newErrors;
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  /**
   * Envía el formulario después de validar.
   * Actualiza estado y dirección si cambiaron, usando OrdersService.
   */
  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showWarning('Formulario incompleto', 'Por favor revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    let updatedOrder = null;

    // Actualizar estado si cambió
    if (formData.estado !== order.estado) {
      const motivo = formData.estado === 'Cancelado'
        ? formData.motivoCancelacion.trim()
        : null;
      updatedOrder = OrdersService.updateEstado(order.id, formData.estado, motivo);
    }

    // Actualizar dirección si cambió
    if (formData.direccionEntrega !== (order.direccionEntrega || order.cliente?.direccion)) {
      const baseOrder = updatedOrder || OrdersService.findById(order.id);
      if (baseOrder) {
        updatedOrder = OrdersService.update({
          id: baseOrder.id,
          direccionEntrega: formData.direccionEntrega,
        });
      }
    }

    if (!updatedOrder) { onClose(); return; }

    onSave(updatedOrder);
    showSuccess(
      'Cambios guardados',
      `El pedido #${order.numerosPedido} fue actualizado correctamente.`
    );
    onClose();
  };

  // ── Animaciones CSS ────────────────────────────────────────────────────────
  const animations = `
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn  { animation: fadeIn  0.2s ease-out; }
    .animate-slideUp { animation: slideUp 0.3s ease-out; }
  `;

  return (
    <div
      onClick={handleCerrar}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <style>{animations}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
      >

        {/* Header */}
        <div className="bg-[#004D77] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">
            Editar Pedido #{order.numerosPedido}
          </h2>
          <button
            onClick={handleCerrar}
            className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeftSectionForm order={formData} onChange={handleChange} errors={errors} />
          <RightSectionForm productos={order.productos} total={order.total} />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleCerrar}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#004D77] rounded-lg hover:bg-[#003b5c] transition-colors cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderForm;