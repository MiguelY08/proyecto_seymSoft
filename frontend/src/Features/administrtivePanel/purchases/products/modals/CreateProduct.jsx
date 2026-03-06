import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert';

// ─── Reglas de validación por campo ──────────────────────────────────────────
function validateField(name, value, formData) {
  switch (name) {

    case 'nombre':
      if (!value.trim())           return 'El nombre del producto es obligatorio.';
      if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';

    case 'codBarras':
      if (!value.trim())           return 'El código de barras es obligatorio.';
      if (value.trim().length < 5) return 'El código de barras debe tener al menos 5 caracteres.';
      return '';

    case 'referencia':
      if (!value.trim())           return 'La referencia es obligatoria.';
      if (value.trim().length < 3) return 'La referencia debe tener al menos 3 caracteres.';
      return '';

    case 'precioDetalle':
      if (value === '' || value === null) return 'El precio detal es obligatorio.';
      if (Number(value) <= 0)             return 'El precio detal debe ser mayor a 0.';
      return '';

    case 'precioMayorista': {
      if (value === '' || value === null) return 'El precio mayorista es obligatorio.';
      if (Number(value) <= 0)             return 'El precio mayorista debe ser mayor a 0.';
      const detalle = Number(formData?.precioDetalle);
      if (detalle > 0 && Number(value) >= detalle)
        return 'El precio mayorista debe ser menor al precio detal.';
      return '';
    }

    case 'precioColegas': {
      if (value === '' || value === null) return 'El precio colegas es obligatorio.';
      if (Number(value) <= 0)             return 'El precio colegas debe ser mayor a 0.';
      const mayorista = Number(formData?.precioMayorista);
      if (mayorista > 0 && Number(value) > mayorista)
        return 'El precio colegas debe ser igual o menor al precio mayorista.';
      return '';
    }

    case 'precioPacas': {
      if (value === '' || value === null) return 'El precio por pacas es obligatorio.';
      if (Number(value) <= 0)             return 'El precio por pacas debe ser mayor a 0.';
      const colegas = Number(formData?.precioColegas);
      if (colegas > 0 && Number(value) > colegas)
        return 'El precio por pacas debe ser menor o igual al precio colegas.';
      return '';
    }

    case 'stock':
      if (value === '' || value === null) return 'El stock es obligatorio.';
      if (!Number.isInteger(Number(value)) || Number(value) < 1)
        return 'El stock debe ser un número entero mayor o igual a 1.';
      return '';

    default:
      return '';
  }
}

// ─── Mensaje de error sin emojis ─────────────────────────────────────────────
function ErrorMsg({ error, touched }) {
  if (!touched || !error) return null;
  return <p className="field-error mt-1 text-xs text-red-500">{error}</p>;
}

// ─── Clase del input según estado ────────────────────────────────────────────
function getInputClass(field, errors, touched) {
  const hasError = touched[field] && errors[field];
  const isOk     = touched[field] && !errors[field];
  return `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
    hasError
      ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
      : isOk
      ? 'border-green-400 focus:ring-green-200 bg-green-50'
      : 'border-gray-300 focus:ring-blue-500'
  }`;
}

// ─── Campos de precio que se validan entre sí ────────────────────────────────
const PRICE_FIELDS = ['precioDetalle', 'precioMayorista', 'precioColegas', 'precioPacas'];

