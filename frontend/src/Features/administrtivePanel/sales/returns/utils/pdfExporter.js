// utils/pdfExporter.js
import { formatCurrency, formatDate } from './returnsHelpers';

// Función para exportar devolución a PDF
export const exportReturnToPDF = (devolucion) => {
  // Crear una nueva ventana para el PDF
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para exportar el PDF');
    return;
  }

  // Calcular totales
  const productos = devolucion.productosDevueltos || [];
  const totalGeneral = devolucion.totalValor || productos.reduce((a, p) => a + ((p.cantidad || 1) * (p.precioUnit || 0)), 0);
  
  // Generar HTML para el PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Devolución ${devolucion.numeroDevolucion}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #004D77; font-size: 24px; margin-bottom: 5px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .title { color: #004D77; font-size: 28px; font-weight: bold; }
        .badge { border: 2px solid #004D77; border-radius: 8px; padding: 8px 15px; text-align: center; }
        .badge small { font-size: 10px; color: #666; display: block; }
        .badge strong { font-size: 14px; color: #333; }
        hr { border: 1px solid #ddd; margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { margin-bottom: 5px; }
        .info-label { font-weight: bold; color: #666; font-size: 12px; }
        .info-value { color: #333; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #004D77; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .estado-pendiente { color: #dc2626; }
        .estado-aprobada { color: #16a34a; }
        .estado-anulada { color: #6b7280; }
        .totals { display: flex; justify-content: flex-end; margin-top: 20px; }
        .totals-box { border: 2px solid #004D77; border-radius: 8px; width: 250px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #ddd; }
        .totals-row:last-child { border-bottom: none; }
        .totals-label { font-weight: bold; color: #333; }
        .totals-value { font-weight: bold; color: #004D77; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Devolución</div>
        <div class="badge">
          <small>Número de Devolución</small>
          <strong>${devolucion.numeroDevolucion || 'N/A'}</strong>
        </div>
      </div>
      
      <hr />
      
      <div class="section-title">Datos de la devolución</div>
      <div class="info-grid">
        <div>
          <div class="info-item">
            <span class="info-label">No. Factura:</span>
            <span class="info-value"> ${devolucion.numeroFactura || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Cliente:</span>
            <span class="info-value"> ${devolucion.cliente || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Atendió:</span>
            <span class="info-value"> ${devolucion.asesor || 'N/A'}</span>
          </div>
        </div>
        <div>
          <div class="info-item">
            <span class="info-label">Teléfono:</span>
            <span class="info-value"> ${devolucion.telefono || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Dirección:</span>
            <span class="info-value"> ${devolucion.direccion || 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estado:</span>
            <span class="info-value ${devolucion.estado === 'Pendiente' ? 'estado-pendiente' : devolucion.estado === 'Aprobada' ? 'estado-aprobada' : 'estado-anulada'}">
              ${devolucion.estado || 'Pendiente'}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Fecha:</span>
            <span class="info-value"> ${formatDate(devolucion.fechaCreacion || new Date())}</span>
          </div>
        </div>
      </div>
      
      <hr />
      
      <div class="section-title">Productos devueltos</div>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Motivo</th>
            <th>Método</th>
            <th>Estado</th>
            <th class="text-center">Cant.</th>
            <th class="text-right">Valor</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productos.map(p => {
            const cantidad = p.cantidad || 1;
            const precioUnit = p.precioUnit || p.valor || 0;
            const total = cantidad * precioUnit;
            const estadoClass = p.estado === 'Pendiente' ? 'estado-pendiente' : p.estado === 'Aprobada' ? 'estado-aprobada' : 'estado-anulada';
            
            return `
              <tr>
                <td>${p.nombre}</td>
                <td>${p.motivo || '-'}</td>
                <td>${p.metodo || '-'}</td>
                <td class="${estadoClass}">${p.estado || 'Pendiente'}</td>
                <td class="text-center">${cantidad}</td>
                <td class="text-right">$${formatCurrency(precioUnit)}</td>
                <td class="text-right">$${formatCurrency(total)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div>
        <div class="section-title">Descripción:</div>
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #666;">${devolucion.descripcion || 'Sin descripción adicional'}</p>
        </div>
      </div>
      
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span class="totals-label">No. Productos:</span>
            <span class="totals-value">${devolucion.cantidadProductos || productos.length}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">Can. Unidades:</span>
            <span class="totals-value">${devolucion.totalUnidades || productos.reduce((a, p) => a + (p.cantidad || 1), 0)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">Total:</span>
            <span class="totals-value">$${formatCurrency(totalGeneral)}</span>
          </div>
        </div>
      </div>
      
      <div class="footer">
        Documento generado el ${new Date().toLocaleDateString('es-CO')} - Papelería Magic
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  // Escribir el contenido en la nueva ventana
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};