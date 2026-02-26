import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import ButtonComponent from "../../../../shared/ButtonComponent"
import TableFilters from "../../../../shared/TableFilters"

import PaymentsTable from "../components/PaymentsTable"

import {
  initializePayments,
  getAccounts
} from "../data/paymentsServices"

import {
  calculateSaldo,
  getPaymentStatus
} from "../utils/paymentHelpers"

export default function PaymentsPage() {

  const navigate = useNavigate()

  const [accounts, setAccounts] = useState([])
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [estado, setEstado] = useState("todos")
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 5

  useEffect(() => {
    initializePayments()
    const data = getAccounts()
    setAccounts(data)
  }, [])

  const filteredData = useMemo(() => {
    return accounts.filter(item => {

      const saldo = calculateSaldo(item)
      const status = getPaymentStatus(
        saldo,
        item.fechaVencimiento
      )

      if (estado !== "todos" && status !== estado)
        return false

      if (
        search &&
        !item.nombre.toLowerCase().includes(search.toLowerCase())
      )
        return false

      if (startDate && new Date(item.fechaCredito) < new Date(startDate))
        return false

      if (endDate && new Date(item.fechaCredito) > new Date(endDate))
        return false

      return true
    })
  }, [accounts, search, startDate, endDate, estado])

  const formattedData = useMemo(() => {
    return filteredData.map(item => {
      const saldo = calculateSaldo(item)
      const status = getPaymentStatus(
        saldo,
        item.fechaVencimiento
      )

      return {
        ...item,
        valor: item.valorCredito,
        saldo,
        estado: status
      }
    })
  }, [filteredData])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return formattedData.slice(start, start + itemsPerPage)
  }, [formattedData, currentPage])

  /* ===============================
     NAVEGACIÓN
  ================================ */

  const handleView = (id) => {
    navigate(`/admin/sales/payments-and-credits/${id}`)
  }

  const handleAbonar = (id) => {
    navigate(`/admin/sales/payments-and-credits/${id}/payment`)
  }

  const handleContact = (item) => {
    console.log("Abrir modal contacto", item)
  }

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
            <label className="block text-xs font-medium mb-1">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value)
                setCurrentPage(1)
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
        />
      </div>

    </div>
  )
}