// components/SelectedProduct.jsx
import React, { useState } from 'react';
import { ChevronLeft, Minus, Plus, X } from 'lucide-react';

const REASONS = ['Defective product', 'Broken product', 'Wrong product', 'Incomplete product', 'Not what I ordered'];
const METHODS = ['Refund', 'Product exchange', 'Credit note'];
const STATUSES = ['Pending', 'Approved', 'Cancelled'];

const formatCOP = (v) => new Intl.NumberFormat('es-CO').format(v);

function ProductImage({ src, size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  if (src) return <img src={src} alt="" className={`${dim} rounded-lg object-cover flex-shrink-0`} />;
  return (
    <div className={`${dim} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0`}>
      <span className="text-gray-400 text-xs">📷</span>
    </div>
  );
}

function StatusBadgeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const color = {
    Pending: 'bg-red-100 text-red-600 border-red-300',
    Approved: 'bg-green-100 text-green-700 border-green-300',
    Cancelled: 'bg-gray-100 text-gray-500 border-gray-300',
  }[value] ?? 'bg-red-100 text-red-600 border-red-300';
  
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${color}`}>
        {value}
        <ChevronLeft className="w-3 h-3 rotate-90" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
          {STATUSES.map((status) => (
            <button key={status} type="button" onClick={() => { onChange(status); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer">{status}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigurationItem({ config, index, total, onChange, onRemove, product, maxQuantity, submitted }) {
  const [touched, setTouched] = useState({});
  const maxAvailable = Math.min(config.quantity, maxQuantity);
  
  const validateField = (name, value) => {
    if (name === 'reason' && (!value || !value.trim())) return 'Select a reason';
    if (name === 'method' && (!value || !value.trim())) return 'Select a method';
    return '';
  };

  const handleChange = (field, value) => {
    onChange(index, { ...config, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const renderError = (field) => {
    if ((touched[field] || submitted) && validateField(field, config[field])) {
      return <p className="mt-0.5 text-xs text-red-600">{validateField(field, config[field])}</p>;
    }
    return null;
  };

  const fieldClass = (field) => {
    const hasError = (touched[field] || submitted) && validateField(field, config[field]);
    return `w-full px-3 py-1.5 text-sm border rounded-lg outline-none bg-white text-gray-700 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'
    }`;
  };

  return (
    <div className="border-t border-gray-100 first:border-t-0 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Configuration {index + 1} of {total}</span>
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 transition cursor-pointer"
            title="Remove configuration"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {/* Reason */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Reason<span className="text-red-500">*</span>
          </label>
          <select
            value={config.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            onBlur={() => handleBlur('reason')}
            className={fieldClass('reason')}
          >
            <option value="">Select</option>
            {REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
          </select>
          {renderError('reason')}
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status<span className="text-red-500">*</span>
          </label>
          <StatusBadgeSelect value={config.status} onChange={(v) => handleChange('status', v)} />
        </div>

        {/* Method */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Method<span className="text-red-500">*</span>
          </label>
          <select
            value={config.method}
            onChange={(e) => handleChange('method', e.target.value)}
            onBlur={() => handleBlur('method')}
            className={fieldClass('method')}
          >
            <option value="">Select</option>
            {METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
          {renderError('method')}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quantity<span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleChange('quantity', Math.max(1, config.quantity - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={config.quantity}
              min={1}
              max={maxQuantity}
              onChange={(e) => handleChange('quantity', Math.min(maxQuantity, Math.max(1, Number(e.target.value))))}
              className="w-10 text-center border border-gray-300 rounded-lg px-1 py-1.5 text-sm text-gray-700 outline-none focus:border-[#004D77]"
            />
            <button
              type="button"
              onClick={() => handleChange('quantity', Math.min(maxQuantity, config.quantity + 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer transition"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedProduct({ product, configurations, onConfigurationsChange, onRemove, submitted }) {
  // Estado para controlar expansión/colapsación del card
  const [expanded, setExpanded] = useState(true);
  
  // Cantidad máxima del producto disponible
  const maxTotalQuantity = product.quantity;

  // ======================= CÓMPUTO DE CANTIDADES =======================
  
  // Calcular cantidad total usada en todas las configuraciones
  const totalQuantityUsed = configurations.reduce((sum, cfg) => sum + (cfg.quantity || 0), 0);
  
  // Calcular cantidad restante disponible
  const remainingQuantity = maxTotalQuantity - totalQuantityUsed;

  // ======================= FUNCIONALIDAD: AGREGAR CONFIGURACIÓN =======================
  
  /**
   * Agrega una nueva configuración al producto.
   * Valida que haya cantidad disponible.
   */
  const handleAddConfiguration = () => {
    if (remainingQuantity <= 0) return;
    
    const newConfig = {
      id: Date.now() + Math.random(),
      reason: '',
      status: 'Pending',
      method: '',
      quantity: 1
    };
    onConfigurationsChange([...configurations, newConfig]);
  };

  // ======================= FUNCIONALIDAD: EDITAR CONFIGURACIÓN =======================
  
  /**
   * Actualiza una configuración existente.
   * @param {number} index - Índice de la configuración
   * @param {Object} updatedConfig - Datos actualizados
   */
  const handleConfigurationChange = (index, updatedConfig) => {
    const newConfigs = [...configurations];
    newConfigs[index] = updatedConfig;
    onConfigurationsChange(newConfigs);
  };

  // ======================= FUNCIONALIDAD: ELIMINAR CONFIGURACIÓN =======================
  
  /**
   * Elimina una configuración.
   * Si es la única configuración, elimina el producto completo.
   * @param {number} index - Índice de la configuración a eliminar
   */
  const handleConfigurationRemove = (index) => {
    if (configurations.length <= 1) {
      // If only one configuration remains, remove the entire product
      onRemove();
      return;
    }
    const newConfigs = configurations.filter((_, i) => i !== index);
    onConfigurationsChange(newConfigs);
  };

  return (
    <div className="border rounded-xl overflow-hidden transition-colors border-gray-300">
      {/* Header del card - información del producto */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f1f1f1]">
        {/* Botón para expandir/colapsar */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[#004D77] hover:text-[#003d61] transition cursor-pointer flex-shrink-0"
        >
          <ChevronLeft
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          />
        </button>
        
        {/* Checkbox para deseleccionar el producto */}
        <input
          type="checkbox"
          checked
          readOnly
          className="accent-[#004D77] w-4 h-4 cursor-pointer flex-shrink-0"
          onClick={onRemove}
        />
        
        {/* Imagen del producto */}
        <ProductImage src={product.image} size="sm" />
        
        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
          <p className="text-[11px] text-gray-500">
            Used: {totalQuantityUsed} of {maxTotalQuantity} | {configurations.length} configuration(s)
          </p>
        </div>
        
        {/* Valor total del producto */}
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-gray-400">Max total</p>
          <p className="text-xs font-bold text-gray-700">
            ${formatCOP(maxTotalQuantity * product.unitPrice)}
          </p>
        </div>
      </div>

      {/* Configuraciones expandibles */}
      {expanded && (
        <div className="bg-white px-3 py-2">
          {configurations.map((config, index) => (
            <ConfigurationItem
              key={config.id}
              config={config}
              index={index}
              total={configurations.length}
              onChange={handleConfigurationChange}
              onRemove={handleConfigurationRemove}
              product={product}
              maxQuantity={remainingQuantity + config.quantity}
              submitted={submitted}
            />
          ))}

          {/* Botón para agregar nueva configuración si hay cantidad disponible */}
          {remainingQuantity > 0 && (
            <button
              type="button"
              onClick={handleAddConfiguration}
              className="mt-3 w-full py-2 border border-dashed border-[#004D77] rounded-lg text-[#004D77] text-xs font-semibold hover:bg-[#004D77]/5 transition cursor-pointer"
            >
              + Add another configuration ({remainingQuantity} units remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SelectedProduct;