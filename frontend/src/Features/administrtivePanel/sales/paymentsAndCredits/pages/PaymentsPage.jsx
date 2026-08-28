import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { FileSpreadsheet } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAlert } from "../../../../shared/alerts/useAlert";

import ButtonComponent from "../../../../shared/ButtonComponent";
import PaymentsTable from "../components/PaymentsTable";
import PaymentsPaginator from "../components/PaymentsPaginator";
import ContactClientModal from "../components/ContactClientModal";

import Spinner from "../../../../shared/spinner/Spinner";
import Permission from "../../../configuration/roles/components/Permission";

import { exportAccountsToExcel } from "../utils/paymentHelpers";

import {
  getCreditCustomers,
  getCustomerContact,
} from "../services/paymentsServices";

import { mapCustomers } from "../mappers/paymentsMapper";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const { showConfirm, showSuccess, showError } = useAlert();

  const [accounts, setAccounts] = useState([]);

  const [search, setSearch] = useState("");

  const [estado, setEstado] = useState("todos");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigationLockRef = useRef(false);
  const contactLockRef = useRef(false);
  const exportLockRef = useRef(false);

  const itemsPerPage = 11;

  /* ===============================
     CARGAR CLIENTES
  ================================ */
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);

      const customers = await getCreditCustomers();

      setAccounts(mapCustomers(customers));
    } catch (error) {
      console.error("Error cargando clientes:", error);

      showError("Error", "No fue posible cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }, [showError]);
  /* ===============================
     INICIALIZAR
  ================================ */
  useEffect(() => {
    loadCustomers();
  }, [location, loadCustomers]);

  /* ===============================
     FILTRADO
  ================================ */
  const filteredData = useMemo(() => {
    return accounts.filter((item) => {
      const saldo = item.saldo ?? 0;

      const status = item.estado ?? "al_dia";

      const credito = item.creditoAsignado ?? 0;

      const disponible = item.cupoDisponible ?? 0;

      if (estado !== "todos" && status !== estado) {
        return false;
      }

      if (search) {
        const searchLower = search.toLowerCase();

        const matchNombre = item.nombre?.toLowerCase().includes(searchLower);
        const matchDocumento = String(item.documento ?? "")
          .toLowerCase()
          .includes(searchLower);

        const matchNumeros =
          saldo.toString().includes(search) ||
          credito.toString().includes(search) ||
          disponible.toString().includes(search);

        if (!matchNombre && !matchDocumento && !matchNumeros) {
          return false;
        }
      }

      return true;
    });
  }, [accounts, search, estado]);

  /* ===============================
     FORMATEO
  ================================ */
  const formattedData = useMemo(() => {
    return filteredData.map((item) => ({
      ...item,
    }));
  }, [filteredData]);

  /* ===============================
     PAGINACIÓN
  ================================ */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;

    return formattedData.slice(start, start + itemsPerPage);
  }, [formattedData, currentPage]);

  /* ===============================
     NAVEGACIÓN
  ================================ */
  const handleView = (id) => {
    if (navigationLockRef.current) return;
    navigationLockRef.current = true;

    navigate(`/admin/sales/payments-and-credits/${id}`);
  };

  const handleAbonar = (id) => {
    if (navigationLockRef.current) return;
    navigationLockRef.current = true;

    navigate(`/admin/sales/payments-and-credits/${id}/payment`);
  };

  const handleContact = async (account) => {
    if (
      selectedAccount ||
      contactLockRef.current
    ) {
      return;
    }

    contactLockRef.current = true;

    try {
      const contactData = await getCustomerContact(account.id);
      setSelectedAccount(contactData);
    } catch (error) {
      console.error("Error cargando contacto cliente:", error);
      showError("Error", "No fue posible cargar la información de contacto.");
    } finally {
      contactLockRef.current = false;
    }
  };

  /* ===============================
     EXPORTAR EXCEL
  ================================ */
  const handleExportExcel = async () => {
    if (exportLockRef.current) return;

    exportLockRef.current = true;

    if (!filteredData.length) {
      showError("Sin datos", "No hay registros para exportar.");

      exportLockRef.current = false;

      return;
    }

    const confirm = await showConfirm(
      "question",
      "¿Exportar a Excel?",
      "Se generará el archivo Excel con los datos filtrados.",
      {
        confirmButtonText: "Sí, exportar",

        cancelButtonText: "Cancelar",
      },
    );

    if (!confirm.isConfirmed) {
      exportLockRef.current = false;

      return;
    }

    try {
      const success = await exportAccountsToExcel(filteredData);

      if (!success) {
        showError("Error", "No se pudo generar el archivo.");

        exportLockRef.current = false;

        return;
      }

      showSuccess(
        "Exportación completada",
        "El archivo Excel fue generado correctamente.",
      );
    } catch {
      showError(
        "Error al exportar",
        "Ocurrió un problema al generar el Excel.",
      );
    }

    exportLockRef.current = false;
  };

  if (loading) {
    return (
      <Spinner
        message="Cargando pagos y abonos..."
      />
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 font-lexend space-y-3">
      {/* ENCABEZADO */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        {/* BUSCADOR */}
        <div className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Buscar documento, cliente o monto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 bg-white rounded-xl border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-900 text-black text-sm"
          />

          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-48">
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

              <option value="al_dia">Al día</option>

              <option value="pendiente">Pendiente</option>

              <option value="vencido">Vencido</option>
            </select>
          </div>

          <Permission permission="pagos_y_abonos.exportar">
            <ButtonComponent
              className="w-full sm:w-auto bg-white text-green-600 border-green-600 hover:bg-green-400 px-6 flex items-center gap-2"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </ButtonComponent>
          </Permission>
        </div>
      </div>

      {/* TABLA */}
      <div className="mt-3 w-full min-w-0">
        <PaymentsTable
          data={paginatedData}
          onView={handleView}
          onAbonar={handleAbonar}
          onContact={handleContact}
          search={search}
          isSearching={Boolean(search.trim() || estado !== "todos")}
        />
      </div>

      {/* PAGINADOR */}
      {formattedData.length > 0 && (
        <div className="mt-4">
          <PaymentsPaginator
            itemsPerPage={itemsPerPage}
            totalItems={formattedData.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* MODAL */}
      {selectedAccount && (
        <ContactClientModal
          account={selectedAccount}
          onClose={() => {
            contactLockRef.current = false;
            setSelectedAccount(null);
          }}
          onInterestApplied={() => loadCustomers()}
        />
      )}
    </div>
  );
}
