import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import TopBar          from '../components/TopBar';
import SalesTable      from '../components/SalesTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';

const STORAGE_KEY      = 'pm_sales';
const RECORDS_PER_PAGE = 13;

// ─── Helpers localStorage ─────────────────────────────────────────────────────
const loadSales = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveSales = (sales) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
};

// ─── Sales ────────────────────────────────────────────────────────────────────
function Sales() {
  const location                     = useLocation();
  const [data,        setData]        = useState(loadSales);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setData(loadSales());
  }, [location.pathname]);

  useEffect(() => {
    saveSales(data);
  }, [data]);

  const handleAnular = (id) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, estado: 'Anulada' } : row));
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ─── Filtro global ────────────────────────────────────────────────────────
  const filtered = data.filter((row) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      row.cliente.toLowerCase().includes(term)          ||
      row.vendedor.toLowerCase().includes(term)         ||
      String(row.factura).toLowerCase().includes(term)  ||
      row.fecha.toLowerCase().includes(term)            ||
      row.metodoPago.toLowerCase().includes(term)       ||
      String(row.total).toLowerCase().includes(term)    ||
      row.estado.toLowerCase().includes(term)
    );
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* ── Barra superior ───────────────────────────────────────────────── */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <SalesTable
          data={paginatedData}
          onAnular={handleAnular}
          search={search}
          totalData={data.length}
          offset={(currentPage - 1) * RECORDS_PER_PAGE}
        />
      </div>

      {/* ── Paginador separado del card ──────────────────────────────────── */}
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

export default Sales;