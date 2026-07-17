import {
  ArrowLeft,
  BadgeDollarSign,
  Barcode,
  Boxes,
  FileText,
  ImagePlus,
  Loader2,
  Maximize2,
  Package,
  Percent,
  Plus,
  Ruler,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
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
  const formatCop = (value) => {
    const digits = numeric(String(value ?? ''));
    if (!digits) return '';
    return `$ ${Number(digits).toLocaleString('es-CO')}`;
  };
  const hm = !!errMain;
  const hp = !!errPaca;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className={`grid grid-cols-[minmax(0,1fr)_105px] overflow-hidden rounded-lg border bg-white transition-colors duration-200 focus-within:ring-2 ${
        hm || hp
          ? 'border-red-500 focus-within:ring-red-200'
          : 'border-gray-300 focus-within:border-[#004D77] focus-within:ring-[#004D77]/20'
      }`}>
        <div className={`relative min-w-0 ${hm ? 'bg-red-50' : 'bg-white'}`}>
          <BadgeDollarSign className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none ${hm ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.8} />
          <input
            type="text"
            inputMode="numeric"
            name={fieldMain}
            value={formatCop(valueMain)}
            onChange={(e) => onChange({ target: { name: fieldMain, value: numeric(e.target.value) } })}
            onKeyDown={block}
            placeholder={formatCop(placeholderMain)}
            className={`h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm font-medium outline-none ${
              hm ? 'text-red-900 placeholder-red-300' : 'text-gray-700 placeholder-gray-400'
            }`}
          />
        </div>
        <div className={`relative border-l ${hp ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
          <Percent className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none ${hp ? 'text-red-400' : 'text-gray-400'}`} strokeWidth={1.8} />
          <input
            type="text"
            inputMode="numeric"
            name={fieldPaca}
            value={valuePaca}
            onChange={(e) => onChange({ target: { name: fieldPaca, value: numeric(e.target.value) } })}
            onKeyDown={block}
            placeholder={placeholderPaca}
            aria-label={`Descuento de ${label}`}
            className={`h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm font-semibold outline-none ${
              hp ? 'text-red-900 placeholder-red-300' : 'text-gray-700 placeholder-gray-400'
            }`}
          />
        </div>
      </div>
      {(hm || hp) && (
        <div className="mt-1 grid grid-cols-[minmax(0,1fr)_105px] gap-2">
          <p className="text-[10px] text-red-500">{errMain || ''}</p>
          <p className="text-[10px] text-red-500">{errPaca || ''}</p>
        </div>
      )}
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

function ProductForm({
  mode = 'create',
  isOpen = true,
  onClose,
  onSuccess,
  producto,
  existingProducts = [],
}) {
  const isEditMode = mode === 'edit';
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
  const [activeBarcodeTarget, setActiveBarcodeTarget] = useState({ type: 'main', index: null });
  const [scannerMessage, setScannerMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/categories`);
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/categories/subcategories`);
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
    if (!isEditMode || !producto) return;

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
    setActiveBarcodeTarget({ type: 'main', index: null });
    setScannerMessage(null);
    setErrors({});
    setPriceErrors({});
  }, [isEditMode, producto]);

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

  const getCurrentProductId = () =>
    isEditMode ? producto?.id ?? producto?.idProduct ?? null : null;

  const getFormBarcodeValues = (data = formData) => [
    data.codBarras,
    ...(data.codsBarrasExtra || []).map((item) => item?.cod),
  ];

  const getFormBarcodeValuesWithoutActiveTarget = () => {
    const values = getFormBarcodeValues();
    if (activeBarcodeTarget.type === 'main') return values.slice(1);

    const extraPosition = activeBarcodeTarget.index + 1;
    return values.filter((_, index) => index !== extraPosition);
  };

  const getBarcodeConflictMessage = (code) => {
    const owner = findProductBarcodeOwner(existingProducts, code, {
      excludeProductId: getCurrentProductId(),
    });
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

  const validate = (d) => {
    const e = {};
    if (!isEditMode && imagenesNuevas.length === 0) {
      e.imagen = 'Debes agregar al menos una imagen.';
    }
    if (selectedCategoryIds.length === 0) e.categorias = 'Debes seleccionar al menos una categoria.';
    if (!d.idUnitMeasure) e.idUnitMeasure = 'Selecciona una unidad de medida.';
    if (!d.nombre?.trim()) e.nombre = 'El nombre del producto es obligatorio.';
    else if (d.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.';
    if (!d.codBarras?.trim()) e.codBarras = 'El codigo de barras es obligatorio.';
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
    if (isEditMode ? d.referencia === '' : !d.referencia.trim()) {
      e.referencia = 'La referencia es obligatoria.';
    }
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
    if (errors.imagen) {
      setErrors((prev) => ({ ...prev, imagen: undefined }));
    }
  };

  const handleAddCodBarras = () => {
    const nextIndex = (formData.codsBarrasExtra || []).length;
    setActiveBarcodeTarget({ type: 'extra', index: nextIndex });
    setFormData((prev) => ({ ...prev, codsBarrasExtra: [...(prev.codsBarrasExtra || []), { cod: '', stock: '' }] }));
  };

  const handleCodBarrasExtraChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.codsBarrasExtra || [])];
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

    if (activeBarcodeTarget.type === 'extra' && formData.codsBarrasExtra?.[activeBarcodeTarget.index]) {
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
      let saved;

      if (isEditMode) {
        saved = await ProductsService.update(producto.id, {
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
      } else {
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
          ...(formData.codsBarrasExtra || [])
            .filter((barcode) => barcode?.cod)
            .map((barcode) => ({
              barcode: barcode.cod,
              barcode_type: 'SKU',
              stock: Number(barcode.stock) || 0,
            })),
        ]));
        selectedCategoryIds.forEach((catId) => formDataToSend.append('categories[]', catId));
        selectedSubcategoryIds.forEach((subId) => formDataToSend.append('subcategories[]', subId));
        imagenesNuevas.forEach((file) => formDataToSend.append('images', file));

        saved = await ProductsService.create(formDataToSend);
        showSuccess('Producto creado', `"${saved.name}" fue agregado al catalogo correctamente.`);
      }

      onSuccess?.(saved);
      onClose();
    } catch (error) {
      showError(
        'Error',
        error.message || `No se pudo ${isEditMode ? 'actualizar' : 'guardar'} el producto. Intenta de nuevo.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-lg outline-none text-sm transition-colors duration-200 ${
      errors[field] ? 'border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 bg-white text-gray-700 placeholder-gray-400'
    }`;
  const ErrMsg = ({ field }) => errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  if (!isOpen || (isEditMode && !producto)) return null;

  return (
    <>
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="w-full mx-auto">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" title="Volver a productos">
              <ArrowLeft className="w-5 h-5 text-gray-600" strokeWidth={1.8} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Editar producto' : 'Nuevo producto'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Datos esenciales</p>
                <p className="text-xs text-gray-400">IdentificaciÃ³n y clasificaciÃ³n principal del producto</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)_minmax(220px,0.7fr)] gap-4 p-4">
              <div className="grid min-w-0 grid-cols-1 md:grid-cols-12 gap-3 content-start">
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                  <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Ej: Lapicero Bic Azul" className={`${inputCls('nombre')} pl-10`} />
                </div>
                <ErrMsg field="nombre" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencia <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                  <input type="text" name="referencia" value={formData.referencia || ''} onChange={handleChange} placeholder="REF-001" className={`${inputCls('referencia')} pl-10`} />
                </div>
                <ErrMsg field="referencia" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unidad de medida <span className="text-red-500">*</span></label>
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
              <div className="md:col-span-9">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  CÃ³digo de barras y stock <span className="text-red-500">*</span>
                </label>
                <div className={`grid grid-cols-[minmax(0,1fr)_110px] overflow-hidden rounded-lg border bg-white transition-colors duration-200 focus-within:ring-2 ${
                  errors.codBarras || errors.stockPrincipal
                    ? 'border-red-500 focus-within:ring-red-200'
                    : 'border-gray-300 focus-within:border-[#004D77] focus-within:ring-[#004D77]/20'
                }`}>
                  <div className="relative min-w-0">
                    <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                    <input
                      type="text"
                      name="codBarras"
                      value={formData.codBarras || ''}
                      onChange={handleChange}
                      onFocus={() => setActiveBarcodeTarget({ type: 'main', index: null })}
                      data-scanner-field="product-barcode-main"
                      placeholder="Escanea o escribe el cÃ³digo"
                      className="h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>
                  <div className="relative border-l border-gray-200 bg-gray-50">
                    <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.stockPrincipal || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stockPrincipal: numeric(e.target.value) }))}
                      onKeyDown={block}
                      placeholder="0"
                      className="h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm font-semibold text-gray-700 outline-none placeholder-gray-400"
                    />
                  </div>
                </div>
                <ErrMsg field="codBarras" />
                <ErrMsg field="stockPrincipal" />
                <ScannerStatus status={scannerMessage} className="mt-1" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">IVA %</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                  <input type="number" name="ivaPercentage" value={formData.ivaPercentage} onChange={handleChange} min="0" max="100" placeholder="19" className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                </div>
              </div>
              </div>

              <div className="min-w-0">
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
                  idPrefix={`${mode}-product-essential`}
                />
              </div>

              <div className="self-stretch rounded-lg border border-[#004D77]/15 bg-[#004D77]/[0.03] p-4">
                <p className="text-sm font-semibold text-gray-800">Resumen inicial</p>
                <p className="mt-1 text-xs text-gray-500">Se actualiza al agregar presentaciones adicionales.</p>
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Stock general</p>
                    <p className="mt-1 text-lg font-semibold text-[#004D77]">{calcStock(formData).toLocaleString('es-CO')}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">CÃ³digos</p>
                    <p className="mt-1 text-lg font-semibold text-[#004D77]">{1 + (formData.codsBarrasExtra || []).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)] gap-5 items-start">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Inventario y configuraciÃ³n comercial</p>
                  <p className="text-xs text-gray-400">Presentaciones, existencias, precios y descuentos</p>
                </div>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">CÃ³digos adicionales</p>
                    <p className="text-xs text-gray-400">AgrÃ©galos solo cuando el producto tenga otras presentaciones.</p>
                  </div>
                  <button type="button" onClick={handleAddCodBarras} className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#004D77] px-2 py-1 rounded-md hover:bg-[#004D77]/10 transition-colors duration-200 cursor-pointer">
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                {(formData.codsBarrasExtra || []).length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 px-4 py-8 text-center">
                    <Package className="mx-auto h-7 w-7 text-gray-300" strokeWidth={1.5} />
                    <p className="mt-2 text-sm text-gray-400">No hay presentaciones adicionales</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {(formData.codsBarrasExtra || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_110px] overflow-hidden rounded-lg border border-gray-300 bg-white transition-colors duration-200 focus-within:border-[#004D77] focus-within:ring-2 focus-within:ring-[#004D77]/20">
                          <div className="relative min-w-0">
                            <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                            <input type="text" value={item.cod || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)} onFocus={() => setActiveBarcodeTarget({ type: 'extra', index: i })} data-scanner-field="product-barcode-extra" placeholder={`CÃ³digo de barras ${i + 2}`} className="h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none placeholder-gray-400" />
                          </div>
                          <div className="relative border-l border-gray-200 bg-gray-50">
                            <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={1.8} />
                            <input type="text" inputMode="numeric" value={item.stock || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'stock', numeric(e.target.value))} onKeyDown={block} placeholder="Stock" className="h-[42px] w-full border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm font-semibold text-gray-700 outline-none placeholder-gray-400" />
                          </div>
                        </div>
                        <button type="button" onClick={() => setFormData((prev) => ({ ...prev, codsBarrasExtra: (prev.codsBarrasExtra || []).filter((_, idx) => idx !== i) }))} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <ErrMsg field="codsBarrasExtra" />
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad x paca</label>
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca || ''} onChange={(e) => setFormData((prev) => ({ ...prev, cantidadXPaca: numeric(e.target.value) }))} onKeyDown={block} placeholder="12" className="w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <BadgeDollarSign className="h-4 w-4 text-[#004D77]" strokeWidth={1.8} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Precios y descuentos</p>
                      <p className="text-xs text-gray-400">El precio detal es la configuraciÃ³n comercial principal.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <PriceCard label="Precio Detal" fieldMain="precioDetalle" fieldPaca="retailDiscountPct" valueMain={formData.precioDetalle || ''} valuePaca={formData.retailDiscountPct || ''} placeholderMain="5000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioDetalle || priceErrors.precioDetalle} />
                    </div>
                    <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="wholesaleDiscountPct" valueMain={formData.precioMayorista || ''} valuePaca={formData.wholesaleDiscountPct || ''} placeholderMain="4000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioMayorista || priceErrors.precioMayorista} />
                    <PriceCard label="Precio Colegas" fieldMain="precioColegas" fieldPaca="partnerDiscountPct" valueMain={formData.precioColegas || ''} valuePaca={formData.partnerDiscountPct || ''} placeholderMain="3500" placeholderPaca="0" onChange={handleChange} errMain={errors.precioColegas || priceErrors.precioColegas} />
                    <PriceCard label="Precio X Pacas" fieldMain="precioPacas" fieldPaca="bulkDiscountPct" valueMain={formData.precioPacas || ''} valuePaca={formData.bulkDiscountPct || ''} placeholderMain="3000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioPacas || priceErrors.precioPacas} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                <ImagePlus className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">InformaciÃ³n complementaria</p>
                <p className="text-xs text-gray-400">ImÃ¡genes y descripciÃ³n para el catÃ¡logo</p>
              </div>
            </div>
            <div className="flex flex-col gap-5 p-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {isEditMode ? 'ImÃ¡genes' : 'Imagen'} {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-xs font-medium text-gray-500">
                    {imagenesActuales.length + imagenesNuevas.length} {isEditMode ? 'visible' : 'seleccionada'}
                    {imagenesActuales.length + imagenesNuevas.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImagenChange} className="hidden" />
                <div className={`border rounded-lg p-3 min-h-[200px] flex flex-col gap-3 transition-colors duration-200 ${
                  errors.imagen ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}>
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#004D77] border border-[#004D77] bg-white rounded-lg hover:bg-[#004D77] hover:text-white transition-colors duration-200 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    {isEditMode ? 'Agregar imÃ¡genes' : 'Seleccionar imÃ¡genes'}
                  </button>
                  {imagenesActuales.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Actuales</p>
                      <div className="grid grid-cols-2 gap-2">
                        {imagenesActuales.map((img) => (
                          <div key={img.id || img.url} className="group relative overflow-hidden rounded-lg border border-gray-200">
                            <img src={img.url} alt="Producto" className="w-full h-20 object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/35 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ src: img.url, alt: 'Imagen del producto' })}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#004D77] shadow hover:bg-gray-100"
                                title="Ampliar imagen"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {imagenesNuevas.length > 0 && (
                    <div>
                      {isEditMode && <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Nuevas por guardar</p>}
                      <div className="grid grid-cols-2 gap-2">
                        {imagenesNuevas.map((file, idx) => (
                          <div key={`${file.name}-${idx}`} className="group relative rounded-lg border border-gray-200 overflow-hidden">
                            <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className={`w-full object-cover ${isEditMode ? 'h-20' : 'h-24'}`} />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/35 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => setPreviewImage({ src: URL.createObjectURL(file), alt: file.name })}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#004D77] shadow hover:bg-gray-100"
                                title="Ampliar imagen"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setImagenesNuevas((prev) => prev.filter((_, i) => i !== idx))}
                                title={isEditMode ? 'Quitar imagen nueva' : 'Eliminar imagen'}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {imagenesActuales.length === 0 && imagenesNuevas.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${errors.imagen ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Upload className={`w-6 h-6 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-xs font-medium text-gray-600">{isEditMode ? 'No hay imÃ¡genes asociadas' : 'AÃºn no hay imÃ¡genes cargadas'}</p>
                      <p className="text-[10px] text-gray-400">{isEditMode ? 'Agrega nuevas imÃ¡genes con el botÃ³n superior.' : 'Usa el botÃ³n superior para agregarlas.'}</p>
                    </div>
                  )}
                </div>
                <ErrMsg field="imagen" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">DescripciÃ³n <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} placeholder="DescripciÃ³n del producto..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 resize-none text-sm text-gray-700 placeholder-gray-400 min-h-[200px] transition-colors duration-200" />
              </div>
            </div>
          </div>
          </div>

          {false && (<>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">InformaciÃ³n general</p>
                  <p className="text-xs text-gray-400">ImÃ¡genes, categorÃ­as y descripciÃ³n</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {isEditMode ? 'Imagenes' : 'Imagen'} {!isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    <span className="text-[10px] font-medium text-gray-500">
                      {imagenesActuales.length + imagenesNuevas.length} {isEditMode ? 'visible' : 'seleccionada'}
                      {imagenesActuales.length + imagenesNuevas.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImagenChange} className="hidden" />
                  <div className={`border rounded-lg p-3 min-h-[200px] flex flex-col gap-3 transition-colors duration-200 ${
                    errors.imagen ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                  }`}>
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[#004D77] border border-[#004D77] bg-white rounded-lg hover:bg-[#004D77] hover:text-white transition-colors duration-200">
                      <ImagePlus className="w-4 h-4" />
                      {isEditMode ? 'Agregar imagenes' : 'Seleccionar imagenes'}
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
                        {isEditMode && (
                          <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">Nuevas por guardar</p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {imagenesNuevas.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="relative rounded-lg border border-gray-200 overflow-hidden">
                              <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className={`w-full object-cover ${isEditMode ? 'h-20' : 'h-24'}`} />
                              <button type="button" onClick={() => setImagenesNuevas((prev) => prev.filter((_, i) => i !== idx))} title={isEditMode ? 'Quitar imagen nueva' : 'Quitar imagen'} className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {imagenesActuales.length === 0 && imagenesNuevas.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${errors.imagen ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <Upload className={`w-6 h-6 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-600">
                          {isEditMode ? 'No hay imagenes asociadas' : 'Aun no hay imagenes cargadas'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isEditMode ? 'Agrega nuevas imagenes con el boton superior.' : 'Usa el boton superior para agregarlas.'}
                        </p>
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
                  idPrefix={`${mode}-product`}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripcion <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} placeholder="Descripcion del producto..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 resize-none text-sm text-gray-700 placeholder-gray-400 h-[200px] transition-colors duration-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">InformaciÃ³n del producto</p>
                  <p className="text-xs text-gray-400">IdentificaciÃ³n, inventario y unidad</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Ej: Lapicero Bic Azul" className={inputCls('nombre')} />
                  <ErrMsg field="nombre" />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Codigo(s) de barras <span className="text-red-500">*</span></label>
                    <button type="button" onClick={handleAddCodBarras} className="flex items-center gap-1 text-sm font-medium text-[#004D77] px-2 py-1 rounded-md hover:bg-[#004D77]/10 transition-colors duration-200 cursor-pointer">
                      <Plus className="w-3 h-3" />
                      Agregar codigo
                    </button>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input type="text" name="codBarras" value={formData.codBarras || ''} onChange={handleChange} onFocus={() => setActiveBarcodeTarget({ type: 'main', index: null })} data-scanner-field="product-barcode-main" placeholder="Codigo de barras principal" className={inputCls('codBarras')} />
                      <ErrMsg field="codBarras" />
                    </div>
                    <div className="w-24 flex-shrink-0">
                      <input type="text" inputMode="numeric" value={formData.stockPrincipal || ''} onChange={(e) => setFormData((prev) => ({ ...prev, stockPrincipal: numeric(e.target.value) }))} onKeyDown={block} placeholder="Stock" className={inputCls('stockPrincipal')} />
                      <ErrMsg field="stockPrincipal" />
                    </div>
                  </div>
                  {(formData.codsBarrasExtra || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2">
                      <input type="text" value={item.cod || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'cod', e.target.value)} onFocus={() => setActiveBarcodeTarget({ type: 'extra', index: i })} data-scanner-field="product-barcode-extra" placeholder={`Codigo de barras ${i + 2}`} className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                      <input type="text" inputMode="numeric" value={item.stock || ''} onChange={(e) => handleCodBarrasExtraChange(i, 'stock', numeric(e.target.value))} onKeyDown={block} placeholder="Stock" className="w-24 flex-shrink-0 px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                      <button type="button" onClick={() => setFormData((prev) => ({ ...prev, codsBarrasExtra: (prev.codsBarrasExtra || []).filter((_, idx) => idx !== i) }))} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <ErrMsg field="codsBarrasExtra" />
                  <ScannerStatus status={scannerMessage} className="mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Referencia <span className="text-red-500">*</span></label>
                  <input type="text" name="referencia" value={formData.referencia || ''} onChange={handleChange} placeholder="REF-001" className={inputCls('referencia')} />
                  <ErrMsg field="referencia" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock general <span className="ml-1 text-xs text-gray-400 font-normal">(calculado)</span></label>
                  <input type="text" readOnly value={calcStock(formData)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad x paca</label>
                  <input type="text" inputMode="numeric" name="cantidadXPaca" value={formData.cantidadXPaca || ''} onChange={(e) => setFormData((prev) => ({ ...prev, cantidadXPaca: numeric(e.target.value) }))} onKeyDown={block} placeholder="12" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Unidad de medida <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">IVA %</label>
                  <input type="number" name="ivaPercentage" value={formData.ivaPercentage} onChange={handleChange} min="0" max="100" placeholder="19" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 text-sm transition-colors duration-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="w-7 h-7 rounded-md bg-[#004D77] flex items-center justify-center shrink-0">
                <BadgeDollarSign className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">ConfiguraciÃ³n de precios</p>
                <p className="text-xs text-gray-400">Precios de venta y descuentos</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
              <PriceCard label="Precio Detal" fieldMain="precioDetalle" fieldPaca="retailDiscountPct" valueMain={formData.precioDetalle || ''} valuePaca={formData.retailDiscountPct || ''} placeholderMain="5000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioDetalle || priceErrors.precioDetalle} />
              <PriceCard label="Precio Mayorista" fieldMain="precioMayorista" fieldPaca="wholesaleDiscountPct" valueMain={formData.precioMayorista || ''} valuePaca={formData.wholesaleDiscountPct || ''} placeholderMain="4000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioMayorista || priceErrors.precioMayorista} />
              <PriceCard label="Precio Colegas" fieldMain="precioColegas" fieldPaca="partnerDiscountPct" valueMain={formData.precioColegas || ''} valuePaca={formData.partnerDiscountPct || ''} placeholderMain="3500" placeholderPaca="0" onChange={handleChange} errMain={errors.precioColegas || priceErrors.precioColegas} />
              <PriceCard label="Precio X Pacas" fieldMain="precioPacas" fieldPaca="bulkDiscountPct" valueMain={formData.precioPacas || ''} valuePaca={formData.bulkDiscountPct || ''} placeholderMain="3000" placeholderPaca="0" onChange={handleChange} errMain={errors.precioPacas || priceErrors.precioPacas} />
            </div>
          </div>
          </>)}

          <div className="flex justify-end gap-3 pt-1 mt-auto">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isSubmitting && <Save className="w-4 h-4" strokeWidth={1.8} />}
              {isSubmitting ? 'Cargando...' : isEditMode ? 'Guardar cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
    {previewImage && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4" onClick={() => setPreviewImage(null)}>
        <div className="relative max-h-[92vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
          <img src={previewImage.src} alt={previewImage.alt} className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl" />
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100"
            title="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    )}
    </>
  );
}

export default ProductForm;


