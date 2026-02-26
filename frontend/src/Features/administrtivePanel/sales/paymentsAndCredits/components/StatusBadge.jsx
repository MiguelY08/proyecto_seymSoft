export default function StatusBadge({ status }) {

  const styles = {
    al_dia: "bg-green-100 text-green-700",
    pendiente: "bg-yellow-100 text-yellow-700",
    vencido: "bg-red-100 text-red-700"
  }

  const labels = {
    al_dia: "Al día",
    pendiente: "Pendiente",
    vencido: "Vencido"
  }

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}