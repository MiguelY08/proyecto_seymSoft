import { useEffect } from "react"

export default function PermissionsGrid({
  permisosSistema = [],
  permisosRol = [],
  onChange = () => {},
  readOnly = false
}) {

  //  Sincronizar permisos si vienen vacíos o incompletos
  useEffect(() => {

    if (!permisosSistema.length) return

    const permisosCompletos = permisosSistema.map(modulo => {

      const existente = permisosRol.find(p => p.id === modulo.id)

      if (existente) return existente

      return {
        id: modulo.id,
        acciones: modulo.acciones.reduce((acc, accion) => {
          acc[accion] = false
          return acc
        }, {})
      }
    })

    if (JSON.stringify(permisosCompletos) !== JSON.stringify(permisosRol)) {
      onChange(permisosCompletos)
    }

  }, [permisosSistema])

  //  Toggle acción individual
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

  //  Toggle seleccionar todo el módulo
  const toggleModuloCompleto = (moduloId) => {
    if (readOnly) return

    const updated = permisosRol.map(modulo => {

      if (modulo.id === moduloId) {

        const allSelected =
          Object.values(modulo.acciones).every(Boolean)

        const nuevasAcciones = Object.keys(modulo.acciones).reduce(
          (acc, key) => {
            acc[key] = !allSelected
            return acc
          },
          {}
        )

        return { ...modulo, acciones: nuevasAcciones }
      }

      return modulo
    })

    onChange(updated)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {permisosSistema.map((modulo) => {

        const rolModulo =
          permisosRol.find(p => p.id === modulo.id)

        const allChecked =
          rolModulo &&
          Object.values(rolModulo.acciones).every(Boolean)

        return (
          <div
            key={modulo.id}
            className="border border-gray-400   rounded-xl p-4 shadow-sm bg-white"
          >

            {/* Header módulo */}
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
                className="cursor-pointer"
              />
            </div>

            {/* Acciones */}
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
                    disabled={readOnly}
                    onChange={() =>
                      toggleAccion(modulo.id, accion)
                    }
                  />

                  {accion.charAt(0).toUpperCase() + accion.slice(1)}
                </label>
              ))}

            </div>

          </div>
        )
      })}

    </div>
  )
}
