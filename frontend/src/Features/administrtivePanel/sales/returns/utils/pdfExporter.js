/**
 * Archivo: pdfExporter.js
 * 
 * Utilidad especializada para exportar una devolución a PDF con descarga automática.
 * Genera un documento HTML profesional que se descarga automáticamente como PDF.
 * El documento incluye todos los detalles de la devolución con estilos profesionales.
 * 
 * Responsabilidades principales:
 * - Generar HTML profesional de la devolución
 * - Incluir estilos CSS integrados
 * - Mostrar información formatada de cliente, productos y totales
 * - Descargar automáticamente el PDF sin ventanas emergentes
 * - Mostrar motivo de anulación si la devolución está anulada
 * - Mostrar estados con colores diferenciados
 */

import { formatCurrency, formatDate } from './returnsHelpers';

// ======================= FUNCIONALIDAD: DESCARGAR PDF AUTOMÁTICO =======================

/**
 * Exporta una devolución a un documento PDF con descarga automática.
 * Genera un contenido HTML profesional con estilos integrados.
 * Abre el diálogo de impresión del navegador para guardar como PDF.
 * 
 * @param {Object} devolucion - Objeto de devolución a exportar
 * @param {string} devolucion.numeroDevolucion - Número único de devolución
 * @param {string} devolucion.numeroFactura - Número de factura
 * @param {string} devolucion.cliente - Nombre del cliente
 * @param {string} devolucion.asesor - Nombre del asesor
 * @param {string} devolucion.telefono - Teléfono de contacto
 * @param {string} devolucion.direccion - Dirección de entrega
 * @param {string} devolucion.estado - Estado actual
 * @param {string} devolucion.descripcion - Descripción detallada
 * @param {number} devolucion.totalValor - Valor total
 * @param {number} devolucion.cantidadProductos - Cantidad total de productos
 * @param {number} devolucion.totalUnidades - Total de unidades
 * @param {Array} devolucion.productosDevueltos - Array de productos devueltos
 * @param {string|Date} devolucion.fechaCreacion - Fecha de creación
 * @param {string} devolucion.cancelReason - Motivo de anulación (si aplica)
 * @param {string} devolucion.cancelledAt - Fecha de anulación (si aplica)
 * @returns {void} Abre diálogo de impresión para guardar como PDF
 */
