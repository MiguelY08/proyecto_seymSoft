import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

function EditProduct({ isOpen, onClose, producto }) {
  const [formData, setFormData] = useState({
    imagen: null,
    nombre: '',
    proveedor: '',
    precioMayorista: '',
    precioDetalle: '',
    stock: '',
    categoria: '',
    descripcion: '',
  });

  const [imagenPreview, setImagenPreview] = useState(null);

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (producto) {
      setFormData({
        imagen: null,
        nombre: producto.nombre || '',
        proveedor: producto.proveedor || '',
        precioMayorista: producto.precioMayorista || '',
        precioDetalle: producto.precio || '',
        stock: producto.stock || '',
        categoria: producto.categoria || '',
        descripcion: producto.descripcion || '',
      });
      // Si hay una imagen del producto, establecerla como preview
      if (producto.imagen) {
        setImagenPreview(producto.imagen);
      }
    }
  }, [producto]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        imagen: file
      });
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del producto editado:', formData);
    // Aquí iría la lógica para enviar al servidor
    onClose();
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col">
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
          <div className="space-y-4">
            
            {/* Imagen del producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                  <div className="relative">
                    {imagenPreview ? (
                      <div className="relative">
                        <img 
                          src={imagenPreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-sm text-white px-4 py-2 rounded-full" style={{ backgroundColor: '#004D77' }}>
                            Cambiar imagen
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Agregar imagen</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>

            {/* Precio detal y Precio mayorista */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio detal <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="precioDetalle"
                  value={formData.precioDetalle}
                  onChange={handleInputChange}
                  placeholder="16,500 COP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
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
                  placeholder="14,300 COP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Stock y Categoría */}
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Escolar / Oficina">Escolar / Oficina</option>
                  <option value="Escolar">Escolar</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Artes">Artes</option>
                  <option value="Artes/Escolar">Artes/Escolar</option>
                </select>
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
                placeholder="Tinta duradera, escritura suave y colores clásicos (negro, azul y rojo). Ideales para oficina, estudio o uso diario."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>

          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
              style={{ backgroundColor: '#004D77' }}
            >
              Editar
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