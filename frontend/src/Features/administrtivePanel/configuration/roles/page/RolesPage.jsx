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
} from "../services/rolesServices";

export default function RolesPage() {
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedRole, setSelectedRole] = useState(null);

  const RECORDS_PER_PAGE = 13;

  const loadRoles = () => {
    const storedRoles = getRoles();
    setRoles(storedRoles);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  //  Filtro SOLO por búsqueda
 const filteredRoles = roles.filter((role) => {
  const searchLower = search.toLowerCase();

  // Formatear la fecha igual a como la muestra la tabla "20/3/2026"
  const date = new Date(role.createdAt);
  const formattedDate = isNaN(date)
    ? ""
    : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  return (
    role.name.toLowerCase().includes(searchLower) ||
    role.description.toLowerCase().includes(searchLower) ||
    formattedDate.includes(searchLower)
  );
});

  const handleSearch = (value) => {
    setSearch(value);
  };

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + RECORDS_PER_PAGE
  );

  const handleCreate = () => {
    setModalMode("create");
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setModalMode("edit");
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleView = (role) => {
    setModalMode("view");
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSave = (roleData) => {
    if (modalMode === "create") createRole(roleData);
    if (modalMode === "edit") updateRole(roleData);
    loadRoles();
  };

  const handleToggleActive = (id) => {
    toggleRoleStatus(id);
    loadRoles();
  };

  return (
<div className="p-6 font-lexend">
  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
    
    <div className="-mb-4">
      <TableFilters
        search={search}
        setSearch={handleSearch}
        setCurrentPage={setCurrentPage}
        showDateFilters={false}
        searchWidth="w-[380px]"
      />
    </div>

    <Permission permission="roles.crear">
      <ButtonComponent onClick={handleCreate}>
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
  />

  <PaginationAdmin
    currentPage={currentPage}
    onPageChange={setCurrentPage}
    totalRecords={filteredRoles.length}
    recordsPerPage={RECORDS_PER_PAGE}
  />

  <RoleModal
    key={`${modalMode}-${selectedRole?.id ?? "new"}-${isModalOpen}`}
    isOpen={isModalOpen}
    mode={modalMode}
    roleData={selectedRole}
    onSave={handleSave}
    onClose={() => setIsModalOpen(false)}
  />
</div>
  );
}
