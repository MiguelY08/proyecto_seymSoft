import { X, Upload, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ProductsService from '../services/productsServices';

// PriceCard fuera del componente para evitar re-montaje en cada keystroke
function PriceCard({ label, fieldMain, fieldPaca, placeholderMain, placeholderPaca,
                     valueMain, valuePaca, onChange, errMain, errPaca }) {
  const block   = (e) => { if (['e','E','+','-','.'].includes(e.key)) e.preventDefault(); };
  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const hm = !!errMain, hp = !!errPaca;
  return (
    <div className={`rounded-lg overflow-hidden border ${hm || hp ? 'border-red-400' : 'border-gray-300'}`}>
      <div className="px-3 pt-2.5 pb-1 bg-white">
        <label className="block text-xs font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
        <input type="text" inputMode="numeric" name={fieldMain} value={valueMain}
          onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })}
          onKeyDown={block} placeholder={placeholderMain}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hm ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-gray-50'}`} />
        {hm && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><span>⚠</span>{errMain}</p>}
      </div>
      <div className={`h-px ${hp ? 'bg-red-300' : 'bg-gray-200'}`} />
      <div className={`px-3 pt-1.5 pb-2.5 ${hp ? 'bg-red-50' : 'bg-gray-50'}`}>
        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Desc. x paca</label>
        <input type="text" inputMode="numeric" name={fieldPaca} value={valuePaca}
          onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })}
          onKeyDown={block} placeholder={placeholderPaca}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hp ? 'border-red-400 focus:ring-red-200 bg-white text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-white'}`} />
        {hp && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><span>⚠</span>{errPaca}</p>}
      </div>
    </div>
  );
}

const EMPTY = {
  imagen: null, categorias: [], descripcion: '', nombre: '',
  codBarras: '', stockPrincipal: '',
  codsBarrasExtra: [],
  referencia: '', cantidadXPaca: '',
  precioDetalle: '', precioDetallePaca: '', precioMayorista: '', precioMayoristaPaca: '',
  precioColegas: '', precioColegasPaca: '', precioPacas: '', precioPacasPaca: '',
};

const CATS = {
  'Escolar': ['Lapiceros', 'Morrales', 'Cuadernos'],
  'Oficina': ['Lapiceros', 'Marcadores'],
  'Arte': [],
  'Papelería Básica': [],
};

function CreateProduct({ isOpen, onClose, onCreate }) {
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData]           = useState(EMPTY);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errors, setErrors]               = useState({});
  const [priceErrors, setPriceErrors]     = useState({});
  const [expandedCats, setExpandedCats]   = useState({});

  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const block   = (e) => { if (['e','E','+','-','.'].includes(e.key)) e.preventDefault(); };

  const calcStock = (d) => {
    const principal = Number(d.stockPrincipal) || 0;
    const extras    = (d.codsBarrasExtra || []).reduce((acc, e) => acc + (Number(e.stock) || 0), 0);
    return principal + extras;
  };

  const validate = (d) => {
    const e = {};
    if (!d.imagen && !imagenPreview) e.imagen = 'Debes subir una imagen del producto.';
    if (!d.nombre.trim()) e.nombre = 'El nombre del producto es obligatorio.';
    else if (d.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!d.codBarras.trim()) e.codBarras = 'El código de barras es obligatorio.';
    if (d.stockPrincipal === '') e.stockPrincipal = 'El stock es obligatorio.';
    else if (!Number.isInteger(Number(d.stockPrincipal)) || Number(d.stockPrincipal) < 0) e.stockPrincipal = 'El stock debe ser un número entero mayor o igual a 0.';
    if (!d.referencia.trim()) e.referencia = 'La referencia es obligatoria.';
    if (d.precioDetalle === '') e.precioDetalle = 'El precio detal es obligatorio.';
    else if (Number(d.precioDetalle) <= 0) e.precioDetalle = 'El precio detal debe ser mayor a 0.';
    if (d.precioMayorista === '') e.precioMayorista = 'El precio mayorista es obligatorio.';
    else if (Number(d.precioMayorista) <= 0) e.precioMayorista = 'El precio mayorista debe ser mayor a 0.';
    if (d.precioColegas === '') e.precioColegas = 'El precio colegas es obligatorio.';
    else if (Number(d.precioColegas) <= 0) e.precioColegas = 'El precio colegas debe ser mayor a 0.';
    if (d.precioPacas === '') e.precioPacas = 'El precio por pacas es obligatorio.';
    else if (Number(d.precioPacas) <= 0) e.precioPacas = 'El precio por pacas debe ser mayor a 0.';
    if (d.categorias.length === 0) e.categorias = 'Debes seleccionar al menos una categoría.';
    return e;
  };

  const validatePrices = (d) => {
    const e = {};
    const det = Number(d.precioDetalle), may = Number(d.precioMayorista);
    const col = Number(d.precioColegas),  pac = Number(d.precioPacas);
    const dp  = Number(d.precioDetallePaca),   mp = Number(d.precioMayoristaPaca);
    const cp  = Number(d.precioColegasPaca),   pp = Number(d.precioPacasPaca);
    if (d.precioMayorista    && det && may >= det) e.precioMayorista    = 'Debe ser menor al precio detal.';
    if (d.precioColegas      && may && col >  may) e.precioColegas      = 'Debe ser menor o igual al precio mayorista.';
    if (d.precioDetallePaca  && det && dp  >= det) e.precioDetallePaca  = 'Debe ser menor al precio detal.';
    if (d.precioMayoristaPaca && may && mp >= may) e.precioMayoristaPaca = 'Debe ser menor al precio mayorista.';
    if (d.precioColegasPaca  && col && cp  >= col) e.precioColegasPaca  = 'Debe ser menor al precio colegas.';
    if (d.precioPacasPaca    && pac && pp  >= pac) e.precioPacasPaca    = 'Debe ser menor al precio x pacas.';
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
      let cats = [...prev.categorias];
      if (cats.includes(cat)) {
        cats = cats.filter(c => c !== cat && !(CATS[cat] || []).includes(c.split(' > ')[1]));
      } else {
        cats.push(cat);
        if (CATS[cat]?.length > 0) setExpandedCats(ex => ({ ...ex, [cat]: true }));
      }
      return { ...prev, categorias: cats };
    });
    if (errors.categorias) setErrors((prev) => ({ ...prev, categorias: undefined }));
  };

  const handleSubCatChange = (cat, sub) => {
    setFormData((prev) => {
      let cats = [...prev.categorias];
      const full = `${cat} > ${sub}`;
      if (!cats.includes(cat)) cats.push(cat);
      cats = cats.includes(full) ? cats.filter(c => c !== full) : [...cats, full];
      return { ...prev, categorias: cats };
    });
  };

  const handleAddCodBarras = () => {
    setFormData(p => ({ ...p, codsBarrasExtra: [...p.codsBarrasExtra, { cod: '', stock: '' }] }));
  };

  const handleCodBarrasExtraChange = (index, field, value) => {
    setFormData(p => {
      const updated = [...p.codsBarrasExtra];
      updated[index] = { ...updated[index], [field]: value };
      return { ...p, codsBarrasExtra: updated };
    });
  };

  const handleRemoveCodBarras = (index) => {
    setFormData(p => ({
      ...p,
      codsBarrasExtra: p.codsBarrasExtra.filter((_, i) => i !== index),
    }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(p => ({ ...p, imagen: file }));
    if (errors.imagen) setErrors(p => ({ ...p, imagen: undefined }));
    const r = new FileReader();
    r.onloadend = () => setImagenPreview(r.result);
    r.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    const pe   = validatePrices(formData);
    const all  = { ...errs, ...pe };
    if (Object.keys(all).length > 0) {
      setErrors(all); setPriceErrors(pe);
      showError('Formulario incompleto', 'Revisa los campos marcados en rojo antes de continuar.');
      return;
    }
    try {
      const saved = ProductsService.create({ ...formData, imagen: imagenPreview, stock: calcStock(formData) });
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
      errors[f] ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-300 focus:ring-blue-500'
    }`;
  const ErrMsg = ({ field }) => errors[field]
    ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors[field]}</p> : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Crear producto</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Sección 1 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">1. Información General</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Imagen */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Imagen <span className="text-red-500">*</span></label>
                  <label className="block cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors min-h-[130px] flex items-center justify-center ${errors.imagen ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-[#004D77]'}`}>
                      {imagenPreview
                        ? <img src={imagenPreview} alt="Preview" className="max-w-full max-h-28 object-contain rounded-lg" />
                        : <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${errors.imagen ? 'bg-red-100' : 'bg-gray-100'}`}>
                              <Upload className={`w-6 h-6 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                            </div>
                            <p className="text-[10px] text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#004D77' }}>Agregar imagen</p>
                          </div>
                      }
                    </div>
                  </label>
                  <ErrMsg field="imagen" />
                </div>
                {/* Categorías */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Categorías <span className="text-red-500">*</span></label>
                  <div className={`border rounded-lg p-2.5 h-[130px] overflow-y-auto ${errors.categorias ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                    {Object.keys(CATS).map((cat) => (
                      <div key={cat} className="mb-1.5 last:mb-0">
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" id={`cat-${cat}`} checked={formData.categorias.includes(cat)} onChange={() => handleCatChange(cat)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                          <label htmlFor={`cat-${cat}`} className="flex-1 text-xs text-gray-700 font-medium cursor-pointer">{cat}</label>
                          {CATS[cat].length > 0 && (
                            <button type="button" onClick={() => setExpandedCats(ex => ({ ...ex, [cat]: !ex[cat] }))} className="text-gray-400 hover:text-gray-600">
                              {expandedCats[cat] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                        {expandedCats[cat] && CATS[cat].length > 0 && (
                          <div className="ml-5 mt-1 space-y-1">
                            {CATS[cat].map(sub => (
                              <div key={sub} className="flex items-center gap-1.5">
                                <input type="checkbox" id={`sub-${cat}-${sub}`} checked={formData.categorias.includes(`${cat} > ${sub}`)} onChange={() => handleSubCatChange(cat, sub)} disabled={!formData.categorias.includes(cat)} className="w-3 h-3 text-blue-600 rounded disabled:opacity-50" />
                                <label htmlFor={`sub-${cat}-${sub}`} className={`text-xs cursor-pointer ${!formData.categorias.includes(cat) ? 'text-gray-400' : 'text-gray-600'}`}>{sub}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <ErrMsg field="categorias" />
                </div>
                {/* Descripción */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción del producto..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm h-[130px]" />
                </div>
              </div>
            </div>

            {/* Sección 2 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">2. Información del Producto</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
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
                        value={formData.codBarras}
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
                        value={formData.stockPrincipal}
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
                  {formData.codsBarrasExtra.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={item.cod}
                        onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)}
                        placeholder={`Código de barras ${i + 2}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.stock}
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
                  <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="REF-001" className={inputCls('referencia')} />
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
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca}
                    onChange={(e) => setFormData(p => ({ ...p, cantidadXPaca: numeric(e.target.value) }))}
                    onKeyDown={block} placeholder="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3 */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">3. Configuración de Precios</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceCard label="Precio Detal"     fieldMain="precioDetalle"   fieldPaca="precioDetallePaca"   valueMain={formData.precioDetalle}   valuePaca={formData.precioDetallePaca}   placeholderMain="5000" placeholderPaca="4500" onChange={handleChange} errMain={errors.precioDetalle    || priceErrors.precioDetalle}    errPaca={errors.precioDetallePaca  || priceErrors.precioDetallePaca} />
              <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="precioMayoristaPaca" valueMain={formData.precioMayorista} valuePaca={formData.precioMayoristaPaca} placeholderMain="4000" placeholderPaca="3500" onChange={handleChange} errMain={errors.precioMayorista   || priceErrors.precioMayorista}   errPaca={errors.precioMayoristaPaca || priceErrors.precioMayoristaPaca} />
              <PriceCard label="Precio Colegas"   fieldMain="precioColegas"   fieldPaca="precioColegasPaca"   valueMain={formData.precioColegas}   valuePaca={formData.precioColegasPaca}   placeholderMain="3500" placeholderPaca="3000" onChange={handleChange} errMain={errors.precioColegas    || priceErrors.precioColegas}    errPaca={errors.precioColegasPaca  || priceErrors.precioColegasPaca} />
              <PriceCard label="Precio X Pacas"   fieldMain="precioPacas"     fieldPaca="precioPacasPaca"     valueMain={formData.precioPacas}     valuePaca={formData.precioPacasPaca}     placeholderMain="3000" placeholderPaca="2500" onChange={handleChange} errMain={errors.precioPacas      || priceErrors.precioPacas}      errPaca={errors.precioPacasPaca    || priceErrors.precioPacasPaca} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-3 border-t mt-auto">
            <button type="submit" className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm cursor-pointer" style={{ backgroundColor: '#004D77' }}>Crear Producto</button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm cursor-pointer">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;