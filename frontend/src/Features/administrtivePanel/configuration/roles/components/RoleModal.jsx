import { useEffect, useState } from "react"
import { X } from "lucide-react"
import PermissionsGrid from "./PermissionsGrid"
import { permissionsList } from "../permissions/permissionsList"

export default function RoleModal({
  isOpen,
  onClose,
  onSave,
  roleData,
  mode = "create"
}) {

  const isView = mode === "view"

  const today = new Date().toLocaleDateString()

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [permisosRol, setPermisosRol] = useState([])

  /* =================================
     Cargar datos según modo
  ================================= */

  useEffect(() => {

    if ((mode === "edit" || mode === "view") && roleData) {

      setNombre(roleData.name || "")
      setDescripcion(roleData.description || "")
      setPermisosRol(roleData.permisos || [])

    }

    if (mode === "create") {

      setNombre("")
      setDescripcion("")
      setPermisosRol([])

    }

  }, [roleData, mode])

  if (!isOpen) return null

  /* =================================
     Guardar rol
  ================================= */

  const handleSubmit = () => {

    if (isView) return

    const payload = {

      id: roleData?.id,

      name: nombre.trim(),

      description: descripcion.trim(),

      active: roleData?.active ?? true,

      createdAt: roleData?.createdAt || today,

      permisos: permisosRol

    }

    onSave(payload)

    onClose()

  }

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col font-lexend z-10">

        {/* HEADER */}
        <div className="bg-[#0E5676] text-white px-6 py-4 flex justify-between items-center rounded-t-xl">

          <h2 className="text-lg font-semibold">

            {mode === "create" && "Crear Rol"}
            {mode === "edit" && "Editar Rol"}
            {mode === "view" && "Ver Rol"}

          </h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* IZQUIERDA */}
            <div className="space-y-6">

              <div>

                <label className="text-sm font-medium">
                  Nombre del Rol
                </label>

                <input
                  value={nombre}
                  disabled={isView}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full mt-2 border border-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-blue-600"
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Fecha de Creación
                </label>

                <input
                  value={roleData?.createdAt || today}
                  disabled
                  className="w-full mt-2 bg-gray-200 rounded-lg px-4 py-2 text-sm"
                />

              </div>

            </div>

            {/* DERECHA */}
            <div>

              <label className="text-sm font-medium">
                Descripción
              </label>

              <textarea
                rows="4"
                value={descripcion}
                disabled={isView}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full mt-2 border border-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-blue-600"
              />

            </div>

          </div>

          {/* PERMISOS */}
          <div>

            <h3 className="text-sm font-semibold mb-4">
              Permisos y Privilegios
            </h3>

            <PermissionsGrid
              permisosSistema={permissionsList}
              permisosRol={permisosRol}
              onChange={setPermisosRol}
              readOnly={isView}
            />

          </div>

        </div>

        {/* FOOTER */}

        {mode !== "view" && (

          <div className="px-6 py-4 flex justify-between gap-4">

            <button
              onClick={onClose}
              className="w-1/3 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="w-1/3 bg-[#004D77] text-white py-2 rounded-lg hover:bg-[#003b5c] transition"
            >
              Guardar
            </button>

          </div>

        )}

      </div>

    </div>

  )

}