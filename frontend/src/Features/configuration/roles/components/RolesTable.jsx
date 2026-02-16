// Mock data (simula respuesta de API)
const mockRoles = [
  {
    id: 1,
    name: "Administrador",
    description: "Control total del sistema",
    date: "2026-02-15"
  },
  {
    id: 2,
    name: "Vendedor",
    description: "Gestión de ventas y clientes",
    date: "2026-02-10"
  }
];

export default function RolesTable({ roles = mockRoles }) {
  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-md">
      <table className="min-w-full text-sm font-lexend">

        {/* Header */}
        <thead className="bg-[#0f4c6e] text-white">
          <tr>
            <th className="px-4 py-3 text-left">Nro</th>
            <th className="px-4 py-3 text-left">Nombre del Rol</th>
            <th className="px-4 py-3 text-left">Descripción</th>
            <th className="px-4 py-3 text-left">Fecha Creación</th>
            <th className="px-4 py-3 text-center">Funciones</th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y">

          {roles.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No hay roles registrados
              </td>
            </tr>
          ) : (
            roles.map((rol, index) => (
              <tr key={rol.id} className="hover:bg-gray-50 transition">

                <td className="px-4 py-3">{index + 1}</td>

                <td className="px-4 py-3 font-medium">
                  {rol.name}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {rol.description}
                </td>

                <td className="px-4 py-3">
                  {rol.date}
                </td>

                <td className="px-4 py-3 flex justify-center gap-3">

                  <button className="text-blue-600 hover:text-blue-800 transition">
                    ✏️
                  </button>

                  <button className="text-green-600 hover:text-green-800 transition">
                    ⏻
                  </button>

                  <button className="text-red-600 hover:text-red-800 transition">
                    🗑️
                  </button>

                </td>

              </tr>
            ))
          )}

        </tbody>
      </table>
    </div>
  );
}
