import { useState, useEffect } from "react";
import { Search } from "lucide-react";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [estado, setEstado] = useState("todos");
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate, estado]);

  // Formatear fecha para comparación (YYYY-MM-DD)
  const formatDateForComparison = (dateString) => {
    if (!dateString) return null;

    // Si es ISO (contiene T), extraer solo la fecha
    if (dateString.includes("T")) {
      return dateString.split("T")[0]; // "2026-03-18"
    }

    // Si es formato DD/MM/YYYY, convertir a YYYY-MM-DD
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Si ya está en YYYY-MM-DD, devolverlo tal cual
    return dateString;
  };

  const filteredRoles = roles.filter((role) => {
    // 🔍 BÚSQUEDA COMPLETA: nombre, descripción, estado y fechas
    const searchLower = search.toLowerCase();
    const estadoTexto = role.active ? "activo" : "inactivo";
    const dateString = role.createdAt
      ? new Date(role.createdAt).toLocaleDateString("es-ES")
      : "";

    const matchesSearch =
      role.name.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower) ||
      estadoTexto.includes(searchLower) ||
      dateString.includes(searchLower);

    // 📊 FILTRO POR ESTADO
    const matchesEstado =
      estado === "todos" ||
      (estado === "activo" && role.active) ||
      (estado === "inactivo" && !role.active);

    // 📅 FILTRO POR FECHAS - Comparación en formato YYYY-MM-DD
    const roleDate = role.createdAt
      ? formatDateForComparison(role.createdAt)
      : null;
    const startDateFormatted = startDate
      ? formatDateForComparison(startDate)
      : null;
    const endDateFormatted = endDate ? formatDateForComparison(endDate) : null;

    // Lógica mejorada:
    // Si no hay filtros de fecha, pasar el filtro
    // Si hay filtros pero el rol no tiene fecha, no pasar
    // Si hay filtros y el rol tiene fecha, comparar
    let matchesStartDate = true;
    let matchesEndDate = true;

    if (startDateFormatted && roleDate) {
      matchesStartDate = roleDate >= startDateFormatted;
    } else if (startDateFormatted && !roleDate) {
      matchesStartDate = false; // Hay filtro pero sin fecha en rol
    }

    if (endDateFormatted && roleDate) {
      matchesEndDate = roleDate <= endDateFormatted;
    } else if (endDateFormatted && !roleDate) {
      matchesEndDate = false; // Hay filtro pero sin fecha en rol
    }

    if (startDateFormatted || endDateFormatted) {
      console.log(
        `${role.name}: roleDate=${roleDate}, start=${startDateFormatted}, end=${endDateFormatted}, matchStart=${matchesStartDate}, matchEnd=${matchesEndDate}`,
      );
    }

    return matchesSearch && matchesEstado && matchesStartDate && matchesEndDate;
  });

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + RECORDS_PER_PAGE,
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
      <TableFilters
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setCurrentPage={setCurrentPage}
      >
        <div className="flex items-end gap-4 flex-wrap">
          <div className="w-full sm:w-56">
            <label className="block text-xs font-medium mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-sky-900 text-sm"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <Permission permission="roles.crear">
            <ButtonComponent onClick={handleCreate}>
              Crear nuevo Rol +
            </ButtonComponent>
          </Permission>
        </div>
      </TableFilters>

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
