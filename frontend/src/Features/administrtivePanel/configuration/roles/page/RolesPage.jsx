import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Plus } from "lucide-react";

import ButtonComponent from "../../../../shared/ButtonComponent";
import TableFilters from "../../../../shared/TableFilters";
import RolesTable from "../components/RolesTable";
import RoleMetricsCards from "../components/RoleMetricsCards";
import RoleModal from "../components/RoleModal";
import Permission from "../components/Permission";
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import Spinner from "../../../../shared/spinner/Spinner";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { getRoleErrorInfo } from "../helpers/roleErrorMapper";

import {
  getRoles,
  createRole,
  updateRole,
  toggleRoleStatus,
  getRoleById
} from "../services/rolesServices";

export default function RolesPage() {

  const { showError, showWarning } =
    useAlert();

  const [search, setSearch] =
    useState("");

  const [roles, setRoles] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("create");

  const [selectedRole, setSelectedRole] =
    useState(null);

  const openingModalRef =
    useRef(false);

  const loadingRoleRef =
    useRef(false);

  const RECORDS_PER_PAGE = 13;

  // ─────────────────────────────
  // CARGAR ROLES
  // ─────────────────────────────

  const loadRoles = useCallback(async ({ showSpinner = true } = {}) => {

    try {

      if (showSpinner) {
        setLoading(true);
      }

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

      const errorInfo =
        getRoleErrorInfo(error, "load");

      const showAlert =
        errorInfo.type === "error"
          ? showError
          : showWarning;

      showAlert(
        errorInfo.title,
        errorInfo.message
      );

    } finally {

      if (showSpinner) {
        setLoading(false);
      }

    }

  }, [showError, showWarning]);

  useEffect(() => {

    loadRoles();

  }, [loadRoles]);

  useEffect(() => {

    setCurrentPage(1);

  }, [search]);

  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const activeRoles = roles.filter((role) => role.active).length;

    return {
      totalRoles,
      activeRoles,
      inactiveRoles: totalRoles - activeRoles,
    };
  }, [roles]);

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

    if (
      isModalOpen ||
      openingModalRef.current
    ) {
      return;
    }

    openingModalRef.current = true;

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

    if (
      isModalOpen ||
      loadingRoleRef.current
    ) {
      return;
    }

    loadingRoleRef.current = true;

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

      const errorInfo =
        getRoleErrorInfo(error, "detail");

      showError(
        errorInfo.title,
        errorInfo.message
      );

    } finally {

      loadingRoleRef.current = false;

    }

  };

  const handleView = async (
    role
  ) => {

    if (
      isModalOpen ||
      loadingRoleRef.current
    ) {
      return;
    }

    loadingRoleRef.current = true;

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

      const errorInfo =
        getRoleErrorInfo(error, "detail");

      showError(
        errorInfo.title,
        errorInfo.message
      );

    } finally {

      loadingRoleRef.current = false;

    }

  };

  // ─────────────────────────────
  // GUARDAR
  // ─────────────────────────────

  const handleSave = async (
    roleData
  ) => {

    try {

      if (
        modalMode === "create"
      ) {

        await createRole(
          roleData
        );

      }

      if (
        modalMode === "edit"
      ) {

        await updateRole({

          id:
            selectedRole.id,

          ...roleData

        });

      }

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

  if (loading) {

    return (

      <Permission permission="roles.ver">

        <Spinner
          message="Cargando roles..."
        />

      </Permission>

    );

  }

  return (

    <Permission permission="roles.ver">
      <div className="p-3 sm:p-4 font-lexend">

        <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-4">

          <div className="w-full lg:flex-1">

            <TableFilters
              search={search}
              setSearch={setSearch}
              setCurrentPage={setCurrentPage}
              showDateFilters={false}
              searchWidth="w-full lg:max-w-md"
            />

          </div>

          <Permission permission="roles.crear">

            <ButtonComponent
              onClick={handleCreate}
              disabled={isModalOpen}
              title="Nuevo"
              className="flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <span>Nuevo</span>
              <Plus className="h-4 w-4" strokeWidth={2} />

            </ButtonComponent>

          </Permission>

        </div>

        <div className="mb-4">
          <RoleMetricsCards metrics={metrics} />
        </div>

        <RolesTable
          roles={paginatedRoles}
          onEdit={handleEdit}
          onView={handleView}
          onToggleActive={handleToggleActive}
          search={search}
          isSearching={Boolean(search.trim())}
          onCreateRole={handleCreate}
          reloadRoles={loadRoles}
        />

        {filteredRoles.length > 0 && (
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={filteredRoles.length}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        )}

        <RoleModal
          isOpen={isModalOpen}
          mode={modalMode}
          roleData={selectedRole}
          onSave={handleSave}
          onClose={() => {
            openingModalRef.current = false;
            setIsModalOpen(false);
          }}
        />

      </div>

    </Permission>

  );

}
