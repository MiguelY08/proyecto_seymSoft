import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAlert } from "../../../../shared/alerts/useAlert";

import ButtonComponent from "../../../../shared/ButtonComponent";
import TableFilters from "../../../../shared/TableFilters";
import PaymentsTable from "../components/PaymentsTable";
import PaymentsPaginator from "../components/PaymentsPaginator";
import ContactClientModal from "../components/ContactClientModal";

import { exportAccountsToExcel } from "../utils/paymentHelpers";

import { initializePayments, getAccounts } from "../data/paymentsServices";

import {
  calculateSaldoCliente,
  getPaymentStatus,
  getClienteStatus,
} from "../utils/paymentHelpers";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, showSuccess, showError } = useAlert();

  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [estado, setEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const itemsPerPage = 10;

  /* ===============================
     Inicializar datos
  ================================ */
  // Recargar accounts cada vez que se navega a esta vista
  useEffect(() => {
    initializePayments();
    setAccounts(getAccounts());
  }, [location]);

  // Escuchar cambios en los datos para mantener el estado sincronizado
  useEffect(() => {
    const handlePaymentsUpdate = () => {
      setAccounts(getAccounts());
    };
    window.addEventListener("paymentsUpdated", handlePaymentsUpdate);
    return () =>
      window.removeEventListener("paymentsUpdated", handlePaymentsUpdate);
  }, []);

  /* ===============================
     Filtrado
  ================================ */
  const filteredData = useMemo(() => {
    return accounts.filter((item) => {
      const saldo = calculateSaldoCliente(item);
      const status = getClienteStatus(item);

      if (estado !== "todos" && status !== estado) return false;

      if (search && !item.nombre.toLowerCase().includes(search.toLowerCase()))
        return false;

      // Nota: Filtros de fecha removidos ya que los clientes no tienen fechaCredito única
      // Si se necesita, implementar lógica para fecha de factura más antigua

      return true;
    });
  }, [accounts, search, estado]);

  /* ===============================
     Formateo
  ================================ */
  const formattedData = useMemo(() => {
    return filteredData.map((item) => {
      const saldo = calculateSaldoCliente(item);
      const status = getClienteStatus(item);

      return {
        ...item,
        valor: item.valorCredito, // Nota: Esto puede no existir en cliente, revisar
        saldo,
        estado: status,
      };
    });
  }, [filteredData]);

  /* ===============================
     Paginación
  ================================ */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return formattedData.slice(start, start + itemsPerPage);
  }, [formattedData, currentPage]);

  /* ===============================
     Navegación
  ================================ */
  const handleView = (id) => {
    navigate(`/admin/sales/payments-and-credits/${id}`);
  };

  const handleAbonar = (id) => {
    navigate(`/admin/sales/payments-and-credits/${id}/payment`);
  };

  const handleContact = (item) => {
    setSelectedAccount(item);
  };

  /* ===============================
     Exportar Excel CON ALERTAS
  ================================ */
  const handleExportExcel = async () => {
    if (!filteredData.length) {
      showError("Sin datos", "No hay registros para exportar.");
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

    if (!confirm.isConfirmed) return;

    try {
      const success = exportAccountsToExcel(filteredData);

      if (!success) {
        showError("Error", "No se pudo generar el archivo.");
        return;
      }

      showSuccess(
        "Exportación completada",
        "El archivo Excel fue generado correctamente.",
      );
    } catch (error) {
      showError(
        "Error al exportar",
        "Ocurrió un problema al generar el Excel.",
      );
    }
  };

  return (
    <div className="p-6 font-lexend space-y-6">
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
              <option value="al_dia">Al día</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          <ButtonComponent
            className="bg-white text-green-600 border-green-600 hover:bg-green-400"
            onClick={handleExportExcel}
          >
            Exportar Excel +
          </ButtonComponent>
        </div>
      </TableFilters>

      <div className="mt-10">
        <PaymentsTable
          data={paginatedData}
          onView={handleView}
          onAbonar={handleAbonar}
          onContact={handleContact}
          search={search}
        />
      </div>

      <div className="mt-4">
        <PaymentsPaginator
          itemsPerPage={itemsPerPage}
          totalItems={formattedData.length}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {selectedAccount && (
        <ContactClientModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onInterestApplied={() => {
            const updated = getAccounts();
            setAccounts(updated);
          }}
        />
      )}
    </div>
  );
}
