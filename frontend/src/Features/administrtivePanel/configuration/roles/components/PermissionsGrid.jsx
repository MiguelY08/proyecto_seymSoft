
import React from "react";

export default function PermissionsGrid({

  permisosSistema = [],
  permisosRol = [],
  onChange = () => {},
  readOnly = false

}) {

  const ACTION_HELP = {
    "pagos_y_abonos.generar_interes":
      "Se usa dentro de Contactar cliente.",
    "pagos_y_abonos.anular":
      "Se usa desde el historial de abonos.",
  };

  const getModuleLabel = (moduleName) => {
    if (moduleName === "dashboard") {
      return "Inicio";
    }

    return String(moduleName || "")
      .replaceAll("_", " ")
      .split(" ")
      .filter(Boolean)
      .map((word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  // ─────────────────────────────
  // TOGGLE ACCIÓN
  // ─────────────────────────────

  const toggleAccion = (

    moduloId,
    accionKey

  ) => {

    if (readOnly) return;

    const updated = permisosRol.map((modulo) => {

      if (modulo.id !== moduloId) {
        return modulo;
      }

      return {

        ...modulo,

        // ✅ NUEVO OBJETO
        selectedActions: {

          ...modulo.selectedActions,

          [accionKey]:

            !modulo.selectedActions?.[
              accionKey
            ]

        }

      };

    });

    onChange(
      structuredClone(updated)
    );

  };

  // ─────────────────────────────
  // TOGGLE MÓDULO
  // ─────────────────────────────

  const toggleModuloCompleto = (
    moduloId
  ) => {

    if (readOnly) return;

    const updated = permisosRol.map((modulo) => {

      if (modulo.id !== moduloId) {
        return modulo;
      }

      const allSelected =

        Object.values(

          modulo.selectedActions || {}

        ).every(Boolean);

      const nuevasAcciones =

        Object.keys(

          modulo.selectedActions || {}

        ).reduce((acc, key) => {

          acc[key] = !allSelected;

          return acc;

        }, {});

      return {

        ...modulo,

        selectedActions:
          nuevasAcciones

      };

    });

    onChange(
      structuredClone(updated)
    );

  };

  // ─────────────────────────────
  // TOGGLE TODOS
  // ─────────────────────────────

  const toggleAllModules = () => {

    if (readOnly) return;

    const allSelected = permisosRol.every(

      (modulo) =>

        Object.values(

          modulo.selectedActions || {}

        ).every(Boolean)

    );

    const updated = permisosRol.map((modulo) => {

      const nuevasAcciones =

        Object.keys(

          modulo.selectedActions || {}

        ).reduce((acc, key) => {

          acc[key] = !allSelected;

          return acc;

        }, {});

      return {

        ...modulo,

        selectedActions:
          nuevasAcciones

      };

    });

    onChange(
      structuredClone(updated)
    );

  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (

    <div>

      {

        !readOnly && (

          <div className="flex justify-end mb-3">

            <button
              onClick={toggleAllModules}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
            >

              Seleccionar todos

            </button>

          </div>

        )

      }

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {

          permisosSistema.map((modulo) => {

            const rolModulo = permisosRol.find(

              (p) => p.id === modulo.id

            );

            const hasPermission =

              rolModulo &&

              Object.values(

                rolModulo.selectedActions || {}

              ).some(Boolean);

            const allChecked =

              rolModulo &&

              Object.values(

                rolModulo.selectedActions || {}

              ).every(Boolean);

            return (

              <div
                key={modulo.id}
                className={`border rounded-xl p-4 shadow-sm bg-white transition

                ${

                  hasPermission

                    ?

                    "border-blue-500 ring-2 ring-blue-400"

                    :

                    "border-gray-400"

                }

                `}
              >

                <div className="flex justify-between items-center mb-3">

                  <h4 className="font-semibold text-sm">

                    {getModuleLabel(modulo.modulo)}

                  </h4>

                  <input
                    type="checkbox"
                    checked={allChecked || false}
                    disabled={readOnly}
                    onChange={() =>
                      toggleModuloCompleto(
                        modulo.id
                      )
                    }
                    className={`accent-blue-600 ${

                      readOnly

                        ?

                        "opacity-100 cursor-default"

                        :

                        "cursor-pointer"

                    }`}
                  />

                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">

                  {

                    modulo.acciones.map((accion) => {

                      const helpText =
                        ACTION_HELP[
                          `${modulo.modulo}.${accion.key}`
                        ];

                      return (

                      <label
                        key={accion.key}
                        className="flex items-start gap-2 cursor-pointer"
                        title={helpText || accion.label}
                      >

                        <input
                          type="checkbox"

                          checked={

                            rolModulo?.selectedActions?.[
                              accion.key
                            ] || false

                          }

                          onChange={() =>

                            toggleAccion(

                              modulo.id,
                              accion.key

                            )

                          }

                          className={`accent-blue-600 ${

                            readOnly

                              ?

                              "pointer-events-none"

                              :

                              "cursor-pointer"

                          }`}
                        />

                        <span className="leading-tight">
                          <span>
                            {accion.label}
                          </span>

                          {helpText && (
                            <span className="block text-[10px] text-gray-500">
                              {helpText}
                            </span>
                          )}
                        </span>

                      </label>

                    );

                    })

                  }

                </div>

              </div>

            );

          })

        }

      </div>

    </div>

  );

}

