import React, { useState, useEffect, useRef } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import CategoriesTable from "../components/CategoriesTable";
import SearchInput from "../components/SearchInput";
import EditCategory from "./EditCategory";
import FormSubCategory from "./FormSubCategory";
import { Plus } from "lucide-react";

import { getCategories, saveCategories, getSubcategories } from "../services/categoriesService";

export const Categories = () => {

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const { showConfirm, showSuccess, showError } = useAlert();

  const alertShownRef = useRef(false);

  // 🔵 Cargar categorías y contar subcategorías
  const fetchCategories = async () => {

    try {

      setLoading(true);
      setError(null);

      const cats = getCategories();
      const subs = getSubcategories();

      const categoriesWithCount = cats.map(cat => {

        const count = subs.filter(
          sub => sub.categoriaId === cat.id
        ).length;

        return {
          ...cat,
          subcategorias: count
        };

      });

      setCategories(categoriesWithCount);

    } catch {

      setError("Error al cargar categorías");

      showError(
        "Error",
        "No se pudieron cargar las categorías."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchCategories();

  }, []);

  // 🔵 Editar
  const handleEdit = (category) => {

    setCategoryToEdit(category);
    setShowForm(true);

  };

  // 🔵 Activar / Desactivar
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
            estado: cat.estado === "Activo" ? "Inactivo" : "Activo"
          }
        : cat
    );

    setCategories(updated);

    saveCategories(updated);

    showSuccess("Actualizado", "El estado fue actualizado.");

  };

  // 🔵 Eliminar
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

    saveCategories(updated);

    showSuccess("Eliminado", "La categoría fue eliminada.");

  };

  // 🔵 Guardar categoría
  const handleSave = (category, isEditing) => {

    if (isEditing) {

      const updated = categories.map((c) =>
        c.id === category.id ? category : c
      );

      setCategories(updated);

      saveCategories(updated);

    } else {

      const newId =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1;

      const newCategory = { ...category, id: newId };

      const updated = [...categories, newCategory];

      setCategories(updated);

      saveCategories(updated);

    }

  };

  // 🔵 Filtro
  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  // 🔵 Highlight búsqueda
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

  const RECORDS_PER_PAGE = 13;

  const totalPages = Math.ceil(filteredCategories.length / RECORDS_PER_PAGE);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  const endIndex = startIndex + RECORDS_PER_PAGE;

  const currentData = filteredCategories.slice(startIndex, endIndex);

  return (

    <div className="px-4 md:px-0 max-w-5xl mx-auto">

      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 mt-7">

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar"
        />

        <div className="flex gap-2">

          <button
            onClick={() => setShowSubForm(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-purple-700 rounded-lg text-purple-700 bg-white hover:bg-purple-50 transition"
          >
            Crear Subcategoría
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCategoryToEdit(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold border border-[#004D77] rounded-lg text-[#004D77] bg-white hover:bg-sky-50 transition"
          >
            Crear Categoría
            <Plus className="w-4 h-4" />
          </button>

        </div>

      </div>

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

      {showForm && (

        <EditCategory
          category={categoryToEdit}
          allCategories={categories}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />

      )}

      {showSubForm && (

        <FormSubCategory
          onClose={() => {
            setShowSubForm(false);
            fetchCategories(); // 🔵 refresca el contador
          }}
        />

      )}

    </div>

  );

};

export default Categories;