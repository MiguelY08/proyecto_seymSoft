import { useEffect } from "react"

export default function PermissionsGrid({
  permisosSistema = [],
  permisosRol = [],
  onChange = () => {},
  readOnly = false
}) {

  /* ======================================================
  Sincronizar estructura inicial de permisos
  Solo se ejecuta cuando el rol no tiene permisos aún
  ====================================================== */

  useEffect(() => {

    if (!permisosSistema.length) return

    /* evitar sobrescribir permisos existentes */

    if (permisosRol.length > 0) return

    const permisosIniciales = permisosSistema.map(modulo => ({

      id: modulo.id,

      acciones: modulo.acciones.reduce((acc, accion) => {

        acc[accion] = false
        return acc

      }, {})

    }))

    onChange(permisosIniciales)

  }, [permisosSistema])


  /* ======================================================
  Activar / desactivar una acción individual
  ====================================================== */

  const toggleAccion = (moduloId, accion) => {

    if (readOnly) return

    const updated = permisosRol.map(modulo =>

      modulo.id === moduloId
        ? {
            ...modulo,
            acciones: {
              ...modulo.acciones,
              [accion]: !modulo.acciones[accion]
            }
          }
        : modulo

    )

    onChange(updated)

  }


  /* ======================================================
  Seleccionar todo el módulo
  ====================================================== */

  const toggleModuloCompleto = (moduloId) => {

    if (readOnly) return

    const updated = permisosRol.map(modulo => {

      if (modulo.id === moduloId) {

        const allSelected =
          Object.values(modulo.acciones).every(Boolean)

        const nuevasAcciones = Object.keys(modulo.acciones)
          .reduce((acc, key) => {

            acc[key] = !allSelected
            return acc

          }, {})

        return { ...modulo, acciones: nuevasAcciones }

      }

      return modulo

    })

    onChange(updated)

  }


  /* ======================================================
  Seleccionar todos los módulos
  ====================================================== */

  const toggleAllModules = () => {

    if (readOnly) return

    const allSelected = permisosRol.every(modulo =>
      Object.values(modulo.acciones).every(Boolean)
    )

    const updated = permisosRol.map(modulo => {

      const nuevasAcciones = Object.keys(modulo.acciones)
        .reduce((acc, key) => {

          acc[key] = !allSelected
          return acc

        }, {})

      return { ...modulo, acciones: nuevasAcciones }

    })

    onChange(updated)

  }


  return (

    <div>

      {/* ======================================================
      Botón seleccionar todos
      ====================================================== */}

      {!readOnly && (

        <div className="flex justify-end mb-3">

          <button
            onClick={toggleAllModules}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
          >
            Seleccionar todos
          </button>

        </div>

      )}


      {/* ======================================================
      Grid de módulos
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {permisosSistema.map((modulo) => {

          const rolModulo =
            permisosRol.find(p => p.id === modulo.id)

          /* detectar si el módulo tiene permisos activos */

          const hasPermission =
            rolModulo &&
            Object.values(rolModulo.acciones).some(Boolean)

          const allChecked =
            rolModulo &&
            Object.values(rolModulo.acciones).every(Boolean)

          return (

            <div
              key={modulo.id}
              className={`border rounded-xl p-4 shadow-sm bg-white transition
              ${
                hasPermission
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "border-gray-400"
              }`}
            >

              {/* ======================================================
              Header módulo
              ====================================================== */}

              <div className="flex justify-between items-center mb-3">

                <h4 className="font-semibold text-sm">
                  {modulo.modulo}
                </h4>

                <input
                  type="checkbox"
                  checked={allChecked || false}
                  disabled={readOnly}
                  onChange={() =>
                    toggleModuloCompleto(modulo.id)
                  }
                  className={`accent-blue-600 ${
                    readOnly
                      ? "opacity-100 cursor-default"
                      : "cursor-pointer"
                  }`}
                />

              </div>


              {/* ======================================================
              Acciones del módulo
              ====================================================== */}

              <div className="grid grid-cols-2 gap-3 text-sm">

                {modulo.acciones.map((accion) => (

                  <label
                    key={accion}
                    className="flex items-center gap-2 cursor-pointer"
                  >

                    <input
                      type="checkbox"
                      checked={
                        rolModulo?.acciones?.[accion] || false
                      }
                      onChange={() =>
                        toggleAccion(modulo.id, accion)
                      }
                      className={`accent-blue-600 ${
                        readOnly
                          ? "pointer-events-none cursor-default"
                          : "cursor-pointer"
                      }`}
                    />

                    {accion.charAt(0).toUpperCase() + accion.slice(1)}

                  </label>

                ))}

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}