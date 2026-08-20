// features/categories/pages/CategoriesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import CategoriesTable from "../components/CategoriesTable";
import CategoriesToolbar from "../components/CategoriesToolbar";
import CategoryDetail from "./CategoryDetail";
import FormCategory from "./FormCategory";
import EditCategory from "./EditCategory";
import Spinner from "../../../../shared/spinner"; // ← IMPORTAR SPINNER
import PaginationAdmin from "../../../../shared/PaginationAdmin";
import { getApiErrorMessage } from "../../../../shared/utils/apiErrorMessage";
import {
  getCategories,
  deleteCategory,
  toggleCategoryStatus,
  getSubcategories,
  createCategory,
  updateCategory,
  updateSubcategory,
  normalizeCategoryStatus,
} from "../data/categoriesService";

const normalizeSearchValue = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
          return {
            id: cat.id,
            nombre: cat.name ?? cat.nombre,
            estado: normalizeCategoryStatus(cat),
            subcategorias: subs.length,
            searchableSubcategories: subs.flatMap((sub) => [
              sub.id,
              sub.nombre ?? sub.name,
              sub.descripcion ?? sub.description,
              sub.estado ?? sub.status,
            ]),
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
      showError(
        "No se puede eliminar",
        getApiErrorMessage(err, {
          conflictMessage:
            "Esta categoría tiene productos asociados. Reasigna o elimina esos productos antes de eliminar la categoría.",
          fallback: "No se pudo eliminar la categoría.",
        })
      );
    }
  };

  const handleSave = async (categoryData, isEditing) => {
    try {
      if (isEditing) {
        const currentCategory = categories.find(
          (category) => category.id === categoryData.id
        );
        const statusChanged =
          currentCategory && currentCategory.estado !== categoryData.estado;

        await updateCategory(categoryData.id, {
          nombre: categoryData.nombre,
          estado: categoryData.estado,
        });

        if (statusChanged) {
          const subcategories = await getSubcategories(categoryData.id);
          const subcategoriesToUpdate = subcategories.filter(
            (subcategory) => subcategory.estado !== categoryData.estado
          );

          await Promise.all(
            subcategoriesToUpdate.map((subcategory) =>
              updateSubcategory(subcategory.id, {
                estado: categoryData.estado,
              })
            )
          );
        }
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

  const filteredCategories = categories.filter((category) => {
    const query = normalizeSearchValue(search);
    if (!query) return true;

    return [
      category.id,
      category.nombre,
      category.estado,
      category.subcategorias,
      ...(category.searchableSubcategories || []),
    ].some((value) => normalizeSearchValue(value).includes(query));
  });

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

  const RECORDS_PER_PAGE = 11;
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
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden p-3 sm:p-4">
      <CategoriesToolbar
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onOpenForm={() => {
          setCategoryToEdit(null);
          setShowForm(true);
        }}
      />

      <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
        <CategoriesTable
          currentData={currentData}
          startIndex={startIndex}
          handleToggleStatus={handleToggleStatus}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleViewDetail={handleViewDetail}
          highlightText={highlightText}
        />
      </div>

      <div className="min-h-0 flex-1" />

      {filteredCategories.length > 0 && (
        <div className="shrink-0">
          <PaginationAdmin
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalRecords={filteredCategories.length}
            recordsPerPage={RECORDS_PER_PAGE}
          />
        </div>
      )}

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