export const exportReturnToPDF = (devolucion) => {
  // ======================= Cálculos preliminares =======================
  const productos = devolucion.productosDevueltos || [];
  const totalGeneral = devolucion.totalValor || productos.reduce((a, p) => a + ((p.cantidad || 1) * (p.precioUnit || 0)), 0);
  const isAnulada = devolucion.estado === 'Anulada';
  
  // Generar HTML para el PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Devolución ${devolucion.numeroDevolucion}</title>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          background: #f5f5f5;
          padding: 40px;
        }
        
        .document {
          max-width: 1100px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .header {
          background: #004D77;
          padding: 25px 30px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .title h1 {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .title p {
          font-size: 11px;
          opacity: 0.8;
        }
        
        .badge {
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 8px 18px;
          text-align: center;
          background: rgba(255,255,255,0.1);
        }
        
        .badge small {
          font-size: 10px;
          opacity: 0.8;
          display: block;
        }
        
        .badge strong {
          font-size: 16px;
          font-weight: bold;
          display: block;
          margin-top: 4px;
        }
        
        .content {
          padding: 30px;
        }
        
        hr {
          border: none;
          border-top: 1px solid #e0e0e0;
          margin: 20px 0;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #004D77;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .cancel-box {
          background: #fff5f5;
          border-left: 4px solid #dc2626;
          padding: 12px 16px;
          margin-bottom: 20px;
          border-radius: 8px;
        }
        
        .cancel-box p {
          margin: 0;
          font-size: 12px;
          color: #991b1b;
        }
        
        .cancel-box strong {
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
        }
        
        .info-item {
          margin-bottom: 12px;
        }
        
        .info-item:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-weight: bold;
          color: #666;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }
        
        .info-value {
          color: #333;
          font-size: 13px;
          font-weight: 500;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th {
          background-color: #004D77;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
        }
        
        td {
          padding: 8px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 11px;
          color: #555;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .estado-pendiente {
          color: #dc2626;
          font-weight: 600;
        }
        
        .estado-aprobada {
          color: #16a34a;
          font-weight: 600;
        }
        
        .estado-anulada {
          color: #6b7280;
          font-weight: 600;
        }
        
        .desc-box {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .desc-box p {
          margin: 0;
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }
        
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .totals-box {
          border: 2px solid #004D77;
          border-radius: 10px;
          width: 260px;
          overflow: hidden;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .totals-row:last-child {
          border-bottom: none;
          background: #f0f7fc;
        }
        
        .totals-label {
          font-weight: bold;
          color: #555;
          font-size: 12px;
        }
        
        .totals-value {
          font-weight: bold;
          color: #004D77;
          font-size: 13px;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .document {
            box-shadow: none;
            max-width: 100%;
          }
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cancel-box {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="document">
        <div class="header">
          <div class="title">
            <h1>Devolución</h1>
            <p>Documento de devolución de productos</p>
          </div>
          <div class="badge">
            <small>Número de Devolución</small>
            <strong>${devolucion.numeroDevolucion || 'N/A'}</strong>
          </div>
        </div>
        
        <div class="content">
          
          ${isAnulada && devolucion.cancelReason ? `
          <div class="cancel-box">
            <strong>x  DEVOLUCIÓN ANULADA</strong>
            <p>Motivo: ${devolucion.cancelReason}</p>
            ${devolucion.cancelledAt ? `<p>Fecha de anulación: ${formatDate(devolucion.cancelledAt)}</p>` : ''}
          </div>
          ` : ''}
          
          <div class="section-title"> Datos de la devolución</div>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">No. Factura</span>
                <div class="info-value">${devolucion.numeroFactura || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Cliente</span>
                <div class="info-value">${devolucion.cliente || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Atendió</span>
                <div class="info-value">${devolucion.asesor || 'N/A'}</div>
              </div>
            </div>
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Teléfono</span>
                <div class="info-value">${devolucion.telefono || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Dirección</span>
                <div class="info-value">${devolucion.direccion || 'N/A'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha</span>
                <div class="info-value">${formatDate(devolucion.fechaCreacion || new Date())}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Estado</span>
                <div class="info-value ${devolucion.estado === 'Pendiente' ? 'estado-pendiente' : devolucion.estado === 'Aprobada' ? 'estado-aprobada' : 'estado-anulada'}">
                  ${devolucion.estado || 'Pendiente'}
                </div>
              </div>
            </div>
          </div>
          
          <hr />
          
          <div class="section-title"> Productos devueltos</div>
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
          
          <div class="desc-box">
            <div class="section-title" style="margin-bottom: 10px;"> Descripción</div>
            <p>${devolucion.descripcion || 'Sin descripción adicional'}</p>
          </div>
          
          <div class="totals">
            <div class="totals-box">
              <div class="totals-row">
                <span class="totals-label">No. Productos</span>
                <span class="totals-value">${devolucion.cantidadProductos || productos.length}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Can. Unidades</span>
                <span class="totals-value">${devolucion.totalUnidades || productos.reduce((a, p) => a + (p.cantidad || 1), 0)}</span>
              </div>
              <div class="totals-row">
                <span class="totals-label">Total Devolución</span>
                <span class="totals-value">$${formatCurrency(totalGeneral)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            Documento generado el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })} - Papelería Magic
          </div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `;

  // Crear un iframe oculto para la impresión automática
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);
  
  // Escribir el contenido en el iframe
  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();
  
  // Esperar a que cargue y abrir diálogo de impresión
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Remover el iframe después de un tiempo
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 300);
  };
};