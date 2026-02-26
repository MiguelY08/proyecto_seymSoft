import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar         from '../components/TopBar';
import UsersTable     from '../components/UsersTable';
import PaginatorUsers from '../components/PaginatorUsers';

const STORAGE_KEY      = 'pm_users';
const RECORDS_PER_PAGE = 13;

// ─── Helpers localStorage ─────────────────────────────────────────────────────
const loadUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// ─── Users ────────────────────────────────────────────────────────────────────
function Users({ onDownload }) {
  const location                     = useLocation();
  const [data,        setData]        = useState(loadUsers);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setData(loadUsers());
  }, [location.pathname]);

  useEffect(() => {
    saveUsers(data);
  }, [data]);

  const handleToggle = (id) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, activo: !row.activo } : row));
  };

  const handleDelete = (row) => {
    setData((prev) => prev.filter((r) => r.id !== row.id));
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filtered = data.filter((row) => {
      const term = search.toLowerCase().trim();
      if (!term) return true;

      // ─── Normalizar estado para búsqueda ────────────────────────────────────
      const estadoTexto = row.activo ? 'activo' : 'inactivo';
      const termosEstado = ['activo', 'activos', 'inactivo', 'inactivos'];
      const matchEstado  = termosEstado.includes(term) && estadoTexto.startsWith(term.replace(/s$/, ''));

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

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <UsersTable
          data={paginatedData}
          onToggle={handleToggle}
          onDelete={handleDelete}
          search={search}
          totalData={data.length}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
        />

        {data.length > 0 && (
          <div className="border-t border-gray-400 bg-gray-50 px-4 py-0.5">
            <PaginatorUsers
              recordsPerPage={RECORDS_PER_PAGE}
              totalRecords={filtered.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
}

export default Users;