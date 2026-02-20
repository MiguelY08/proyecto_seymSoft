import { X, Upload } from 'lucide-react';
import { useState } from 'react';

function CreateProduct({ isOpen, onClose, producto = null }) {
  const [formData, setFormData] = useState({
    imagen: null,
    nombre: producto?.nombre || '',
    proveedor: producto?.proveedor || '',
    precioMayorista: producto?.precioMayorista || '',
    precioDetalle: producto?.precio || '',
    stock: producto?.stock || '',
    categoria: producto?.categoria || '',
    descripcion: producto?.descripcion || '',
  });

  const [imagenPreview, setImagenPreview] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Validaciones ──────────────────────────────────────────────────────────
  const validate = (data) => {
    const errs = {};

    if (!data.imagen && !imagenPreview)
      errs.imagen = 'Debes subir una imagen del producto.';

    if (!data.nombre.trim())
      errs.nombre = 'El nombre del producto es obligatorio.';
    else if (data.nombre.trim().length < 3)
      errs.nombre = 'El nombre debe tener al menos 3 caracteres.';

    if (!data.proveedor)
      errs.proveedor = 'Debes seleccionar un proveedor.';

    if (data.precioDetalle === '' || data.precioDetalle === null)
      errs.precioDetalle = 'El precio detal es obligatorio.';
    else if (Number(data.precioDetalle) <= 0)
      errs.precioDetalle = 'El precio detal debe ser mayor a 0.';

    if (data.precioMayorista === '' || data.precioMayorista === null)
      errs.precioMayorista = 'El precio mayorista es obligatorio.';
    else if (Number(data.precioMayorista) <= 0)
      errs.precioMayorista = 'El precio mayorista debe ser mayor a 0.';
    else if (
      data.precioDetalle !== '' &&
      Number(data.precioMayorista) >= Number(data.precioDetalle)
    )
      errs.precioMayorista = 'El precio mayorista debe ser menor al precio detal.';

    if (data.stock === '' || data.stock === null)
      errs.stock = 'El stock es obligatorio.';
    else if (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 1)
      errs.stock = 'El stock debe ser un número entero mayor o igual a 1.';

    if (!data.categoria)
      errs.categoria = 'Debes seleccionar una categoría.';

    return errs;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al corregirlo
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
      if (errors.imagen) setErrors((prev) => ({ ...prev, imagen: undefined }));
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll al primer error
      const firstError = document.querySelector('.field-error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    console.log('Datos del producto:', formData);
    onClose();
  };

  // ── Helpers de estilo ─────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="field-error mt-1 text-xs text-red-500 flex items-center gap-1">
        <span>⚠</span> {errors[field]}
      </p>
    ) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col">

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

            {/* ── Columna izquierda ─────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen <span className="text-red-500">*</span>
                </label>
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    errors.imagen
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}>
                    {imagenPreview ? (
                      <img src={imagenPreview} alt="Preview" className="w-32 h-32 mx-auto object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-lg flex items-center justify-center mb-3 ${errors.imagen ? 'bg-red-100' : 'bg-gray-200'}`}>
                          <Upload className={`w-10 h-10 ${errors.imagen ? 'text-red-400' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-sm text-white px-4 py-2 rounded-full" style={{ backgroundColor: '#004D77' }}>
                          Agregar imagen
                        </p>
                      </div>
                    )}
                  </div>
                </label>
                <ErrorMsg field="imagen" />
              </div>

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
                  placeholder="Caja de lapiceros Bic X12"
                  className={inputClass('nombre')}
                />
                <ErrorMsg field="nombre" />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <select
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                  className={inputClass('proveedor')}
                >
                  <option value="">Selecciona un proveedor</option>
                  <option value="OfiExpress">OfiExpress</option>
                  <option value="EduPaper">EduPaper</option>
                  <option value="PapCenter">PapCenter</option>
                  <option value="ProveArt">ProveArt</option>
                </select>
                <ErrorMsg field="proveedor" />
              </div>

              {/* Precio detal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio detal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="precioDetalle"
                  value={formData.precioDetalle}
                  onChange={handleInputChange}
                  placeholder="16500"
                  min="1"
                  className={inputClass('precioDetalle')}
                />
                <ErrorMsg field="precioDetalle" />
              </div>

            </div>

            {/* ── Columna derecha ───────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Precio mayorista */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio mayorista <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="precioMayorista"
                  value={formData.precioMayorista}
                  onChange={handleInputChange}
                  placeholder="14300"
                  min="1"
                  className={inputClass('precioMayorista')}
                />
                <ErrorMsg field="precioMayorista" />
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
                  placeholder="27"
                  min="1"
                  step="1"
                  className={inputClass('stock')}
                />
                <ErrorMsg field="stock" />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={inputClass('categoria')}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Escolar / Oficina">Escolar / Oficina</option>
                  <option value="Escolar">Escolar</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Artes">Artes</option>
                  <option value="Artes/Escolar">Artes/Escolar</option>
                </select>
                <ErrorMsg field="categoria" />
              </div>

              {/* Descripción — opcional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-gray-400 text-xs font-normal">(opcional)</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Tinta duradera, escritura suave y colores clásicos (negro, azul y rojo). Ideales para oficina, estudio o uso diario."
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                />
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