function CreateProduct({ isOpen, onClose, onCreate, producto = null }) {
  const { showSuccess } = useAlert();

  const initialData = {
    imagen:          null,
    nombre:          producto?.nombre          || '',
    precioDetalle:   producto?.precio          || '',
    precioMayorista: producto?.precioMayorista || '',
    precioColegas:   producto?.precioColegas   || '',
    precioPacas:     producto?.precioPacas     || '',
    stock:           producto?.stock           || '',
    categorias:      producto?.categorias      || [],
    descripcion:     producto?.descripcion     || '',
    codBarras:       producto?.codBarras       || '',
    referencia:      producto?.referencia      || '',
  };

  const [formData,      setFormData]      = useState(initialData);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});

  const categoriasDisponibles = ['Escolar', 'Oficina', 'Artes'];

  // Cuando cambia cualquier precio, re-evalúa todos los precios
  // para que los errores cruzados (mayorista vs detal, etc.) se actualicen
  const recalcPriceErrors = (updatedData, currentTouched) => {
    const updated = {};
    PRICE_FIELDS.forEach((field) => {
      if (currentTouched[field] || updatedData[field] !== '') {
        updated[field] = validateField(field, updatedData[field], updatedData);
      }
    });
    return updated;
  };

  // ── Handler principal de inputs ───────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData    = { ...formData, [name]: value };
    const updatedTouched = { ...touched, [name]: true };

    setFormData(updatedData);
    setTouched(updatedTouched);

    if (PRICE_FIELDS.includes(name)) {
      setErrors((prev) => ({
        ...prev,
        ...recalcPriceErrors(updatedData, updatedTouched),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updatedData),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }));
  };

  // ── Categorías ────────────────────────────────────────────────────────────
  const handleCategoriaChange = (categoria) => {
    const newCategorias = formData.categorias.includes(categoria)
      ? formData.categorias.filter((c) => c !== categoria)
      : [...formData.categorias, categoria];

    setFormData((prev) => ({ ...prev, categorias: newCategorias }));
    setTouched((prev) => ({ ...prev, categorias: true }));
    setErrors((prev) => ({
      ...prev,
      categorias: newCategorias.length === 0 ? 'Debes seleccionar al menos una categoría.' : '',
    }));
  };

  // ── Imagen ────────────────────────────────────────────────────────────────
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
      setTouched((prev) => ({ ...prev, imagen: true }));
      setErrors((prev) => ({ ...prev, imagen: '' }));
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();

    const allFields  = ['nombre', 'codBarras', 'referencia', 'stock', ...PRICE_FIELDS];
    const newErrors  = {};
    const newTouched = {};

    allFields.forEach((field) => {
      newTouched[field] = true;
      newErrors[field]  = validateField(field, formData[field], formData);
    });

    newTouched.imagen     = true;
    newErrors.imagen      = (!formData.imagen && !imagenPreview) ? 'Debes subir una imagen del producto.' : '';
    newTouched.categorias = true;
    newErrors.categorias  = formData.categorias.length === 0 ? 'Debes seleccionar al menos una categoría.' : '';

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some((e) => e !== '')) {
      const firstError = document.querySelector('.field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onCreate({ ...formData, imagen: imagenPreview });
    showSuccess('Producto creado', 'El producto fue registrado exitosamente.');

    setFormData(initialData);
    setImagenPreview(null);
    setErrors({});
    setTouched({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">
            {producto ? 'Editar producto' : 'Crear producto'}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Columna izquierda ────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen <span className="text-red-500">*</span>
                </label>
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    touched.imagen && errors.imagen
                      ? 'border-red-400 bg-red-50'
                      : imagenPreview
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}>
                    {imagenPreview ? (
                      <img src={imagenPreview} alt="Preview" className="w-32 h-32 mx-auto object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 ${
                          touched.imagen && errors.imagen ? 'bg-red-100' : 'bg-gray-200'
                        }`}>
                          <Upload className={`w-8 h-8 ${touched.imagen && errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-xs text-white px-3 py-1.5 rounded-full" style={{ backgroundColor: '#004D77' }}>
                          Agregar imagen
                        </p>
                      </div>
                    )}
                  </div>
                </label>
                <ErrorMsg error={errors.imagen} touched={touched.imagen} />
              </div>

              {/* Categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías <span className="text-red-500">*</span>
                </label>
                <div className={`grid grid-cols-3 gap-2 p-3 border rounded-lg transition-colors ${
                  touched.categorias && errors.categorias
                    ? 'border-red-400 bg-red-50'
                    : touched.categorias && formData.categorias.length > 0
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300'
                }`}>
                  {categoriasDisponibles.map((categoria) => (
                    <label key={categoria} className="flex items-center gap-2 cursor-pointer hover:bg-white/60 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.categorias.includes(categoria)}
                        onChange={() => handleCategoriaChange(categoria)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{categoria}</span>
                    </label>
                  ))}
                </div>
                <ErrorMsg error={errors.categorias} touched={touched.categorias} />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Tinta duradera, escritura suave..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

            </div>

            {/* ── Columna derecha ──────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Caja de lapiceros Bic X12"
                  className={getInputClass('nombre', errors, touched)}
                />
                <ErrorMsg error={errors.nombre} touched={touched.nombre} />
              </div>

              {/* Código de barras y Referencia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cód. Barras <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="codBarras"
                    value={formData.codBarras}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="23243532"
                    className={getInputClass('codBarras', errors, touched)}
                  />
                  <ErrorMsg error={errors.codBarras} touched={touched.codBarras} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="5052"
                    className={getInputClass('referencia', errors, touched)}
                  />
                  <ErrorMsg error={errors.referencia} touched={touched.referencia} />
                </div>
              </div>

              {/* Precios 2x2 */}
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio detal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precioDetalle"
                    value={formData.precioDetalle}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="16500"
                    min="1"
                    className={getInputClass('precioDetalle', errors, touched)}
                  />
                  <ErrorMsg error={errors.precioDetalle} touched={touched.precioDetalle} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio mayorista <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precioMayorista"
                    value={formData.precioMayorista}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="14300"
                    min="1"
                    className={getInputClass('precioMayorista', errors, touched)}
                  />
                  <ErrorMsg error={errors.precioMayorista} touched={touched.precioMayorista} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio colegas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precioColegas"
                    value={formData.precioColegas}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="13000"
                    min="1"
                    className={getInputClass('precioColegas', errors, touched)}
                  />
                  <ErrorMsg error={errors.precioColegas} touched={touched.precioColegas} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio x pacas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precioPacas"
                    value={formData.precioPacas}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="12000"
                    min="1"
                    className={getInputClass('precioPacas', errors, touched)}
                  />
                  <ErrorMsg error={errors.precioPacas} touched={touched.precioPacas} />
                </div>

              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="27"
                  min="1"
                  step="1"
                  className={getInputClass('stock', errors, touched)}
                />
                <ErrorMsg error={errors.stock} touched={touched.stock} />
              </div>

            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
              style={{ backgroundColor: '#004D77' }}
            >
              Crear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
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