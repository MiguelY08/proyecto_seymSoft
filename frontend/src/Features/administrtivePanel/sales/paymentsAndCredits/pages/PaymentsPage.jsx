import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAlert } from "../../../../shared/alerts/useAlert"

import ButtonComponent    from "../../../../shared/ButtonComponent"
import TableFilters       from "../../../../shared/TableFilters"
import PaymentsTable      from "../components/PaymentsTable"
import PaymentsPaginator  from "../components/PaymentsPaginator"
import ContactClientModal from "../components/ContactClientModal"

import { exportAccountsToExcel } from "../utils/paymentHelpers"
import { initializePayments, getAccounts } from "../data/paymentsServices"
import {
  calculateSaldoCliente,
  getTotalCreditoCliente,
  getTotalAbonadoCliente,
  getClienteStatus
} from "../utils/paymentHelpers"

/*
  Index principal del módulo de Pagos y Abonos.
  Muestra un cliente por fila con su resumen consolidado de crédito.

  Filtros disponibles:
    - Búsqueda por nombre
    - Rango de fechas (se compara contra la fecha más reciente de sus facturas)
    - Estado general del cliente (al_dia / pendiente / vencido)

  Acciones por fila:
    - Ver info    → navega a AccountDetailsPage mode="view"
    - Abonar      → navega a AccountDetailsPage mode="payment"
    - Contactar   → abre ContactClientModal (solo clientes vencidos)
*/
export default function PaymentsPage() {

  const navigate = useNavigate()
  const { showConfirm, showSuccess, showError } = useAlert()

  const [accounts,         setAccounts]         = useState([])
  const [search,           setSearch]           = useState("")
  const [startDate,        setStartDate]        = useState("")
  const [endDate,          setEndDate]          = useState("")
  const [estado,           setEstado]           = useState("todos")
  const [currentPage,      setCurrentPage]      = useState(1)
  const [selectedAccount,  setSelectedAccount]  = useState(null)

  const itemsPerPage = 10

  // Cargar datos al montar
  useEffect(() => {
    initializePayments()
    setAccounts(getAccounts())
  }, [])

  /* ── Filtrado ────────────────────────────────────────────────────────────
     El estado se calcula a nivel cliente (peor estado entre sus facturas).
     La fecha se compara contra la factura más reciente del cliente.
  ---------------------------------------------------------------------- */
  const filteredData = useMemo(() => {

    return accounts.filter(cliente => {

      const estadoCliente = getClienteStatus(cliente)

      // Filtro por estado general
      if (estado !== "todos" && estadoCliente !== estado) return false

      // Filtro por nombre
      if (search && !cliente.nombre.toLowerCase().includes(search.toLowerCase()))
        return false

      // Filtro por rango de fechas — usa la fecha de la factura más reciente
      const facturas = cliente.facturas ?? []
      if (facturas.length && (startDate || endDate)) {
        const fechas = facturas.map(f => new Date(f.fechaCredito))
        const fechaMax = new Date(Math.max(...fechas))
        if (startDate && fechaMax < new Date(startDate)) return false
        if (endDate   && fechaMax > new Date(endDate))   return false
      }

      return true
    })

  }, [accounts, search, startDate, endDate, estado])

  /* ── Formateo ────────────────────────────────────────────────────────────
     Transforma cada cliente al shape que espera PaymentsTable:
     { id, nombre, documento, telefono, creditoAsignado,
       totalCredito, totalAbonado, saldo, estado }
  ---------------------------------------------------------------------- */
  const formattedData = useMemo(() => {

    return filteredData.map(cliente => ({
      ...cliente,
      totalCredito:  getTotalCreditoCliente(cliente),
      totalAbonado:  getTotalAbonadoCliente(cliente),
      saldo:         calculateSaldoCliente(cliente),
      estado:        getClienteStatus(cliente)
    }))

  }, [filteredData])

  /* ── Paginación ──────────────────────────────────────────────────────── */
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return formattedData.slice(start, start + itemsPerPage)
  }, [formattedData, currentPage])

  /* ── Navegación ──────────────────────────────────────────────────────── */
  const handleView    = (id) => navigate(`/admin/sales/payments-and-credits/${id}`)
  const handleAbonar  = (id) => navigate(`/admin/sales/payments-and-credits/${id}/payment`)
  const handleContact = (item) => setSelectedAccount(item)

  /* ── Exportar Excel ──────────────────────────────────────────────────── */
  const handleExportExcel = async () => {

    if (!filteredData.length) {
      showError("Sin datos", "No hay registros para exportar.")
      return
    }

    const confirm = await showConfirm(
      "question",
      "¿Exportar a Excel?",
      "Se generará el archivo con los datos filtrados actualmente.",
      { confirmButtonText: "Sí, exportar", cancelButtonText: "Cancelar" }
    )

    if (!confirm.isConfirmed) return

    try {
      const success = exportAccountsToExcel(filteredData)
      if (!success) {
        showError("Error", "No se pudo generar el archivo.")
        return
      }
      showSuccess("Exportación completada", "El archivo Excel fue generado correctamente.")
    } catch {
      showError("Error al exportar", "Ocurrió un problema al generar el Excel.")
    }
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
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

          {/* Filtro por estado */}
          <div className="w-full sm:w-56">
            <label className="block text-xs font-medium mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => { setEstado(e.target.value); setCurrentPage(1) }}
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

      <div className="mt-6">
        <PaymentsTable
          data={paginatedData}
          onView={handleView}
          onAbonar={handleAbonar}
          onContact={handleContact}
        />
      </div>

      <PaymentsPaginator
        itemsPerPage={itemsPerPage}
        totalItems={formattedData.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Modal contactar cliente vencido */}
      {selectedAccount && (
        <ContactClientModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onInterestApplied={() => setAccounts(getAccounts())}
        />
      )}

    </div>
  )
}