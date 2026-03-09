import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import UsersTable      from '../components/UsersTable';
import PaginationAdmin from '../../../shared/PaginationAdmin';
import { UsersDB }     from '../services/usersDB';

const RECORDS_PER_PAGE = 13;

// ─── Users ────────────────────────────────────────────────────────────────────
function Users({ onDownload }) {
  const location                     = useLocation();
  const [data,        setData]        = useState(() => UsersDB.list());
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Recargar al volver del formulario tras crear/editar
  useEffect(() => {
    setData(UsersDB.list());
  }, [location.pathname]);

  // ─── Acciones ──────────────────────────────────────────────────────────────
  const handleToggle = (id) => {
    const updated = UsersDB.toggle(id);
    setData(updated);
  };

  const handleDelete = (row) => {
    const updated = UsersDB.delete(row.id);
    setData(updated);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ─── Filtro ────────────────────────────────────────────────────────────────
  const filtered = data.filter((row) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    const estadoTexto  = row.activo ? 'activo' : 'inactivo';
    const termosEstado = ['activo', 'activos', 'inactivo', 'inactivos'];
    const matchEstado  = termosEstado.includes(term) &&
                         estadoTexto.startsWith(term.replace(/s$/, ''));

    return (
      row.documento.toLowerCase().includes(term) ||
      row.nombre.toLowerCase().includes(term)    ||
      row.correo.toLowerCase().includes(term)    ||
      row.telefono.toLowerCase().includes(term)  ||
      row.tipo.toLowerCase().includes(term)      ||
      row.rol.toLowerCase().includes(term)       ||
      matchEstado
    );
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
        onDownload={onDownload}
      />

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md">
        <UsersTable
          data={paginatedData}
          onToggle={handleToggle}
          onDelete={handleDelete}
          search={search}
          totalData={data.length}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
        />
      </div>

      {/* ── Paginador ──────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filtered.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      <Outlet />
    </div>
  );
}

export default Users;