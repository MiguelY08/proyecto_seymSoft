// features/categories/pages/CategoriesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import CategoriesTable from "../components/CategoriesTable";
import CategoriesToolbar from "../components/CategoriesToolbar";
import CategoryDetail from "./CategoryDetail";
import FormCategory from "./FormCategory";
import EditCategory from "./EditCategory";
import Spinner from "../../../../shared/spinner"; // ← IMPORTAR SPINNER
import {
  getCategories,
  deleteCategory,
  toggleCategoryStatus,
  getSubcategories,
  createCategory,
  updateCategory,
} from "../data/categoriesService";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState(null);

  const { showConfirm, showSuccess, showError } = useAlert();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cats = await getCategories();

      const categoriesWithCount = await Promise.all(
        cats.map(async (cat) => {
          const subs = await getSubcategories(cat.id);
          const rawStatus = cat.status ?? cat.statusName ?? cat.estado ?? "";
          const isActive =
            rawStatus === "Active" ||
            rawStatus === "Activo" ||
            rawStatus === 1 ||
            rawStatus === "1";
          return {
            id: cat.id,
            nombre: cat.name ?? cat.nombre,
            estado: isActive ? "Activo" : "Inactivo",
            subcategorias: subs.length,
          };
        })
      );

      const sorted = [...categoriesWithCount].sort((a, b) => a.id - b.id);
      setCategories(sorted);
    } catch (err) {
      setError("Error al cargar categorías");
      showError("Error", err.message || "No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setShowForm(true);
  };

  const handleToggleStatus = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const isActivating = category.estado === "Inactivo";

    const result = await showConfirm(
      isActivating ? "question" : "warning",
      isActivating ? "Activar categoría" : "Desactivar categoría",
      isActivating
        ? `¿Deseas activar "${category.nombre}"?`
        : `Al desactivar "${category.nombre}" también se desactivarán todas sus subcategorías y los productos asociados a ellas. ¿Deseas continuar?`,
      {
        confirmButtonText: isActivating ? "Sí, activar" : "Sí, desactivar",
        cancelButtonText: "Cancelar",
      }
    );

    if (!result?.isConfirmed) return;

    try {
      await toggleCategoryStatus(id);
      await fetchCategories();
      showSuccess("Actualizado", "El estado fue actualizado.");
    } catch (err) {
      showError("Error", err.message || "No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;

    const result = await showConfirm(
      "warning",
      "Eliminar categoría",
      `¿Seguro que deseas eliminar "${category.nombre}"? También se eliminarán todas sus subcategorías.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );
    if (!result?.isConfirmed) return;

    try {
      await deleteCategory(id);
      await fetchCategories();
      showSuccess("Eliminado", "La categoría y sus subcategorías fueron eliminadas.");
    } catch (err) {
      showError("Error", err.message || "No se pudo eliminar la categoría.");
    }
  };

  const handleSave = async (categoryData, isEditing) => {
    try {
      if (isEditing) {
        await updateCategory(categoryData.id, {
          nombre: categoryData.nombre,
          estado: categoryData.estado,
        });
        showSuccess("Categoría actualizada", "Los cambios se guardaron correctamente.");
      } else {
        const result = await showConfirm(
          "question",
          "Crear categoría",
          `¿Deseas crear la categoría "${categoryData.nombre}"?`,
          { confirmButtonText: "Sí, crear", cancelButtonText: "Cancelar" }
        );
        if (!result?.isConfirmed) return;

        await createCategory(categoryData);
        showSuccess("Categoría creada", `"${categoryData.nombre}" fue creada correctamente.`);
      }
      await fetchCategories();
      setShowForm(false);
      setCategoryToEdit(null);
    } catch (err) {
      showError(
        "Error",
        isEditing
          ? err.message || "No se pudo actualizar la categoría."
          : err.message || "No se pudo crear la categoría."
      );
    }
  };

  const handleViewDetail = (category) => {
    setCategoryDetail(category);
  };

  const filteredCategories = categories.filter((cat) =>
    Object.values(cat).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const highlightText = (text = "") => {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return String(text)
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={index} className="bg-[#004d7726] text-[#004D77] rounded px-1 font-semibold">
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
  const currentData = filteredCategories.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  // ✅ USAR SPINNER IGUAL QUE EN PROVIDERS
  if (loading && categories.length === 0) {
    return <Spinner message="Cargando categorías..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      <CategoriesToolbar
        search={search}
        setSearch={setSearch}
        onOpenForm={() => {
          setCategoryToEdit(null);
          setShowForm(true);
        }}
      />

      <CategoriesTable
        currentData={currentData}
        filteredCategories={filteredCategories}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={Math.min(startIndex + RECORDS_PER_PAGE, filteredCategories.length)}
        handleToggleStatus={handleToggleStatus}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleViewDetail={handleViewDetail}
        highlightText={highlightText}
      />

      {showForm &&
        (categoryToEdit ? (
          <EditCategory
            category={categoryToEdit}
            allCategories={categories}
            onClose={() => {
              setShowForm(false);
              setCategoryToEdit(null);
            }}
            onSave={handleSave}
            refreshCategories={fetchCategories}
          />
        ) : (
          <FormCategory
            allCategories={categories}
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />
        ))}

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

export default CategoriesPage;