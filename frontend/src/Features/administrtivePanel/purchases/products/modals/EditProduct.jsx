import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAlert } from '../../../../shared/alerts/useAlert'; // ← ajusta la ruta según tu proyecto

function EditProduct({ isOpen, onClose, onUpdate, producto }) {
  const { showConfirm, showSuccess } = useAlert(); // ← alertas de confirmación y éxito

  const [formData, setFormData] = useState({
    imagen: null,
    nombre: '',
    codBarras: '',
    referencia: '',
    precioMayorista: '',
    precioDetalle: '',
    precioColegas: '',
    precioPacas: '',
    stock: '',
    categorias: [],
    descripcion: '',
  });

  const [imagenPreview, setImagenPreview] = useState(null);
  const [priceErrors, setPriceErrors] = useState({});

  const categoriasDisponibles = ['Escolar', 'Oficina', 'Artes'];

  useEffect(() => {
    if (producto) {
      setFormData({
        imagen: null,
        nombre: producto.nombre || '',
        codBarras: producto.codBarras || '',
        referencia: producto.referencia || '',
        precioMayorista: producto.precioMayorista || '',
        precioDetalle: producto.precio || '',
        precioColegas: producto.precioColegas || '',
        precioPacas: producto.precioPacas || '',
        stock: producto.stock || '',
        categorias: producto.categorias || [],
        descripcion: producto.descripcion || '',
      });
      if (producto.imagen) {
        setImagenPreview(producto.imagen);
      }
    }
  }, [producto]);

  // Validación en tiempo real SOLO para precio mayorista y precio colegas
  const validatePricesRealTime = (detalle, mayorista, colegas) => {
    const errors = {};
    const detalleNum = Number(detalle);
    const mayoristaNum = Number(mayorista);
    const colegasNum = Number(colegas);

    if (mayorista && detalleNum && mayoristaNum >= detalleNum) {
      errors.precioMayorista = 'El precio mayorista debe ser menor al precio detal.';
    }

    if (colegas && mayoristaNum && colegasNum > mayoristaNum) {
      errors.precioColegas = 'El precio colegas debe ser igual o menor al precio mayorista.';
    }

    return errors;
  };

  // Validación completa de precios al enviar
  const validateAllPrices = (detalle, mayorista, colegas, pacas) => {
    const errors = {};
    const detalleNum = Number(detalle);
    const mayoristaNum = Number(mayorista);
    const colegasNum = Number(colegas);
    const pacasNum = Number(pacas);

    if (mayorista && detalleNum && mayoristaNum >= detalleNum) {
      errors.precioMayorista = 'El precio mayorista debe ser menor al precio detal.';
    }

    if (colegas && mayoristaNum && colegasNum > mayoristaNum) {
      errors.precioColegas = 'El precio colegas debe ser igual o menor al precio mayorista.';
    }

    if (pacas && colegasNum && pacasNum > colegasNum) {
      errors.precioPacas = 'El precio por pacas debe ser menor o igual al precio colegas.';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Validación en tiempo real SOLO para mayorista y colegas
      if (['precioDetalle', 'precioMayorista', 'precioColegas'].includes(name)) {
        const priceValidation = validatePricesRealTime(
          name === 'precioDetalle' ? value : prev.precioDetalle,
          name === 'precioMayorista' ? value : prev.precioMayorista,
          name === 'precioColegas' ? value : prev.precioColegas
        );
        setPriceErrors(priceValidation);
      }

      return newData;
    });
  };

  const handleCategoriaChange = (categoria) => {
    setFormData((prev) => {
      const categorias = prev.categorias.includes(categoria)
        ? prev.categorias.filter((c) => c !== categoria)
        : [...prev.categorias, categoria];
      return { ...prev, categorias };
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        imagen: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceErrs = validateAllPrices(
      formData.precioDetalle,
      formData.precioMayorista,
      formData.precioColegas,
      formData.precioPacas
    );

    if (Object.keys(priceErrs).length > 0) {
      setPriceErrors(priceErrs);
      return;
    }

    // ── Alerta 2: Confirmación antes de guardar cambios ───────────────────
    const result = await showConfirm(
      'question',
      '¿Editar este producto?',
      'Los cambios realizados se guardarán de forma permanente.',
      {
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      }
    );

    if (!result.isConfirmed) return;

    onUpdate({
      ...formData,
      id: producto.id,
      imagen: imagenPreview
    });

    // ── Alerta 3: Producto editado exitosamente ───────────────────────────
    showSuccess('Producto actualizado', 'Los cambios fueron guardados exitosamente.');
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${
      priceErrors[field]
        ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  const ErrorMsg = ({ field }) =>
    priceErrors[field] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <span>⚠</span> {priceErrors[field]}
      </p>
    ) : null;

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ backgroundColor: '#004D77' }}>
          <h3 className="text-lg font-bold text-white">Editar producto</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Columna izquierda ─── */}
            <div className="space-y-4">

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center">
                  <label className="cursor-pointer w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImagenChange}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      {imagenPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagenPreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white px-3 py-1.5 rounded-full" style={{ backgroundColor: '#004D77' }}>
                              Cambiar imagen
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500">Agregar imagen</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Categorías (Checkboxes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg">
                  {categoriasDisponibles.map((categoria) => (
                    <label key={categoria} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
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
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
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

            {/* ── Columna derecha ── */}
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
                  placeholder="Caja de lapiceros Bic X12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
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
                    placeholder="23243532"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
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
                    placeholder="5052"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Precios en grid 2x2 */}
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
                    placeholder="16500"
                    className={inputClass('precioDetalle')}
                    required
                  />
                  <ErrorMsg field="precioDetalle" />
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
                    placeholder="14300"
                    className={inputClass('precioMayorista')}
                    required
                  />
                  <ErrorMsg field="precioMayorista" />
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
                    placeholder="13000"
                    className={inputClass('precioColegas')}
                    required
                  />
                  <ErrorMsg field="precioColegas" />
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
                    placeholder="12000"
                    className={inputClass('precioPacas')}
                    required
                  />
                  <ErrorMsg field="precioPacas" />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="27"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              Guardar cambios
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

export default EditProduct;