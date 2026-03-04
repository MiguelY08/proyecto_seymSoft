import React, { useState, useEffect, useRef } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import CategoriesTable from "../components/CategoriesTable";
import SearchInput from "../components/SearchInput";
import FormCategory from "./FormCategory";
import { Plus } from "lucide-react";
import EditCategory from "./EditCategory";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const { showConfirm, showSuccess, showError, showInfo } = useAlert();
  const alertShownRef = useRef(false);

  const mockCategories = [
    { id: 1, nombre: "Oficina", estado: "Activo" },
    { id: 2, nombre: "Útiles Escolares", estado: "Activo" },
    { id: 3, nombre: "Escritura y Corrección", estado: "Inactivo" },
    { id: 4, nombre: "Arte y Manualidades", estado: "Activo" },
    { id: 5, nombre: "Tecnología", estado: "Inactivo" },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 400));
      setCategories(mockCategories);

    } catch {
      setError("Error al cargar categorías");
      showError("Error", "No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔥 Editar
  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setShowForm(true);
  };

  // 🔥 Activar / Desactivar
  const handleToggleStatus = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const result = await showConfirm(
      "question",
      "Cambiar estado",
      `¿Deseas cambiar el estado de "${category.nombre}"?`,
      { confirmButtonText: "Sí", cancelButtonText: "No" }
    );

    if (!result?.isConfirmed) return;

    const updated = categories.map((cat) =>
      cat.id === id
        ? {
            ...cat,
            estado: cat.estado === "Activo" ? "Inactivo" : "Activo",
          }
        : cat
    );

    setCategories(updated);
    showSuccess("Actualizado", "El estado fue actualizado.");
  };

  // 🔥 Eliminar
  const handleDelete = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const result = await showConfirm(
      "warning",
      "Eliminar categoría",
      `¿Seguro que deseas eliminar "${category.nombre}"?`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (!result?.isConfirmed) return;

    const updated = categories.filter((cat) => cat.id !== id);
    setCategories(updated);
    showSuccess("Eliminado", "La categoría fue eliminada.");
  };

  // 🔥 Filtro
  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  // 🔥 Alerta si no hay resultados
  useEffect(() => {
    const hayFiltroActivo = search !== "";

    if (
      !loading &&
      !error &&
      filteredCategories.length === 0 &&
      hayFiltroActivo &&
      !alertShownRef.current
    ) {
      showInfo(
        "Sin resultados",
        "No se encontraron categorías con el filtro aplicado."
      );

      alertShownRef.current = true;
    }

    if (filteredCategories.length > 0) {
      alertShownRef.current = false;
    }

  }, [filteredCategories, search, loading, error]);

  // 🔥 Highlight
  const highlightText = (text = "") => {
    if (!search) return text;

    const safeText = String(text);
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeSearch})`, "gi");

    return safeText.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span
          key={index}
          className="bg-[#004d7726] text-[#004D77] rounded px-1 font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const RECORDS_PER_PAGE = 13;
  const totalPages = Math.ceil(filteredCategories.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = filteredCategories.slice(startIndex, endIndex);
  // 🔥 Guardar categoría (crear o editar)
const handleSave = (category, isEditing) => {
  if (isEditing) {
    // Editar
    const updated = categories.map((c) =>
      c.id === category.id ? category : c
    );
    setCategories(updated);
  } else {
    // Crear
    const newId =
      categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;

    const newCategory = { ...category, id: newId };
    setCategories([...categories, newCategory]);
  }
};

  {/* 🔥 Modal */}
{showForm && (
  <EditCategory
    category={categoryToEdit}
    onClose={() => setShowForm(false)}
    onSave={handleSave} // función que actualiza el estado de categories
  />
)}

  return (
    <div className="px-4 md:px-0 max-w-5xl mx-auto">

      {/* 🔵 Barra superior */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 mt-7">

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar"
        />

        <button
          onClick={() => {
            setCategoryToEdit(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Crear Categoría</span>
          <span className="sm:hidden">Nuevo</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {loading && <p className="text-gray-500">Cargando categorías...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && filteredCategories.length > 0 && (
        <CategoriesTable
          currentData={currentData}
          filteredCategories={filteredCategories}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          handleToggleStatus={handleToggleStatus}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          highlightText={highlightText}
        />
      )}

      {!loading && !error && filteredCategories.length === 0 && search === "" && (
        <p className="text-gray-500">
          No hay categorías registradas aún.
        </p>
      )}

      {/* 🔥 Modal */}
      {/* 🔹 Modal para crear / editar */}
      {showForm && (
        <EditCategory
          category={categoryToEdit}        // null = crear, objeto = editar
          allCategories={categories}       // lista completa de categorías
          onClose={() => setShowForm(false)}
          onSave={handleSave}              // función que actualiza el estado de Categories
        />
      )}
    </div>
  );
};

export default Categories;