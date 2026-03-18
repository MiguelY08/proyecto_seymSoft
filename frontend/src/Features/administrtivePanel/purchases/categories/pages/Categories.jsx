import React, { useState, useEffect, useRef } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import CategoriesTable from "../components/CategoriesTable";
import SearchInput from "../components/SearchInput";
import CategoryDetail from "./CategoryDetail";
import FormCategory from "./FormCategory";
import EditCategory from "./EditCategory";
import { Plus } from "lucide-react";
import {
  getCategories,
  saveCategories,
  getSubcategories,
  createCategory,        // 🔵 importar createCategory
  updateCategory,        // 🔵 importar updateCategory
} from "../services/categoriesService";

export const Categories = () => {

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState(null);

  const { showConfirm, showSuccess, showError } = useAlert();
  const alertShownRef = useRef(false);

  // ───────────── CARGAR CATEGORÍAS ─────────────
  // 🔵 Recalcula el conteo real de subcategorías desde localStorage
  const fetchCategories = () => {
    try {

      setLoading(true);
      setError(null);

      const cats = getCategories();
      const subs = getSubcategories();

      const categoriesWithCount = cats.map((cat) => ({
        ...cat,
        subcategorias: subs.filter((sub) => sub.categoriaId === cat.id).length,
      }));

      setCategories(categoriesWithCount);

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

  // ───────────── EDITAR ─────────────
  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setShowForm(true);
  };

  // ───────────── CAMBIAR ESTADO ─────────────
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
        ? { ...cat, estado: cat.estado === "Activo" ? "Inactivo" : "Activo" }
        : cat
    );

    setCategories(updated);
    saveCategories(updated);

    showSuccess("Actualizado", "El estado fue actualizado.");
  };

  // ───────────── ELIMINAR ─────────────
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

  // ───────────── GUARDAR ─────────────
  const handleSave = (categoryData, isEditing) => {

    if (isEditing) {

      // 🔵 Actualiza en localStorage
      updateCategory(categoryData.id, categoryData);

    } else {

      // 🔵 Delega a createCategory, que guarda categoría + subcategorías iniciales
      createCategory(categoryData);

    }

    // 🔵 Recarga desde localStorage para que el conteo sea correcto en la tabla
    fetchCategories();
  };

  // ───────────── VER DETALLE ─────────────
  const handleViewDetail = (category) => {
    setCategoryDetail(category);
  };

  // ───────────── BUSCAR ─────────────
  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const highlightText = (text = "") => {

    if (!search) return text;

    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    return String(text)
      .split(regex)
      .map((part, index) =>
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

  // ───────────── PAGINACIÓN ─────────────
  const RECORDS_PER_PAGE = 13;

  const totalPages = Math.ceil(filteredCategories.length / RECORDS_PER_PAGE);

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  const endIndex = startIndex + RECORDS_PER_PAGE;

  const currentData = filteredCategories.slice(startIndex, endIndex);

  return (
    <div className="px-4 md:px-0 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 mt-7">

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar"
        />

        <div className="flex gap-2">

          

          {/* CREAR CATEGORÍA */}
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

      {/* TABLA */}
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
          handleViewDetail={handleViewDetail}
          highlightText={highlightText}
        />
      )}

      {/* FORMULARIO CREAR / EDITAR */}
      {showForm && (

        categoryToEdit ? (

          <EditCategory
            category={categoryToEdit}
            allCategories={categories}
            onClose={() => {
              setShowForm(false);
              setCategoryToEdit(null);
            }}
            onSave={handleSave}
          />

        ) : (

          <FormCategory
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />

        )

      )}

      

      {/* DETALLE CATEGORÍA */}
      {categoryDetail && (
        <CategoryDetail
          category={categoryDetail}
          onClose={() => setCategoryDetail(null)}
          refreshCategories={fetchCategories}
        />
      )}

    </div>
  );
};

export default Categories;