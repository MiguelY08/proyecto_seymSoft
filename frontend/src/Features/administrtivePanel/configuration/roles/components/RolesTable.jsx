import { Info, SquarePen, Trash2 } from "lucide-react"

export default function RolesTable({
  roles = [],
  onEdit,
  onView,
  onToggleActive
}) {

  if (!roles.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay roles disponibles
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">

      <table className="min-w-max w-full">

        {/* HEADER */}
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              #
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Nombre del Rol
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Descripción
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Fecha Creación
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Funciones
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {roles.map((role, index) => {

            const rowBg =
              index % 2 === 0 ? "bg-white" : "bg-gray-100"

            return (
              <tr
                key={role.id}
                className={`${rowBg} transition-colors`}
              >

                <td className="px-3 py-2 text-center text-xs">
                  {index + 1}
                </td>

                <td className="px-3 py-2 text-center text-xs font-semibold">
                  {role.name}
                </td>

                <td className="px-3 py-2 text-center text-xs">
                  {role.description}
                </td>

                <td className="px-3 py-2 text-center text-xs">
                  {role.createdAt}
                </td>

                {/* FUNCIONES */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-3">

                    {/* Toggle Activo */}
                    <button
                      onClick={() =>
                        onToggleActive && onToggleActive(role.id)
                      }
                      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer ${
                        role.active
                          ? "bg-green-500"
                          : "bg-red-400"
                      }`}
                    >
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
                          role.active
                            ? "left-1.5"
                            : "right-1.5"
                        }`}
                      >
                        {role.active ? "A" : "I"}
                      </span>

                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                          role.active
                            ? "left-6"
                            : "left-0.5"
                        }`}
                      />
                    </button>

                    {/* Ver */}
                    <Info
                      size={16}
                      onClick={() => onView && onView(role)}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                    />

                    {/* Editar */}
                    <SquarePen
                      size={16}
                      onClick={() => onEdit && onEdit(role)}
                      className="text-gray-400 cursor-pointer hover:scale-110 hover:text-[#004D77] transition"
                    />

                    {/* Eliminar */}
                    <Trash2
                      size={16}
                      className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
                    />

                  </div>
                </td>

              </tr>
            )
          })}
        </tbody>

      </table>

    </div>
  )
}
