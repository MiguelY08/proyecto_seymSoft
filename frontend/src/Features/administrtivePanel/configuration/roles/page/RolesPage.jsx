import { useState } from "react"
import { Search } from "lucide-react"
import ButtonComponent from "../../../../shared/ButtonComponent"

import RolesTable from "../components/RolesTable"
import CreateRoleModal from "../components/CreateRolModal"
import EditRoleModal from "../components/EditRoleModal"
import ViewRoleModal from "../components/VieRoleModal"

export default function RolesPage() {

  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  //  Estado dinámico real
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Administrador",
      description: "Acceso total al sistema",
      createdAt: new Date().toLocaleDateString(),
      active: true,
      permisos: []
    },
    {
      id: 2,
      name: "Empleado ventas",
      description: "Solo ventas",
      createdAt: new Date().toLocaleDateString(),
      active: true,
      permisos: []
    }
  ])

  // 🔍 Filtro búsqueda
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
  )

  //  Crear rol
  const handleCreate = (newRole) => {

    const newRoleWithId = {
      ...newRole,
      id: roles.length + 1
    }

    setRoles(prev => [...prev, newRoleWithId])
  }

  //  Editar rol
  const handleUpdate = (updatedRole) => {

    setRoles(prev =>
      prev.map(role =>
        role.id === updatedRole.id
          ? { ...role, ...updatedRole }
          : role
      )
    )
  }

  //  Ver rol
  const handleView = (role) => {
    setSelectedRole(role)
    setIsViewOpen(true)
  }

  //  Editar rol
  const handleEdit = (role) => {
    setSelectedRole(role)
    setIsEditOpen(true)
  }

  //  Toggle activo
  const handleToggleActive = (id) => {

    setRoles(prev =>
      prev.map(role =>
        role.id === id
          ? { ...role, active: !role.active }
          : role
      )
    )
  }

  return (
    <div className="p-6 font-lexend">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">

        <div>
          <label className="block text-sm font-semibold mb-2">
            Buscar Rol
          </label>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar por nombre del rol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <ButtonComponent onClick={() => setIsCreateOpen(true)}>
            Crear nuevo Rol +
          </ButtonComponent>
        </div>

      </div>

      {/* TABLA */}
      <RolesTable
        roles={filteredRoles}
        onEdit={handleEdit}
        onView={handleView}
        onToggleActive={handleToggleActive}
      />

      {/* MODAL CREAR */}
      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
      />

      {/* MODAL EDITAR */}
      <EditRoleModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        roleData={selectedRole}
        onSave={handleUpdate}
      />

      {/* MODAL VER */}
      <ViewRoleModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        roleData={selectedRole}
      />

    </div>
  )
}
