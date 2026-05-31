
import { useState, useEffect } from "react";

import ButtonComponent from "../../../../shared/ButtonComponent";
import TableFilters from "../../../../shared/TableFilters";
import RolesTable from "../components/RolesTable";
import RoleModal from "../components/RoleModal";
import Permission from "../components/Permission";
import PaginationAdmin from "../../../../shared/PaginationAdmin";

import {
  getRoles,
  createRole,
  updateRole,
  toggleRoleStatus,
  getRoleById
} from "../services/rolesServices";

export default function RolesPage() {

  const [search, setSearch] =
    useState("");

  const [roles, setRoles] =
    useState([]);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("create");

  const [selectedRole, setSelectedRole] =
    useState(null);

  const RECORDS_PER_PAGE = 13;

  // ─────────────────────────────
  // CARGAR ROLES
  // ─────────────────────────────

  const loadRoles = async () => {

    try {

      const response =
        await getRoles();

      const rolesData =

        Array.isArray(response)
          ? response
          : response?.data || [];

      setRoles(rolesData);

    } catch (error) {

      console.error(
        "Error cargando roles:",
        error
      );

      setRoles([]);

    }

  };

  useEffect(() => {

    loadRoles();

  }, []);

  useEffect(() => {

    setCurrentPage(1);

  }, [search]);

  // ─────────────────────────────
  // FILTROS
  // ─────────────────────────────

  const filteredRoles = roles.filter((role) => {

    const searchLower =
      search.toLowerCase();

    const date =
      new Date(
        role.createdAt
      );

    const formattedDate =

      isNaN(date)

        ? ""

        : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return (

      role.name
        ?.toLowerCase()
        .includes(searchLower)

      ||

      role.description
        ?.toLowerCase()
        .includes(searchLower)

      ||

      formattedDate.includes(
        searchLower
      )

    );

  });

  // ─────────────────────────────
  // PAGINACIÓN
  // ─────────────────────────────

  const startIndex =

    (currentPage - 1)
    *
    RECORDS_PER_PAGE;

  const paginatedRoles =

    filteredRoles.slice(

      startIndex,

      startIndex +
      RECORDS_PER_PAGE

    );

  // ─────────────────────────────
  // MODALES
  // ─────────────────────────────

  const handleCreate = () => {

    setModalMode(
      "create"
    );

    setSelectedRole(
      null
    );

    setIsModalOpen(
      true
    );

  };


const handleEdit = async (
  role
) => {

  try {

    const fullRole =
      await getRoleById(
        role.id
      );

    setModalMode(
      "edit"
    );

    setSelectedRole(
      fullRole
    );

    setIsModalOpen(
      true
    );

  } catch (error) {

    console.error(
      "Error obteniendo rol:",
      error
    );

  }

};




const handleView = async (
  role
) => {

  try {

    const fullRole =
      await getRoleById(
        role.id
      );

    setModalMode(
      "view"
    );

    setSelectedRole(
      fullRole
    );

    setIsModalOpen(
      true
    );

  } catch (error) {

    console.error(
      "Error obteniendo rol:",
      error
    );

  }

};


  // ─────────────────────────────
  // GUARDAR
  // ─────────────────────────────

  const handleSave = async (
    roleData
  ) => {

    try {

      // ✅ CREAR
      if (
        modalMode === "create"
      ) {

        await createRole(
          roleData
        );

      }

      // ✅ EDITAR
      if (
        modalMode === "edit"
      ) {

        await updateRole({

          id:
            selectedRole.id,

          ...roleData

        });

      }

      // ✅ RECARGAR TABLA
      await loadRoles();

      return {

        success: true

      };

    } catch (error) {

      console.error(
        "Error guardando rol:",
        error
      );

      throw error;

    }

  };

  // ─────────────────────────────
  // ACTIVAR / DESACTIVAR
  // ─────────────────────────────

  const handleToggleActive = async (
    id,
    currentStatus
  ) => {

    try {

      await toggleRoleStatus(
        id,
        currentStatus
      );

      await loadRoles();

    } catch (error) {

      console.error(
        "Error actualizando estado:",
        error
      );

    }

  };

  return (

    <div className="p-6 font-lexend">

      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">

        <div className="-mb-4">

          <TableFilters
            search={search}
            setSearch={setSearch}
            setCurrentPage={setCurrentPage}
            showDateFilters={false}
            searchWidth="w-[380px]"
          />

        </div>

        <Permission permission="roles.crear">

          <ButtonComponent
            onClick={handleCreate}
          >

            Crear nuevo Rol +

          </ButtonComponent>

        </Permission>

      </div>

      <RolesTable
        roles={paginatedRoles}
        onEdit={handleEdit}
        onView={handleView}
        onToggleActive={handleToggleActive}
        search={search}
        reloadRoles={loadRoles}
      />

      <PaginationAdmin
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalRecords={filteredRoles.length}
        recordsPerPage={RECORDS_PER_PAGE}
      />

      <RoleModal
        isOpen={isModalOpen}
        mode={modalMode}
        roleData={selectedRole}
        onSave={handleSave}
        onClose={() =>
          setIsModalOpen(false)
        }
      />

    </div>

  );

}

