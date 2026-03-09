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

  /* ======================================================
  Estados principales
  ====================================================== */

  const [search,setSearch] = useState("")
  const [roles,setRoles] = useState([])

  const [isModalOpen,setIsModalOpen] = useState(false)
  const [modalMode,setModalMode] = useState("create")
  const [selectedRole,setSelectedRole] = useState(null)


  /* ======================================================
  Cargar roles desde storage
  ====================================================== */

  const loadRoles = () => {

    const storedRoles = getRoles()

    setRoles(storedRoles)

  }

  useEffect(()=>{

    loadRoles()

  },[])


  /* ======================================================
  Filtrar roles por búsqueda
  ====================================================== */

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(search.toLowerCase())
  )


  /* ======================================================
  Abrir modal crear
  ====================================================== */

  const handleCreate = () => {

    setModalMode("create")
    setSelectedRole(null)
    setIsModalOpen(true)

  }


  /* ======================================================
  Abrir modal editar
  ====================================================== */

  const handleEdit = (role) => {

    setModalMode("edit")
    setSelectedRole(role)
    setIsModalOpen(true)

  }


  /* ======================================================
  Abrir modal ver
  ====================================================== */

  const handleView = (role) => {

    setModalMode("view")
    setSelectedRole(role)
    setIsModalOpen(true)

  }


  /* ======================================================
  Guardar rol (crear o editar)
  ====================================================== */

  const handleSave = (roleData) => {

    if(modalMode === "create"){

      createRole(roleData)

    }

    if(modalMode === "edit"){

      updateRole(roleData)

    }

    /* recargar roles */
    loadRoles()

  }


  /* ======================================================
  Activar / desactivar rol
  ====================================================== */

  const handleToggleActive = (id) => {

    toggleRoleStatus(id)

    loadRoles()

  }


  return (

    <div className="p-6 font-lexend">

      {/* ======================================================
      Barra superior
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">

        {/* BUSCADOR */}

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


        {/* BOTÓN CREAR */}

        <div className="flex justify-end">

          <ButtonComponent onClick={handleCreate}>
            Crear nuevo Rol +
          </ButtonComponent>

        </div>

      </div>


      {/* ======================================================
      Tabla de roles
      ====================================================== */}

      <RolesTable
        roles={filteredRoles}
        onEdit={handleEdit}
        onView={handleView}
        onToggleActive={handleToggleActive}
      />


      {/* ======================================================
      Modal crear / editar / ver rol
      ====================================================== */}

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