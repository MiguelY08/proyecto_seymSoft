import { X, Upload, Plus, ImagePlus, Trash2, Ruler, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ProductsService from '../services/productsServices';
import CategorySelector from '../components/CategorySelector';
import FormSelect from '../../../../shared/FormSelect';

function PriceCard({ label, fieldMain, fieldPaca, valueMain, valuePaca, placeholderMain, placeholderPaca, onChange, errMain, errPaca }) {
  const block = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };
  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const hm = !!errMain;
  const hp = !!errPaca;

  return (
    <div className={`rounded-lg overflow-hidden border ${hm || hp ? 'border-red-400' : 'border-gray-300'}`}>
      <div className="px-3 pt-2.5 pb-1 bg-white">
        <label className="block text-xs font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
        <input type="text" inputMode="numeric" name={fieldMain} value={valueMain} onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })} onKeyDown={block} placeholder={placeholderMain} className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hm ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-gray-50'}`} />
        {hm && <p className="mt-0.5 text-[10px] text-red-500">{errMain}</p>}
      </div>
      <div className={`h-px ${hp ? 'bg-red-300' : 'bg-gray-200'}`} />
      <div className={`px-3 pt-1.5 pb-2.5 ${hp ? 'bg-red-50' : 'bg-gray-50'}`}>
        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Descuento %</label>
        <input type="text" inputMode="numeric" name={fieldPaca} value={valuePaca} onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })} onKeyDown={block} placeholder={placeholderPaca} className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hp ? 'border-red-400 focus:ring-red-200 bg-white text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-white'}`} />
        {hp && <p className="mt-0.5 text-[10px] text-red-500">{errPaca}</p>}
      </div>
    </div>
  );
}

const initialForm = {
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
  id_category: null,
  idUnitMeasure: '',
  ivaPercentage: 0,
  retailDiscountPct: 0,
  wholesaleDiscountPct: 0,
  partnerDiscountPct: 0,
  bulkDiscountPct: 0,
};

function EditProduct({ isOpen, onClose, onUpdate, producto }) {
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState(initialForm);
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);
  const [errors, setErrors] = useState({});
  const [priceErrors, setPriceErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [unitMeasures, setUnitMeasures] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState({});
  const imageInputRef = useRef(null);
  const unitMeasureOptions = [
    { value: '', label: 'Selecciona una unidad' },
    ...unitMeasures.map((unit) => ({
      value: String(unit.id),
      label: `${unit.name} (${unit.abbreviation})`,
    })),
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        console.error('Error al cargar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const loadSubcategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories/subcategories');
        const data = await response.json();
        setSubcategories(data.data || []);
      } catch (error) {
        console.error('Error al cargar subcategorias:', error);
      }
    };
    loadSubcategories();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const loadUnitMeasures = async () => {
      try {
        const units = await ProductsService.listUnitMeasures();
        setUnitMeasures(units);
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error);
        setUnitMeasures([]);
      }
    };
    loadUnitMeasures();
  }, [isOpen]);

  useEffect(() => {
    if (!producto) return;

    const categoryIds = (producto.categories || []).map((cat) => Number(cat.id));
    const subcategoryIds = (producto.subcategories || []).map((sub) => Number(sub.id));
    const expanded = {};
    categoryIds.forEach((id) => { expanded[id] = true; });

    setImagenesActuales(producto.images || []);
    setImagenesNuevas([]);
    setSelectedCategoryIds(categoryIds);
    setSelectedSubcategoryIds(subcategoryIds);
    setExpandedCategoryIds(expanded);
    setFormData({
      nombre: producto.name || '',
      referencia: producto.reference || '',
      precioDetalle: producto.retailPrice || '',
      precioMayorista: producto.wholesalePrice || '',
      precioColegas: producto.partnerPrice || '',
      precioPacas: producto.bulkPrice || '',
      idUnitMeasure: producto.unitMeasure?.id || '',
      ivaPercentage: producto.ivaPercentage || 0,
      retailDiscountPct: producto.retailDiscountPct || 0,
      wholesaleDiscountPct: producto.wholesaleDiscountPct || 0,
      partnerDiscountPct: producto.partnerDiscountPct || 0,
      bulkDiscountPct: producto.bulkDiscountPct || 0,
      descripcion: producto.description || '',
      cantidadXPaca: String(producto.quantityPerPack || 0),
      id_category: categoryIds[0] || null,
      codBarras: producto.barcodes?.[0]?.barcode || '',
      stockPrincipal: producto.barcodes?.[0]?.stock || 0,
      codsBarrasExtra: producto.barcodes?.slice(1).map((b) => ({ id: b.id, cod: b.barcode, stock: b.stock })) || [],
    });
    setErrors({});
    setPriceErrors({});
  }, [producto]);

  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const block = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };

  const calcStock = (d) => {
    const principal = Number(d.stockPrincipal) || 0;
    const extras = (d.codsBarrasExtra || []).reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
    return principal + extras;
  };

  const validatePrices = (d) => {
    const e = {};
    const det = Number(d.precioDetalle);
    const may = Number(d.precioMayorista);
    const col = Number(d.precioColegas);

    if (d.precioMayorista && det && may >= det) e.precioMayorista = 'Debe ser menor al precio detal.';
    if (d.precioColegas && may && col > may) e.precioColegas = 'Debe ser menor o igual al precio mayorista.';
    return e;
  };

  const validate = (d) => {
    const e = {};
    if (selectedCategoryIds.length === 0) e.categorias = 'Debes seleccionar al menos una categoria.';
    if (!d.idUnitMeasure) e.idUnitMeasure = 'Selecciona una unidad de medida.';
    if (!d.nombre?.trim()) e.nombre = 'El nombre del producto es obligatorio.';
    else if (d.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!d.codBarras?.trim()) e.codBarras = 'El codigo de barras es obligatorio.';
    else if (d.codBarras.trim().length < 8) e.codBarras = 'El codigo de barras debe tener minimo 8 caracteres.';
    if (d.referencia === '') e.referencia = 'La referencia es obligatoria.';
    if (d.stockPrincipal === '') e.stockPrincipal = 'El stock es obligatorio.';
    else if (!Number.isInteger(Number(d.stockPrincipal)) || Number(d.stockPrincipal) < 0) e.stockPrincipal = 'El stock debe ser un numero entero mayor o igual a 0.';
    if (d.precioDetalle === '') e.precioDetalle = 'El precio detal es obligatorio.';
    else if (Number(d.precioDetalle) <= 0) e.precioDetalle = 'El precio detal debe ser mayor a 0.';
    if (d.precioMayorista === '') e.precioMayorista = 'El precio mayorista es obligatorio.';
    else if (Number(d.precioMayorista) <= 0) e.precioMayorista = 'El precio mayorista debe ser mayor a 0.';
    if (d.precioColegas !== '' && Number(d.precioColegas) <= 0) e.precioColegas = 'El precio colegas debe ser mayor a 0.';
    if (d.precioPacas !== '' && Number(d.precioPacas) <= 0) e.precioPacas = 'El precio por pacas debe ser mayor a 0.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      setPriceErrors(validatePrices(next));
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCatChange = (cat) => {
    const catId = Number(cat.id);
    setSelectedCategoryIds((prev) => {
      if (!prev.includes(catId)) return [...prev, catId];
      setSelectedSubcategoryIds((subPrev) =>
        subPrev.filter((subId) => {
          const sub = subcategories.find((item) => Number(item.id) === Number(subId));
          return Number(sub?.categoryId) !== catId;
        }),
      );
      return prev.filter((id) => id !== catId);
    });
    setFormData((prev) => ({ ...prev, id_category: catId }));
    if (errors.categorias) setErrors((prev) => ({ ...prev, categorias: undefined }));
  };

  const handleSubCatChange = (sub) => {
    const subId = Number(sub.id);
    const catId = Number(sub.categoryId);
    setSelectedSubcategoryIds((prev) => (prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]));
    setSelectedCategoryIds((prev) => (prev.includes(catId) ? prev : [...prev, catId]));
    setFormData((prev) => ({ ...prev, id_category: catId }));
    if (errors.categorias) setErrors((prev) => ({ ...prev, categorias: undefined }));
  };

  const handleToggleCategoryExpand = (catId) => {
    setExpandedCategoryIds((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImagenesNuevas((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleAddCodBarras = () => {
    setFormData((prev) => ({ ...prev, codsBarrasExtra: [...(prev.codsBarrasExtra || []), { cod: '', stock: '' }] }));
  };

  const handleCodBarrasExtraChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.codsBarrasExtra || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, codsBarrasExtra: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const all = { ...validate(formData), ...validatePrices(formData) };

    if (Object.keys(all).length > 0) {
      setErrors(all);
      setPriceErrors(validatePrices(formData));
      showError('Formulario incompleto', 'Revisa los campos marcados en rojo antes de continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      const saved = await ProductsService.update(producto.id, {
        nombre: formData.nombre,
        referencia: formData.referencia,
        precioDetalle: formData.precioDetalle,
        precioMayorista: formData.precioMayorista,
        precioColegas: formData.precioColegas,
        precioPacas: formData.precioPacas,
        idUnitMeasure: formData.idUnitMeasure,
        ivaPercentage: formData.ivaPercentage,
        retailDiscountPct: formData.retailDiscountPct,
        wholesaleDiscountPct: formData.wholesaleDiscountPct,
        partnerDiscountPct: formData.partnerDiscountPct,
        bulkDiscountPct: formData.bulkDiscountPct,
        descripcion: formData.descripcion,
        cantidadXPaca: Number(formData.cantidadXPaca),
        id_category: formData.id_category || selectedCategoryIds[0],
        codBarras: formData.codBarras,
        stock: Number(formData.stockPrincipal) || 0,
        codsBarrasExtra: formData.codsBarrasExtra || [],
        categories: selectedCategoryIds,
        subcategories: selectedSubcategoryIds,
        images: imagenesNuevas,
      });
      showSuccess('Producto actualizado', `"${saved.name}" fue actualizado correctamente.`);
      onUpdate?.(saved);
      onClose();
    } catch (error) {
      showError('Error', error.message || 'No se pudo actualizar el producto. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      errors[field] ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-300 focus:ring-blue-500'
    }`;
  const ErrMsg = ({ field }) => errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="bg-white rounded-xl w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Editar producto</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">1. Informacion General</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700">Imagenes</label>
                    <span className="text-[10px] font-medium text-gray-500">{imagenesActuales.length + imagenesNuevas.length} visible{imagenesActuales.length + imagenesNuevas.length !== 1 ? 's' : ''}</span>
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImagenChange} className="hidden" />
                  <div className="border border-gray-300 rounded-lg p-3 min-h-[200px] flex flex-col gap-3 bg-white">
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#004D77' }}>
                      <ImagePlus className="w-4 h-4" />
                      Agregar imagenes
                    </button>

                    {imagenesActuales.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Actuales</p>
                        <div className="grid grid-cols-2 gap-2">
                          {imagenesActuales.map((img) => (
                            <img key={img.id || img.url} src={img.url} alt="Producto" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          ))}
                        </div>
                      </div>
                    )}

                    {imagenesNuevas.length > 0 && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Nuevas por guardar</p>
                        <div className="grid grid-cols-2 gap-2">
                          {imagenesNuevas.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="relative rounded-lg border border-gray-200 overflow-hidden">
                              <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover" />
                              <button type="button" onClick={() => setImagenesNuevas((prev) => prev.filter((_, i) => i !== idx))} title="Quitar imagen nueva" className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {imagenesActuales.length === 0 && imagenesNuevas.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-xs font-medium text-gray-600">No hay imagenes asociadas</p>
                        <p className="text-[10px] text-gray-400">Agrega nuevas imagenes con el boton superior.</p>
                      </div>
                    )}
                  </div>
                </div>

                <CategorySelector
                  categories={categories}
                  subcategories={subcategories}
                  selectedCategoryIds={selectedCategoryIds}
                  selectedSubcategoryIds={selectedSubcategoryIds}
                  expandedCategoryIds={expandedCategoryIds}
                  onCategoryChange={handleCatChange}
                  onSubcategoryChange={handleSubCatChange}
                  onToggleExpand={handleToggleCategoryExpand}
                  error={errors.categorias}
                  idPrefix="edit-product"
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripcion <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} placeholder="Descripcion del producto..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm h-[200px]" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">2. Informacion del Producto</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
                  <ErrMsg field="nombre" />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">Codigo(s) de barras <span className="text-red-500">*</span></label>
                    <button type="button" onClick={handleAddCodBarras} className="flex items-center gap-1 text-xs font-medium text-white px-2 py-0.5 rounded-md transition-colors hover:opacity-90 cursor-pointer" style={{ backgroundColor: '#004D77' }}>
                      <Plus className="w-3 h-3" />
                      Agregar codigo
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input type="text" name="codBarras" value={formData.codBarras || ''} onChange={handleChange} placeholder="Codigo de barras principal" className={inputCls('codBarras')} />
                      <ErrMsg field="codBarras" />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <input type="text" inputMode="numeric" value={formData.stockPrincipal || ''} onChange={(e) => setFormData((prev) => ({ ...prev, stockPrincipal: numeric(e.target.value) }))} onKeyDown={block} placeholder="Stock" className={inputCls('stockPrincipal')} />
                      <ErrMsg field="stockPrincipal" />
                    </div>
                  </div>
                  {(formData.codsBarrasExtra || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <input type="text" value={item.cod || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)} placeholder={`Codigo de barras ${i + 2}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <input type="text" inputMode="numeric" value={item.stock || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'stock', numeric(e.target.value))} onKeyDown={block} placeholder="Stock" className="w-24 flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, codsBarrasExtra: (prev.codsBarrasExtra || []).filter((_, idx) => idx !== i) }))} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Referencia <span className="text-red-500">*</span></label>
                  <input type="text" name="referencia" value={formData.referencia || ''} onChange={handleChange} placeholder="REF-001" className={inputCls('referencia')} />
                  <ErrMsg field="referencia" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock general <span className="ml-1 text-[10px] text-gray-400 font-normal">(calculado)</span></label>
                  <input type="text" readOnly value={calcStock(formData)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad x paca</label>
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca || ''} onChange={(e) => setFormData((prev) => ({ ...prev, cantidadXPaca: numeric(e.target.value) }))} onKeyDown={block} placeholder="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unidad de medida <span className="text-red-500">*</span></label>
                  <FormSelect
                    value={formData.idUnitMeasure}
                    options={unitMeasureOptions}
                    onChange={(value) => handleChange({ target: { name: 'idUnitMeasure', value } })}
                    icon={Ruler}
                    error={errors.idUnitMeasure}
                    placeholder="Selecciona una unidad"
                    ariaLabel="Unidad de medida"
                  />
                  <ErrMsg field="idUnitMeasure" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">IVA %</label>
                  <input type="number" name="ivaPercentage" value={formData.ivaPercentage} onChange={handleChange} min="0" max="100" placeholder="19" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">3. Configuracion de Precios</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <PriceCard label="Precio Detal" fieldMain="precioDetalle" fieldPaca="retailDiscountPct" valueMain={formData.precioDetalle || ''} valuePaca={formData.retailDiscountPct || ''} placeholderMain="5000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioDetalle || priceErrors.precioDetalle} />
              <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="wholesaleDiscountPct" valueMain={formData.precioMayorista || ''} valuePaca={formData.wholesaleDiscountPct || ''} placeholderMain="4000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioMayorista || priceErrors.precioMayorista} />
              <PriceCard label="Precio Colegas" fieldMain="precioColegas" fieldPaca="partnerDiscountPct" valueMain={formData.precioColegas || ''} valuePaca={formData.partnerDiscountPct || ''} placeholderMain="3500" placeholderPaca="0" onChange={handleChange} errMain={errors.precioColegas || priceErrors.precioColegas} />
              <PriceCard label="Precio X Pacas" fieldMain="precioPacas" fieldPaca="bulkDiscountPct" valueMain={formData.precioPacas || ''} valuePaca={formData.bulkDiscountPct || ''} placeholderMain="3000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioPacas || priceErrors.precioPacas} />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t mt-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ backgroundColor: '#004D77' }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Cargando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm cursor-pointer">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
