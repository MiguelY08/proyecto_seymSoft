import { X, Upload, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ProductsService from '../services/productsServices';

// ── PriceCard fuera del componente — evita re-montaje en cada keystroke ────────
function PriceCard({ label, fieldMain, fieldPaca, placeholderMain, placeholderPaca,
                     valueMain, valuePaca, onChange, errMain, errPaca }) {
  const block   = (e) => { if (['e','E','+','-','.'].includes(e.key)) e.preventDefault(); };
  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const hm = !!errMain, hp = !!errPaca;

  return (
    <div className={`rounded-lg overflow-hidden border ${hm || hp ? 'border-red-400' : 'border-gray-300'}`}>
      <div className="px-3 pt-2.5 pb-1 bg-white">
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
        </label>
        <input
          type="text" inputMode="numeric" name={fieldMain} value={valueMain}
          onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })}
          onKeyDown={block} placeholder={placeholderMain}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${
            hm ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
               : 'border-gray-200 focus:ring-blue-400 bg-gray-50'}`}
        />
        {hm && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><span></span>{errMain}</p>}
      </div>
      <div className={`h-px ${hp ? 'bg-red-300' : 'bg-gray-200'}`} />
      <div className={`px-3 pt-1.5 pb-2.5 ${hp ? 'bg-red-50' : 'bg-gray-50'}`}>
        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Descuento %
        </label>
        <input
          type="text" inputMode="numeric" name={fieldPaca} value={valuePaca}
          onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })}
          onKeyDown={block} placeholder={placeholderPaca}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${
            hp ? 'border-red-400 focus:ring-red-200 bg-white text-red-900 placeholder-red-300'
               : 'border-gray-200 focus:ring-blue-400 bg-white'}`}
        />
        {hp && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><span></span>{errPaca}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CATS_DISPONIBLES = ['Escolar', 'Oficina', 'Arte', 'Papelería Básica'];

const str = (v) => (v !== undefined && v !== null && v !== '') ? String(v) : '';

// ─────────────────────────────────────────────────────────────────────────────

const numeric = (v) => v.replace(/[^0-9]/g, '');
const block   = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };

// ─── EditProduct ──────────────────────────────────────────────────────────────
function EditProduct({ isOpen, onClose, onUpdate, producto }) {
  const { showSuccess, showError } = useAlert();

  const [formData, setFormData] = useState({
  nombre: '',
  codBarras: '',
  stockPrincipal: '',
  codsBarrasExtra: [],
  referencia: '',
  precioDetalle: '',
  precioMayorista: '',
  precioColegas: '',
  precioPacas: '',
  descripcion: '',
  cantidadXPaca: '',
  categorias: [],
  id_category: null,
  idUnitMeasure: 2,
  ivaPercentage: 0,
  retailDiscountPct: 0,
  wholesaleDiscountPct: 0,
  partnerDiscountPct: 0,
  bulkDiscountPct: 0,
});
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [errors, setErrors]               = useState({});
  const [priceErrors, setPriceErrors]     = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };
  loadCategories();
}, []);

useEffect(() => {
    if (producto && categories.length > 0) {
      setTimeout(() => {
        if (producto.categories && producto.categories.length > 0) {
          producto.categories.forEach(cat => {
            const checkbox = document.getElementById(`cat-${cat.id}`);
            if (checkbox) {
              checkbox.checked = true;
              setFormData(prev => ({...prev, id_category: cat.id}));
            }
          });
        }

        if (producto.subcategories && producto.subcategories.length > 0) {
          producto.subcategories.forEach(sub => {
            const checkbox = document.getElementById(`sub-${sub.id}`);
            if (checkbox) checkbox.checked = true;
          });
        }
      }, 100);
    }
  }, [producto, categories]);

