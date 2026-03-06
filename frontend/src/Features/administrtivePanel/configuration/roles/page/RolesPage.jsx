import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import ButtonComponent from "../../../../shared/ButtonComponent"

import RolesTable from "../components/RolesTable"
import RoleModal from "../components/RoleModal"

import {
  getRoles,
  createRole,
  updateRole,
  toggleRoleStatus
} from "../services/rolesServices"

export default function RolesPage() {

  const [search,setSearch] = useState("")
  const [isModalOpen,setIsModalOpen] = useState(false)
  const [modalMode,setModalMode] = useState("create")
  const [selectedRole,setSelectedRole] = useState(null)

  const [roles,setRoles] = useState([])

  // cargar roles
  useEffect(()=>{

    const storedRoles = getRoles()

    setRoles(storedRoles)

  },[])

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = () => {

    setModalMode("create")
    setSelectedRole(null)
    setIsModalOpen(true)

  }

  const handleEdit = (role) => {

    setModalMode("edit")
    setSelectedRole(role)
    setIsModalOpen(true)

  }

  const handleView = (role) => {

    setModalMode("view")
    setSelectedRole(role)
    setIsModalOpen(true)

  }

  const handleSave = (roleData) => {

    if(modalMode === "create"){

      const newRole = createRole(roleData)

      setRoles(prev => [...prev,newRole])

    }

    if(modalMode === "edit"){

      updateRole(roleData)

      setRoles(prev =>
        prev.map(role =>
          role.id === roleData.id
            ? roleData
            : role
        )
      )

    }

  }

  const handleToggleActive = (id) => {

    toggleRoleStatus(id)

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
              onChange={(e)=>setSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            />

            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

          </div>

        </div>

        <div className="flex justify-end">

          <ButtonComponent onClick={handleCreate}>
            Crear nuevo Rol +
          </ButtonComponent>

        </div>

      </div>

      <RolesTable
        roles={filteredRoles}
        onEdit={handleEdit}
        onView={handleView}
        onToggleActive={handleToggleActive}
      />

      <RoleModal
        isOpen={isModalOpen}
        mode={modalMode}
        roleData={selectedRole}
        onSave={handleSave}
        onClose={()=>setIsModalOpen(false)}
      />

    </div>

  )

}