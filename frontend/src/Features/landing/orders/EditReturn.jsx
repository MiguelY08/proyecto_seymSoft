import { Navigate, useParams } from 'react-router-dom';

/**
 * Las devoluciones de clientes son gestionadas por el equipo administrativo.
 * Esta ruta histórica se conserva para no romper enlaces antiguos y dirige al
 * seguimiento real de la devolución.
 */
function EditReturn() {
  const { id } = useParams();
  return <Navigate to={`/returns/${id}`} replace />;
}

export default EditReturn;
