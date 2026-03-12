import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import { useAlert }          from '../../../../shared/alerts/useAlert';
import ProductsService       from '../services/productsServices';
import { useCategoryTree }   from '../../categories/services/useCategoryTree';
import PriceCard             from '../components/PriceCard';
import CategorySelector      from '../components/CategorySelector';
import { validate, validatePrices } from '../validators/productsValidators';

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY = {
  imagen: null, categorias: [], descripcion: '', nombre: '', codBarras: '',
  referencia: '', stock: '', cantidadXPaca: '',
  precioDetalle: '', precioDetallePaca: '', precioMayorista: '', precioMayoristaPaca: '',
  precioColegas: '', precioColegasPaca: '', precioPacas: '', precioPacasPaca: '',
};

const numeric = (v) => v.replace(/[^0-9]/g, '');
const block   = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };

// ─── CreateProduct ────────────────────────────────────────────────────────────
function CreateProduct({ isOpen, onClose, onCreate }) {
  const { showSuccess, showError } = useAlert();
  const cats = useCategoryTree(isOpen);

  const [formData,      setFormData]      = useState(EMPTY);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errors,        setErrors]        = useState({});
  const [priceErrors,   setPriceErrors]   = useState({});
  const [expandedCats,  setExpandedCats]  = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      const priceFields = ['precioDetalle','precioMayorista','precioColegas','precioPacas',
                           'precioDetallePaca','precioMayoristaPaca','precioColegasPaca','precioPacasPaca'];
      if (priceFields.includes(name)) setPriceErrors(validatePrices(next));
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCatChange = (cat) => {
    setFormData((prev) => {
      let selected = [...prev.categorias];
      if (selected.includes(cat)) {
        selected = selected.filter((c) => c !== cat && !c.startsWith(`${cat} > `));
      } else {
        selected.push(cat);
        if ((cats[cat] || []).length > 0) setExpandedCats((ex) => ({ ...ex, [cat]: true }));
      }
      return { ...prev, categorias: selected };
    });
    if (errors.categorias) setErrors((prev) => ({ ...prev, categorias: undefined }));
  };

  const handleSubChange = (cat, sub) => {
    setFormData((prev) => {
      let selected = [...prev.categorias];
      const full   = `${cat} > ${sub}`;
      if (!selected.includes(cat)) selected.push(cat);
      selected = selected.includes(full)
        ? selected.filter((c) => c !== full)
        : [...selected, full];
      return { ...prev, categorias: selected };
    });
  };

  const handleToggleExpand = (cat) => {
    setExpandedCats((ex) => ({ ...ex, [cat]: !ex[cat] }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((p) => ({ ...p, imagen: file }));
    if (errors.imagen) setErrors((p) => ({ ...p, imagen: undefined }));
    const r = new FileReader();
    r.onloadend = () => setImagenPreview(r.result);
    r.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData, { isCreating: true });
    const pe   = validatePrices(formData);
    const all  = { ...errs, ...pe };
    if (Object.keys(all).length > 0) {
      setErrors(all); setPriceErrors(pe);
      showError('Formulario incompleto', 'Revisa los campos marcados en rojo antes de continuar.');
      return;
    }
    try {
      const saved = ProductsService.create({ ...formData, imagen: imagenPreview });
      showSuccess('Producto creado', `"${saved.nombre}" fue agregado al catálogo correctamente.`);
      onCreate?.(saved);
      setFormData(EMPTY); setImagenPreview(null); setErrors({}); setPriceErrors({}); setExpandedCats({});
      onClose();
    } catch {
      showError('Error', 'No se pudo guardar el producto. Intenta de nuevo.');
    }
  };

  const inputCls = (f) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      errors[f]
        ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  const ErrMsg = ({ field }) =>
    errors[field]
      ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors[field]}</p>
      : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Crear producto</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Sección 1 — Información General */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">
                1. Información General
              </h4>
              <div className="grid grid-cols-3 gap-4">

                {/* Imagen */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Imagen <span className="text-red-500">*</span>
                  </label>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors min-h-130px flex items-center justify-center ${
                      errors.imagen ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-[#004D77]'
                    }`}>
                      {imagenPreview ? (
                        <img src={imagenPreview} alt="Preview" className="max-w-full max-h-28 object-contain rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${errors.imagen ? 'bg-red-100' : 'bg-gray-100'}`}>
                            <Upload className={`w-6 h-6 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <p className="text-[10px] text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#004D77' }}>
                            Agregar imagen
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                  <ErrMsg field="imagen" />
                </div>

                {/* Categorías */}
                <CategorySelector
                  cats={cats}
                  selected={formData.categorias}
                  expandedCats={expandedCats}
                  onCatChange={handleCatChange}
                  onSubChange={handleSubChange}
                  onToggleExpand={handleToggleExpand}
                  error={errors.categorias}
                  idPrefix="create-cat"
                />

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del producto..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm h-130px"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2 — Información del Producto */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">
                2. Información del Producto
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                    placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
                  <ErrMsg field="nombre" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Código de barras <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="codBarras" value={formData.codBarras} onChange={handleChange}
                    placeholder="123456789" className={inputCls('codBarras')} />
                  <ErrMsg field="codBarras" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Referencia <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="referencia" value={formData.referencia} onChange={handleChange}
                    placeholder="REF-001" className={inputCls('referencia')} />
                  <ErrMsg field="referencia" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" inputMode="numeric" name="stock" value={formData.stock}
                    onChange={(e) => { const v = numeric(e.target.value); setFormData((p) => ({ ...p, stock: v })); if (errors.stock) setErrors((p) => ({ ...p, stock: undefined })); }}
                    onKeyDown={block} placeholder="100" className={inputCls('stock')}
                  />
                  <ErrMsg field="stock" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad x paca</label>
                  <input
                    type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca}
                    onChange={(e) => setFormData((p) => ({ ...p, cantidadXPaca: numeric(e.target.value) }))}
                    onKeyDown={block} placeholder="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3 — Precios */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">
              3. Configuración de Precios
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceCard label="Precio Detal"     fieldMain="precioDetalle"   fieldPaca="precioDetallePaca"   valueMain={formData.precioDetalle}   valuePaca={formData.precioDetallePaca}   placeholderMain="5000" placeholderPaca="4500" onChange={handleChange} errMain={errors.precioDetalle    || priceErrors.precioDetalle}    errPaca={errors.precioDetallePaca  || priceErrors.precioDetallePaca} />
              <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="precioMayoristaPaca" valueMain={formData.precioMayorista} valuePaca={formData.precioMayoristaPaca} placeholderMain="4000" placeholderPaca="3500" onChange={handleChange} errMain={errors.precioMayorista   || priceErrors.precioMayorista}   errPaca={errors.precioMayoristaPaca || priceErrors.precioMayoristaPaca} />
              <PriceCard label="Precio Colegas"   fieldMain="precioColegas"   fieldPaca="precioColegasPaca"   valueMain={formData.precioColegas}   valuePaca={formData.precioColegasPaca}   placeholderMain="3500" placeholderPaca="3000" onChange={handleChange} errMain={errors.precioColegas    || priceErrors.precioColegas}    errPaca={errors.precioColegasPaca  || priceErrors.precioColegasPaca} />
              <PriceCard label="Precio X Pacas"   fieldMain="precioPacas"     fieldPaca="precioPacasPaca"     valueMain={formData.precioPacas}     valuePaca={formData.precioPacasPaca}     placeholderMain="3000" placeholderPaca="2500" onChange={handleChange} errMain={errors.precioPacas      || priceErrors.precioPacas}      errPaca={errors.precioPacasPaca    || priceErrors.precioPacasPaca} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-3 border-t mt-auto">
            <button type="submit"
              className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm cursor-pointer"
              style={{ backgroundColor: '#004D77' }}
            >
              Crear Producto
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;