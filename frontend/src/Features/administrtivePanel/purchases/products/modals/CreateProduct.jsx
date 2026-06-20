import { X, Upload, Plus, ImagePlus, Trash2, Ruler, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert';
import ProductsService from '../services/productsServices';
import CategorySelector from '../components/CategorySelector';
import FormSelect from '../../../../shared/FormSelect';
import {
  ScannerStatus,
  findProductBarcodeOwner,
  getDuplicateBarcodesInValues,
  normalizeBarcode,
  useBarcodeScanner,
} from '../../../../shared/scanner';

function PriceCard({ label, fieldMain, fieldPaca, valueMain, valuePaca, placeholderMain, placeholderPaca, onChange, errMain, errPaca }) {
  const block = (e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); };
  const numeric = (v) => v.replace(/[^0-9]/g, '');
  const hm = !!errMain;
  const hp = !!errPaca;

  return (
    <div className={`rounded-lg overflow-hidden border ${hm || hp ? 'border-red-400' : 'border-gray-300'}`}>
      <div className="px-3 pt-2.5 pb-1 bg-white">
        <label className="block text-xs font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
        <input
          type="text"
          inputMode="numeric"
          name={fieldMain}
          value={valueMain}
          onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })}
          onKeyDown={block}
          placeholder={placeholderMain}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hm ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-gray-50'}`}
        />
        {hm && <p className="mt-0.5 text-[10px] text-red-500">{errMain}</p>}
      </div>
      <div className={`h-px ${hp ? 'bg-red-300' : 'bg-gray-200'}`} />
      <div className={`px-3 pt-1.5 pb-2.5 ${hp ? 'bg-red-50' : 'bg-gray-50'}`}>
        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Descuento %</label>
        <input
          type="text"
          inputMode="numeric"
          name={fieldPaca}
          value={valuePaca}
          onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })}
          onKeyDown={block}
          placeholder={placeholderPaca}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${hp ? 'border-red-400 focus:ring-red-200 bg-white text-red-900 placeholder-red-300' : 'border-gray-200 focus:ring-blue-400 bg-white'}`}
        />
        {hp && <p className="mt-0.5 text-[10px] text-red-500">{errPaca}</p>}
      </div>
    </div>
  );
}

const EMPTY = {
  descripcion: '',
  nombre: '',
  codBarras: '',
  stockPrincipal: '',
  codsBarrasExtra: [],
  referencia: '',
  cantidadXPaca: '',
  precioDetalle: '',
  precioMayorista: '',
  precioColegas: '',
  precioPacas: '',
  idUnitMeasure: '',
  ivaPercentage: 0,
  retailDiscountPct: 0,
  wholesaleDiscountPct: 0,
  partnerDiscountPct: 0,
  bulkDiscountPct: 0,
  id_category: null,
};

function CreateProduct({ isOpen, onClose, onCreate, existingProducts = [] }) {
  const { showSuccess, showError } = useAlert();
  const [formData, setFormData] = useState(EMPTY);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [priceErrors, setPriceErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [unitMeasures, setUnitMeasures] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState({});
  const [activeBarcodeTarget, setActiveBarcodeTarget] = useState({ type: 'main', index: null });
  const [scannerMessage, setScannerMessage] = useState(null);
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
  }, []);

  useEffect(() => {
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
  }, []);

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

  const getFormBarcodeValues = (data = formData) => [
    data.codBarras,
    ...(data.codsBarrasExtra || []).map((item) => item?.cod),
  ];

  const getBarcodeConflictMessage = (code) => {
    const owner = findProductBarcodeOwner(existingProducts, code);
    if (!owner) return '';

    return owner.productName
      ? `El codigo de barras ya esta registrado en "${owner.productName}".`
      : 'El codigo de barras ya esta registrado en otro producto.';
  };

  const getInternalDuplicateMessage = (values = getFormBarcodeValues()) => {
    const duplicates = getDuplicateBarcodesInValues(values);
    if (duplicates.length === 0) return '';

    return `Hay codigos repetidos en el formulario: ${duplicates.join(', ')}.`;
  };

  const getFormBarcodeValuesWithoutActiveTarget = () => {
    const values = getFormBarcodeValues();
    if (activeBarcodeTarget.type === 'main') return values.slice(1);

    const extraPosition = activeBarcodeTarget.index + 1;
    return values.filter((_, index) => index !== extraPosition);
  };

  const validate = (d) => {
    const e = {};
    if (imagenesPreview.length === 0) e.imagen = 'Debes agregar al menos una imagen.';
    if (selectedCategoryIds.length === 0) e.categorias = 'Debes seleccionar al menos una categoria.';
    if (!d.idUnitMeasure) e.idUnitMeasure = 'Selecciona una unidad de medida.';
    if (!d.nombre.trim()) e.nombre = 'El nombre del producto es obligatorio.';
    else if (d.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!d.codBarras.trim()) e.codBarras = 'El codigo de barras es obligatorio.';
    else if (d.codBarras.trim().length < 8) e.codBarras = 'El codigo de barras debe tener minimo 8 caracteres.';
    else {
      const conflictMessage = getBarcodeConflictMessage(d.codBarras);
      if (conflictMessage) e.codBarras = conflictMessage;
    }
    const duplicateMessage = getInternalDuplicateMessage(getFormBarcodeValues(d));
    if (duplicateMessage) e.codsBarrasExtra = duplicateMessage;
    const extraConflict = (d.codsBarrasExtra || [])
      .map((item) => item?.cod)
      .filter(Boolean)
      .map((code) => getBarcodeConflictMessage(code))
      .find(Boolean);
    if (extraConflict) e.codsBarrasExtra = extraConflict;
    if (d.stockPrincipal === '') e.stockPrincipal = 'El stock es obligatorio.';
    else if (!Number.isInteger(Number(d.stockPrincipal)) || Number(d.stockPrincipal) < 0) e.stockPrincipal = 'El stock debe ser un numero entero mayor o igual a 0.';
    if (!d.referencia.trim()) e.referencia = 'La referencia es obligatoria.';
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

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImagenesPreview((prev) => [...prev, ...files]);
    e.target.value = '';
    if (errors.imagen) setErrors((prev) => ({ ...prev, imagen: undefined }));
  };

  const handleAddCodBarras = () => {
    const nextIndex = formData.codsBarrasExtra.length;
    setActiveBarcodeTarget({ type: 'extra', index: nextIndex });
    setFormData((prev) => ({ ...prev, codsBarrasExtra: [...prev.codsBarrasExtra, { cod: '', stock: '' }] }));
  };

  const handleCodBarrasExtraChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.codsBarrasExtra];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, codsBarrasExtra: updated };
    });
  };

  const applyScannedBarcode = (code) => {
    const normalizedCode = normalizeBarcode(code, { numericOnly: true });
    const internalDuplicate = getFormBarcodeValuesWithoutActiveTarget()
      .map((value) => normalizeBarcode(value))
      .filter(Boolean)
      .includes(normalizedCode);
    const conflictMessage = getBarcodeConflictMessage(normalizedCode);

    if (conflictMessage || internalDuplicate) {
      const message = conflictMessage || 'Este codigo ya esta en el formulario.';
      setScannerMessage({ type: 'error', message });
      if (activeBarcodeTarget.type === 'main') {
        setErrors((prev) => ({ ...prev, codBarras: message }));
      } else {
        setErrors((prev) => ({ ...prev, codsBarrasExtra: message }));
      }
      return;
    }

    if (activeBarcodeTarget.type === 'extra' && formData.codsBarrasExtra[activeBarcodeTarget.index]) {
      handleCodBarrasExtraChange(activeBarcodeTarget.index, 'cod', normalizedCode);
      if (errors.codsBarrasExtra) setErrors((prev) => ({ ...prev, codsBarrasExtra: undefined }));
      setScannerMessage({ type: 'success', message: `Codigo extra ${activeBarcodeTarget.index + 2}: ${normalizedCode}` });
      return;
    }

    setFormData((prev) => ({ ...prev, codBarras: normalizedCode }));
    if (errors.codBarras) setErrors((prev) => ({ ...prev, codBarras: undefined }));
    setActiveBarcodeTarget({ type: 'main', index: null });
    setScannerMessage({ type: 'success', message: `Codigo principal: ${normalizedCode}` });
  };

  useBarcodeScanner({
    enabled: isOpen && !isSubmitting,
    numericOnly: true,
    minLength: 6,
    maxLength: 20,
    scannerFields: ['product-barcode-main', 'product-barcode-extra'],
    duplicateDelayMs: 800,
    preventTerminatorDefault: true,
    onScan: ({ code }) => applyScannedBarcode(code),
  });

  useEffect(() => {
    if (!scannerMessage) return undefined;

    const timeout = window.setTimeout(() => {
      setScannerMessage(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [scannerMessage]);

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
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('referencia', formData.referencia);
      formDataToSend.append('precioDetalle', Number(formData.precioDetalle));
      formDataToSend.append('precioMayorista', Number(formData.precioMayorista));
      formDataToSend.append('precioColegas', Number(formData.precioColegas));
      formDataToSend.append('precioPacas', Number(formData.precioPacas));
      formDataToSend.append('ivaPercentage', formData.ivaPercentage || 0);
      formDataToSend.append('retailDiscountPct', formData.retailDiscountPct || 0);
      formDataToSend.append('wholesaleDiscountPct', formData.wholesaleDiscountPct || 0);
      formDataToSend.append('partnerDiscountPct', formData.partnerDiscountPct || 0);
      formDataToSend.append('bulkDiscountPct', formData.bulkDiscountPct || 0);
      formDataToSend.append('idUnitMeasure', formData.idUnitMeasure);
      formDataToSend.append('idCategorie', formData.id_category || selectedCategoryIds[0]);
      formDataToSend.append('description', formData.descripcion || '');
      formDataToSend.append('quantityPerPack', formData.cantidadXPaca ? Number(formData.cantidadXPaca) : 0);
      formDataToSend.append('codBarras', formData.codBarras);
      formDataToSend.append('stock', Number(formData.stockPrincipal) || 0);
      formDataToSend.append('barcodes', JSON.stringify([
        {
          barcode: formData.codBarras,
          barcode_type: 'EAN13',
          stock: Number(formData.stockPrincipal) || 0,
        },
        ...formData.codsBarrasExtra
          .filter((barcode) => barcode?.cod)
          .map((barcode) => ({
            barcode: barcode.cod,
            barcode_type: 'SKU',
            stock: Number(barcode.stock) || 0,
          })),
      ]));
      selectedCategoryIds.forEach((catId) => formDataToSend.append('categories[]', catId));
      selectedSubcategoryIds.forEach((subId) => formDataToSend.append('subcategories[]', subId));
      imagenesPreview.forEach((file) => formDataToSend.append('images', file));

      const saved = await ProductsService.create(formDataToSend);
      showSuccess('Producto creado', `"${saved.name}" fue agregado al catalogo correctamente.`);
      onCreate?.(saved);
      setFormData(EMPTY);
      setImagenesPreview([]);
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
      setExpandedCategoryIds({});
      setErrors({});
      setPriceErrors({});
      onClose();
    } catch (error) {
      showError('Error', error.message || 'No se pudo guardar el producto. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      errors[field] ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-300 focus:ring-blue-500'
    }`;
  const ErrMsg = ({ field }) => errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="bg-white rounded-xl w-full max-w-6xl shadow-2xl relative z-10 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Crear producto</h3>
          <button type="button" onClick={onClose} className="text-white hover:text-gray-200 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">1. Informacion General</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-gray-700">Imagen <span className="text-red-500">*</span></label>
                    <span className="text-[10px] font-medium text-gray-500">{imagenesPreview.length} seleccionada{imagenesPreview.length !== 1 ? 's' : ''}</span>
                  </div>
                  <input ref={imageInputRef} type="file" multiple accept="image/*" onChange={handleImagenesChange} className="hidden" />
                  <div className={`border rounded-lg p-3 min-h-[200px] flex flex-col gap-3 ${errors.imagen ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-colors" style={{ backgroundColor: '#004D77' }}>
                      <ImagePlus className="w-4 h-4" />
                      Seleccionar imagenes
                    </button>
                    {imagenesPreview.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {imagenesPreview.map((file, idx) => (
                          <div key={`${file.name}-${idx}`} className="relative rounded-lg border border-gray-200 overflow-hidden">
                            <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                            <button type="button" onClick={() => setImagenesPreview((prev) => prev.filter((_, i) => i !== idx))} title="Quitar imagen" className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${errors.imagen ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <Upload className={`w-6 h-6 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-600">Aun no hay imagenes cargadas</p>
                        <p className="text-[10px] text-gray-400">Usa el boton superior para agregarlas.</p>
                      </div>
                    )}
                  </div>
                  <ErrMsg field="imagen" />
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
                  idPrefix="create-product"
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripcion <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripcion del producto..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm h-[200px]" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 pb-1.5 border-b-2 border-[#004D77]">2. Informacion del Producto</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
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
                      <input type="text" name="codBarras" value={formData.codBarras} onChange={handleChange} onFocus={() => setActiveBarcodeTarget({ type: 'main', index: null })} data-scanner-field="product-barcode-main" placeholder="Codigo de barras principal" className={inputCls('codBarras')} />
                      <ErrMsg field="codBarras" />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <input type="text" inputMode="numeric" value={formData.stockPrincipal} onChange={(e) => setFormData((prev) => ({ ...prev, stockPrincipal: numeric(e.target.value) }))} onKeyDown={block} placeholder="Stock" className={inputCls('stockPrincipal')} />
                      <ErrMsg field="stockPrincipal" />
                    </div>
                  </div>
                  {formData.codsBarrasExtra.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <input type="text" value={item.cod} onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)} onFocus={() => setActiveBarcodeTarget({ type: 'extra', index: i })} data-scanner-field="product-barcode-extra" placeholder={`Codigo de barras ${i + 2}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <input type="text" inputMode="numeric" value={item.stock} onChange={(e) => handleCodBarrasExtraChange(i, 'stock', numeric(e.target.value))} onKeyDown={block} placeholder="Stock" className="w-24 flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, codsBarrasExtra: prev.codsBarrasExtra.filter((_, idx) => idx !== i) }))} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <ErrMsg field="codsBarrasExtra" />
                  <ScannerStatus status={scannerMessage} className="mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Referencia <span className="text-red-500">*</span></label>
                  <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="REF-001" className={inputCls('referencia')} />
                  <ErrMsg field="referencia" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock general <span className="ml-1 text-[10px] text-gray-400 font-normal">(calculado)</span></label>
                  <input type="text" readOnly value={calcStock(formData)} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad x paca</label>
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca} onChange={(e) => setFormData((prev) => ({ ...prev, cantidadXPaca: numeric(e.target.value) }))} onKeyDown={block} placeholder="12" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
              <PriceCard label="Precio Detal" fieldMain="precioDetalle" fieldPaca="retailDiscountPct" valueMain={formData.precioDetalle} valuePaca={formData.retailDiscountPct} placeholderMain="5000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioDetalle || priceErrors.precioDetalle} />
              <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="wholesaleDiscountPct" valueMain={formData.precioMayorista} valuePaca={formData.wholesaleDiscountPct} placeholderMain="4000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioMayorista || priceErrors.precioMayorista} />
              <PriceCard label="Precio Colegas" fieldMain="precioColegas" fieldPaca="partnerDiscountPct" valueMain={formData.precioColegas} valuePaca={formData.partnerDiscountPct} placeholderMain="3500" placeholderPaca="0" onChange={handleChange} errMain={errors.precioColegas || priceErrors.precioColegas} />
              <PriceCard label="Precio X Pacas" fieldMain="precioPacas" fieldPaca="bulkDiscountPct" valueMain={formData.precioPacas} valuePaca={formData.bulkDiscountPct} placeholderMain="3000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioPacas || priceErrors.precioPacas} />
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
              {isSubmitting ? 'Cargando...' : 'Crear Producto'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm cursor-pointer">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProduct;