useEffect(() => {
  if (!isOpen) return;

  const loadSubcategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories/subcategories');
      const data = await response.json();

      setSubcategories(data.data || []);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  };

  loadSubcategories();
}, [isOpen]);
  
  useEffect(() => {
  if (producto) {
    setImagenesActuales(producto.images || []);
    setFormData({
      nombre: producto.name || '',
      referencia: producto.reference || '',
      precioDetalle: producto.retailPrice || '',
      precioMayorista: producto.wholesalePrice || '',
      precioColegas: producto.partnerPrice || '',
      precioPacas: producto.bulkPrice || '',
      idUnitMeasure: producto.unitMeasure?.id || 2,
      ivaPercentage: producto.ivaPercentage || 0,
      retailDiscountPct: producto.retailDiscountPct || 0,
      wholesaleDiscountPct: producto.wholesaleDiscountPct || 0,
      partnerDiscountPct: producto.partnerDiscountPct || 0,
      bulkDiscountPct: producto.bulkDiscountPct || 0,
      descripcion: producto.description || '',
      cantidadXPaca: String(producto.quantityPerPack || 0),
      id_category: producto.category?.id || null,
      codBarras: producto.barcodes?.[0]?.barcode || '',
      stockPrincipal: producto.barcodes?.[0]?.stock || 0,
      codsBarrasExtra: producto.barcodes?.slice(1).map((b) => ({
      cod: b.barcode,
      stock: b.stock,
})) || [],
    });

    // ← CAMBIAR ESTO: Marcar solo las categorías asociadas (product_categories)
    if (producto.categories && producto.categories.length > 0) {
      setTimeout(() => {
        producto.categories.forEach(cat => {
          const checkbox = document.getElementById(`cat-${cat.id}`);
          if (checkbox) checkbox.checked = true;
        });
      }, 100);
    }

    // Marcar subcategorías seleccionadas
    if (producto.subcategories && producto.subcategories.length > 0) {
      setTimeout(() => {
        producto.subcategories.forEach(sub => {
          const checkbox = document.getElementById(`sub-${sub.id}`);
          if (checkbox) checkbox.checked = true;
        });
      }, 100);
    }
  }
}, [producto]);


  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const block   = (e) => { if (['e','E','+','-','.'].includes(e.key)) e.preventDefault(); };

  const calcStock = (d) => {
    const principal = Number(d.stockPrincipal) || 0;
    const extras    = (d.codsBarrasExtra || []).reduce((acc, e) => acc + (Number(e.stock) || 0), 0);
    return principal + extras;
  };

  const validate = (d) => {
    const e = {};
    if (!d.nombre?.trim()) e.nombre = 'El nombre del producto es obligatorio.';
    else if (d.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!d.codBarras?.trim()) e.codBarras = 'El código de barras es obligatorio.';
    if (!d.referencia?.trim()) e.referencia = 'La referencia es obligatoria.';
    if (d.stockPrincipal === '') e.stockPrincipal = 'El stock es obligatorio.';
    else if (!Number.isInteger(Number(d.stockPrincipal)) || Number(d.stockPrincipal) < 0) e.stockPrincipal = 'El stock debe ser un número entero mayor o igual a 0.';
    if (d.precioDetalle === '') e.precioDetalle = 'El precio detal es obligatorio.';
    else if (Number(d.precioDetalle) <= 0) e.precioDetalle = 'El precio detal debe ser mayor a 0.';
    if (d.precioMayorista === '') e.precioMayorista = 'El precio mayorista es obligatorio.';
    else if (Number(d.precioMayorista) <= 0) e.precioMayorista = 'El precio mayorista debe ser mayor a 0.';
    if (d.precioColegas === '') e.precioColegas = 'El precio colegas es obligatorio.';
    else if (Number(d.precioColegas) <= 0) e.precioColegas = 'El precio colegas debe ser mayor a 0.';
    if (d.precioPacas === '') e.precioPacas = 'El precio por pacas es obligatorio.';
    else if (Number(d.precioPacas) <= 0) e.precioPacas = 'El precio por pacas debe ser mayor a 0.';
    
  };

  const validatePrices = (d) => {
    const e   = {};
    const det = Number(d.precioDetalle),    may = Number(d.precioMayorista);
    const col = Number(d.precioColegas),     pac = Number(d.precioPacas);
    const dp  = Number(d.precioDetallePaca), mp  = Number(d.precioMayoristaPaca);
    const cp  = Number(d.precioColegasPaca), pp  = Number(d.precioPacasPaca);
    if (d.precioMayorista     && det && may >= det) e.precioMayorista     = 'Debe ser menor al precio detal.';
    if (d.precioColegas       && may && col >  may) e.precioColegas       = 'Debe ser menor o igual al precio mayorista.';
    if (d.precioDetallePaca   && det && dp  >= det) e.precioDetallePaca   = 'Debe ser menor al precio detal.';
    if (d.precioMayoristaPaca && may && mp  >= may) e.precioMayoristaPaca = 'Debe ser menor al precio mayorista.';
    if (d.precioColegasPaca   && col && cp  >= col) e.precioColegasPaca   = 'Debe ser menor al precio colegas.';
    if (d.precioPacasPaca     && pac && pp  >= pac) e.precioPacasPaca     = 'Debe ser menor al precio x pacas.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      const pf = ['precioDetalle','precioMayorista','precioColegas','precioPacas',
                  'precioDetallePaca','precioMayoristaPaca','precioColegasPaca','precioPacasPaca'];
      if (pf.includes(name)) setPriceErrors(validatePrices(next));
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCatChange = (cat) => {
    setFormData((prev) => {
      const cats = prev.categorias.includes(cat)
        ? prev.categorias.filter(c => c !== cat)
        : [...prev.categorias, cat];
      return { ...prev, categorias: cats };
    });
    if (errors.categorias) setErrors(p => ({ ...p, categorias: undefined }));
  };

  const handleImagenChange = (e) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  setImagenesNuevas(files);

  const previews = files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));

  setImagenPreview(previews);
};

  const handleAddCodBarras = () => {
    setFormData(p => ({ ...p, codsBarrasExtra: [...(p.codsBarrasExtra || []), { cod: '', stock: '' }] }));
  };

  const handleCodBarrasExtraChange = (index, field, value) => {
    setFormData(p => {
      const updated = [...(p.codsBarrasExtra || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...p, codsBarrasExtra: updated };
    });
  };

  const handleRemoveCodBarras = (index) => {
    setFormData(p => ({
      ...p,
      codsBarrasExtra: (p.codsBarrasExtra || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate(formData);
  const pe = validatePrices(formData);
  const all = { ...errs, ...pe };
  if (Object.keys(all).length > 0) {
    setErrors(all);
    setPriceErrors(pe);
    showError('Formulario incompleto', 'Revisa los campos marcados en rojo antes de continuar.');
    return;
  }

  // ← AGREGAR ESTO: Obtener categorías y subcategorías seleccionadas
  const selectedCategories = categories
    .filter(cat => document.getElementById(`cat-${cat.id}`)?.checked)
    .map(cat => cat.id);

  const selectedSubcategories = subcategories
    .filter(sub => document.getElementById(`sub-${sub.id}`)?.checked)
    .map(sub => sub.id);

  console.log('✅ selectedCategories:', selectedCategories);
  console.log('✅ selectedSubcategories:', selectedSubcategories);


  if (selectedCategories.length === 0) {
    showError('Categorías requeridas', 'Debes seleccionar al menos una categoría');
    return;
  }

  try {
    const saved = await ProductsService.update(producto.id, {
    nombre: formData.nombre,
    referencia: formData.referencia,
    idUnitMeasure: formData.idUnitMeasure,
    ivaPercentage: formData.ivaPercentage,
    retailDiscountPct: formData.retailDiscountPct,
    wholesaleDiscountPct: formData.wholesaleDiscountPct,
    partnerDiscountPct: formData.partnerDiscountPct,
    bulkDiscountPct: formData.bulkDiscountPct,
    descripcion: formData.descripcion,
    cantidadXPaca: Number(formData.cantidadXPaca),
    id_category: formData.id_category,
    codBarras: formData.codBarras,
    stock: Number(formData.stockPrincipal) || 0,
    codsBarrasExtra: formData.codsBarrasExtra || [],
    categories: selectedCategories,  // ← Así
    subcategories: selectedSubcategories,  // ← Así
    images: imagenesNuevas,
    });
    showSuccess('Producto actualizado', `"${saved.name}" fue actualizado correctamente.`);
    onUpdate?.(saved);
    onClose();
  } catch (error) {
    showError('Error', error.message || 'No se pudo actualizar el producto. Intenta de nuevo.');
  }
};

  const inputCls = (f) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      errors[f] ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                : 'border-gray-300 focus:ring-blue-500'}`;

  const ErrMsg = ({ field }) =>
    errors[field]
      ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors[field]}</p>
      : null;

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Editar producto</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Sección 1 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">1. Información General</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Imagen <span className="text-red-500">*</span></label>
                  <label className="block cursor-pointer">
                    <input
  type="file"
  accept="image/*"
  multiple onChange={handleImagenChange} className="hidden" />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#004D77] transition-colors min-h-[130px] flex items-center justify-center">
                      <div className="flex flex-wrap gap-2 justify-center">
  
  {/* Imágenes actuales */}
  {imagenesActuales.map((img) => (
    <img
      key={img.id}
      src={img.url}
      alt="Producto"
      className="w-20 h-20 object-cover rounded-lg border"
    />
  ))}

  {/* Nuevas previews */}
  {imagenPreview && imagenPreview.map((img, idx) => (
    <img
      key={idx}
      src={img.url}
      alt="Preview"
      className="w-20 h-20 object-cover rounded-lg border"
    />
  ))}

  {/* Placeholder */}
  {imagenesActuales.length === 0 &&
    (!imagenPreview || imagenPreview.length === 0) && (
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>

        <p
          className="text-[10px] text-white px-2 py-1 rounded-full"
          style={{ backgroundColor: '#004D77' }}
        >
          Agregar imágenes
        </p>
      </div>
  )}
</div>
                    </div>
                  </label>
                </div>

                {/* Categorías */}
<div>
  <label className="block text-xs font-medium text-gray-700 mb-1.5">
    Categorías <span className="text-red-500">*</span>
  </label>
  <div className={`border rounded-lg p-2.5 h-[200px] overflow-y-auto ${errors.categorias ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
    {categories && categories.length > 0 ? (
  categories.map((cat) => {
    const subsCat = subcategories.filter(sub => sub.categoryId === cat.id);
    
    return (
      <div key={cat.id} className="mb-3 last:mb-0">
        {/* Categoría padre */}
        <div className="flex items-center gap-1.5">
          <input 
  type="checkbox" 
  id={`cat-${cat.id}`} 
  className="w-3.5 h-3.5 text-blue-600 rounded"
/>
          <label htmlFor={`cat-${cat.id}`} className="flex-1 text-xs text-gray-700 font-semibold cursor-pointer">
            {cat.name}
          </label>
        </div>

        {/* Subcategorías - solo mostrar si esta categoría está seleccionada */}
        {subsCat.length > 0 && (
          <div className="ml-5 mt-1.5 space-y-1">
            {subsCat.map((sub) => (
              <div key={sub.id} className="flex items-center gap-1.5">
                <input 
                  type="checkbox" 
                  id={`sub-${sub.id}`} 
                  className="w-3 h-3 text-blue-600 rounded" 
                />
                <label htmlFor={`sub-${sub.id}`} className="text-xs text-gray-600 cursor-pointer">
                  {sub.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  })
) : (
  <p className="text-xs text-gray-400">Sin categorías disponibles</p>
)}
    
  </div>
  <ErrMsg field="categorias" />
</div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange}
                    placeholder="Descripción del producto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm h-[130px]" />
                </div>
              </div>
            </div>

            {/* Sección 2 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">2. Información del Producto</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange}
                    placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
                  <ErrMsg field="nombre" />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Código(s) de barras <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCodBarras}
                      title="Agregar otro código de barras"
                      className="flex items-center gap-1 text-xs font-medium text-white px-2 py-0.5 rounded-md transition-colors hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: '#004D77' }}
                    >
                      <Plus className="w-3 h-3" />
                      Agregar código
                    </button>
                  </div>

                  {/* Fila principal: codBarras + stockPrincipal */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        name="codBarras"
                        value={formData.codBarras || ''}
                        onChange={handleChange}
                        placeholder="Código de barras principal"
                        className={inputCls('codBarras')}
                      />
                      <ErrMsg field="codBarras" />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.stockPrincipal || ''}
                        onChange={(e) => {
                          const v = numeric(e.target.value);
                          setFormData(p => ({ ...p, stockPrincipal: v }));
                          if (errors.stockPrincipal) setErrors(p => ({ ...p, stockPrincipal: undefined }));
                        }}
                        onKeyDown={block}
                        placeholder="Stock"
                        className={inputCls('stockPrincipal')}
                      />
                      <ErrMsg field="stockPrincipal" />
                    </div>
                  </div>

                  {/* Filas adicionales dinámicas: cod + stock */}
                  {(formData.codsBarrasExtra || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={item.cod || ''}
                        onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)}
                        placeholder={`Código de barras ${i + 2}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.stock || ''}
                        onChange={(e) => handleCodBarrasExtraChange(i, 'stock', numeric(e.target.value))}
                        onKeyDown={block}
                        placeholder="Stock"
                        className="w-24 flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCodBarras(i)}
                        title="Eliminar este código"
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Referencia <span className="text-red-500">*</span></label>
                  <input type="text" name="referencia" value={formData.referencia || ''} onChange={handleChange}
                    placeholder="REF-001" className={inputCls('referencia')} />
                  <ErrMsg field="referencia" />
                </div>

                {/* Stock general — solo lectura, suma automática */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock general
                    <span className="ml-1 text-[10px] text-gray-400 font-normal">(calculado)</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={calcStock(formData)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad x paca</label>
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca || ''}
                    onChange={(e) => setFormData(p => ({ ...p, cantidadXPaca: numeric(e.target.value) }))}
                    onKeyDown={block} placeholder="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>

                <div>
  <label className="block text-xs font-medium text-gray-700 mb-1">
    Unidad de medida
  </label>

  <select
    name="idUnitMeasure"
    value={formData.idUnitMeasure}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
  >
    <option value={2}>Unidad</option>
    <option value={3}>Docena</option>
    <option value={4}>Caja</option>
    <option value={5}>Paca</option>
  </select>
</div>

<div>
  <label className="block text-xs font-medium text-gray-700 mb-1">
    IVA %
  </label>

  <input
    type="number"
    name="ivaPercentage"
    value={formData.ivaPercentage}
    onChange={handleChange}
    min="0"
    max="100"
    placeholder="19"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
  />
</div>
              </div>
            </div>
          </div>

          {/* Sección 3 */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">3. Configuración de Precios</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceCard
                    label="Precio Detal"
                    fieldMain="precioDetalle"
                    fieldPaca="retailDiscountPct"
                    valueMain={formData.precioDetalle || ''}
                    valuePaca={formData.retailDiscountPct || ''}
                    placeholderMain="5000"
                    placeholderPaca="0"
                    onChange={handleChange}
                  />

                  <PriceCard
                    label="Precio Mayorista"
                    fieldMain="precioMayorista"
                    fieldPaca="wholesaleDiscountPct"
                    valueMain={formData.precioMayorista || ''}
                    valuePaca={formData.wholesaleDiscountPct || ''}
                    placeholderMain="4000"
                    placeholderPaca="0"
                    onChange={handleChange}
                  />

                  <PriceCard
                    label="Precio Colegas"
                    fieldMain="precioColegas"
                    fieldPaca="partnerDiscountPct"
                    valueMain={formData.precioColegas || ''}
                    valuePaca={formData.partnerDiscountPct || ''}
                    placeholderMain="3500"
                    placeholderPaca="0"
                    onChange={handleChange}
                  />

                  <PriceCard
                    label="Precio X Pacas"
                    fieldMain="precioPacas"
                    fieldPaca="bulkDiscountPct"
                    valueMain={formData.precioPacas || ''}
                    valuePaca={formData.bulkDiscountPct || ''}
                    placeholderMain="3000"
                    placeholderPaca="0"
                    onChange={handleChange}
                  />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t mt-auto">
            <button type="submit"
              className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm cursor-pointer"
              style={{ backgroundColor: '#004D77' }}>
              Guardar cambios
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm cursor-pointer">
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProduct;