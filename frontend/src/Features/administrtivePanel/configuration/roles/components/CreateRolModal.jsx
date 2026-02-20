import { useState } from "react"
import { X } from "lucide-react"
import PermissionsGrid from "./PermissionsGrid"

export default function CreateRoleModal({ isOpen, onClose, onSave }) {

  if (!isOpen) return null

  const today = new Date().toLocaleDateString()

  const permisosSistema = [
    { id: 1, modulo: "Roles", acciones: ["ver","crear","editar","eliminar"] },
    { id: 2, modulo: "Devolución en Ventas", acciones: ["ver","crear","editar","eliminar"] },
    { id: 3, modulo: "Clientes", acciones: ["ver","crear","editar","eliminar"] },
    { id: 4, modulo: "Usuarios", acciones: ["ver","crear","editar","eliminar"] },
    { id: 5, modulo: "Proveedores", acciones: ["ver","crear","editar","eliminar"] },
    { id: 6, modulo: "Ventas", acciones: ["ver","crear","editar","eliminar"] },
    { id: 7, modulo: "Compras", acciones: ["ver","crear","editar","eliminar"] },
    { id: 8, modulo: "Devolución en Compras", acciones: ["ver","crear","editar","eliminar"] },
    { id: 9, modulo: "Productos", acciones: ["ver","crear","editar","eliminar"] },
    { id: 10, modulo: "Categoría de Productos", acciones: ["ver","crear","editar","eliminar"] },
    { id: 11, modulo: "Producto no Conforme", acciones: ["ver","crear","editar","eliminar"] },
    { id: 12, modulo: "Pagos y Abonos en Ventas", acciones: ["ver","crear","editar","eliminar"] }
  ]

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [permisosRol, setPermisosRol] = useState([])
  const [error, setError] = useState(false)

  const handleSubmit = () => {

    if (!nombre.trim() || !descripcion.trim()) {
      setError(true)
      return
    }

    setError(false)

    const payload = {
      name: nombre,
      description: descripcion,
      active: true,
      createdAt: today,
      permisos: permisosRol
    }

    if (onSave) onSave(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col font-lexend z-10">

        {/* HEADER */}
        <div className="bg-[#0E5676] text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-semibold">
            Crear Nuevo Rol
          </h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* GRID PRINCIPAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-6">

              <div>
                <label className="text-sm font-medium">
                  Nombre del Rol <span className="text-red-500">*</span>
                </label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full mt-2 border border-gray-400 rounded-lg px-4 py-2 bg-white text-sm focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Fecha de Creación
                </label>
                <input
                  value={today}
                  disabled
                  className="w-full mt-2 bg-gray-100/80  rounded-lg px-4 py-2 text-sm "
                />
              </div>

            </div>

            {/* COLUMNA DERECHA */}
            <div>
              <label className="text-sm font-medium">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full mt-2  border-gray-400  border rounded-lg px-4 py-6 bg-white text-sm focus:outline-blue-600"
              />
            </div>

          </div>

          {/* PERMISOS */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              Permisos y Privilegios
            </h3>

            <PermissionsGrid
              permisosSistema={permisosSistema}
              permisosRol={permisosRol}
              onChange={setPermisosRol}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              Todos los campos son obligatorios
            </p>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 flex justify-between gap-4">

          <button
            onClick={onClose}
            className="w-1/3 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="w-1/3 bg-[#004D77] text-white py-2 rounded-lg hover:bg-[#003D5e] transition-colors cursor-pointer "
          >
            Guardar
          </button>

        </div>

      </div>

    </div>
  )
}