import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useModalAnimation } from '../../../../shared/useModalAnimation';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(value);

// ─── Fila de detalle: label arriba, valor abajo ───────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800">
        {value || '—'}
      </span>
    </div>
  );
}

// ─── SaleInfo ─────────────────────────────────────────────────────────────────
function SaleInfo() {
  const navigate        = useNavigate();
  const location        = useLocation();
  const [downloading, setDownloading] = useState(false);

  const sale            = location.state?.sale ?? null;
  const origin          = location.state?.origin ?? null;

  const { visible, handleClose } = useModalAnimation('/admin/sales');

  // transform-origin apunta al botón que abrió el modal
  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  // ─── Calcular totales desde los items ─────────────────────────────────────
  const items    = sale?.items ?? [];
  const subtotal = items.reduce((acc, i) => acc + i.product.precioDetal * i.cantidad, 0);
  const iva      = Math.round(subtotal * 0.19);
  const total    = subtotal + iva;

  // ─── Descargar PDF ────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW  = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const colMid = pageW / 2;
      let y        = 0;

      const fmt = (v) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

      // ── Header ──────────────────────────────────────────────────────────
      pdf.setFillColor(0, 77, 119);
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Detalle de Venta', pageW / 2, 11, { align: 'center' });
      pdf.setTextColor(200, 230, 245);
      pdf.setFontSize(8);
      pdf.text(`Factura No. ${sale.factura}`, pageW / 2, 16, { align: 'center' });

      y = 26;

      // ── Subtítulos de columnas ───────────────────────────────────────────
      pdf.setTextColor(30, 30, 30);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Detalles de la venta', margin, y);
      pdf.text('Detalles del pedido', colMid + 4, y);

      y += 2;
      pdf.setDrawColor(0, 77, 119);
      pdf.setLineWidth(0.4);
      pdf.line(margin, y, colMid - 4, y);
      pdf.line(colMid + 4, y, pageW - margin, y);

      // Línea divisoria vertical
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);

      // ── Detalles de la venta (columna izquierda) ─────────────────────────
      const fields = [
        ['Factura No.',    sale.factura],
        ['Fecha',         sale.fecha],
        ['Cliente',       sale.cliente],
        ['Vendedor',      sale.vendedor],
        ['Método de pago',sale.metodoPago],
        ['Estado',        sale.estado],
        ['Entrega',       sale.entrega],
        ['Dirección',     sale.direccion],
        ['Registrado',    sale.registradoDesde],
      ];

      let yLeft = y + 6;
      fields.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 120);
        pdf.text(label.toUpperCase(), margin, yLeft);
        yLeft += 4;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(30, 30, 30);
        const lines = pdf.splitTextToSize(String(value ?? '—'), colMid - margin - 6);
        pdf.text(lines, margin, yLeft);
        yLeft += lines.length * 4.5 + 1.5;
      });

      // ── Detalles del pedido (columna derecha) ────────────────────────────
      const rightX  = colMid + 4;
      const rightW  = pageW - margin - rightX;
      let   yRight  = y + 6;

      // Domicilio si aplica
      if (sale.entrega === 'Domicilio' && sale.direccion) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(30, 30, 30);
        pdf.text('Domicilio:', rightX, yRight);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const dLines = pdf.splitTextToSize(sale.direccion, rightW);
        pdf.text(dLines, rightX + 18, yRight);
        yRight += dLines.length * 4 + 3;
      }

      // Encabezado tabla productos
      pdf.setFillColor(240, 244, 248);
      pdf.rect(rightX - 1, yRight - 3, rightW + 2, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(30, 30, 30);

      const c1 = rightX;
      const c2 = rightX + rightW * 0.45;
      const c3 = rightX + rightW * 0.60;
      const c4 = rightX + rightW * 0.78;

      pdf.text('Producto',  c1, yRight);
      pdf.text('Cant',      c2, yRight, { align: 'right' });
      pdf.text('V. Unit',   c3, yRight, { align: 'right' });
      pdf.text('Total',     c4 + (rightW * 0.22), yRight, { align: 'right' });

      yRight += 2;
      pdf.setDrawColor(0, 77, 119);
      pdf.setLineWidth(0.3);
      pdf.line(rightX - 1, yRight, pageW - margin, yRight);
      yRight += 3.5;

      // Filas de productos
      items.forEach(({ product, cantidad }, idx) => {
        if (idx % 2 !== 0) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(rightX - 1, yRight - 3, rightW + 2, 5.5, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);

        const nameLines = pdf.splitTextToSize(product.nombre, rightW * 0.43);
        pdf.text(nameLines,                                      c1,    yRight);
        pdf.text(String(cantidad),                               c2,    yRight, { align: 'right' });
        pdf.text(product.precioDetal.toLocaleString('es-CO'),    c3,    yRight, { align: 'right' });
        pdf.text((product.precioDetal * cantidad).toLocaleString('es-CO'),
                                                                c4 + (rightW * 0.22), yRight, { align: 'right' });
        yRight += nameLines.length * 4.5;
      });

      // Totales
      yRight += 2;
      pdf.setDrawColor(180, 180, 180);
      pdf.line(rightX - 1, yRight, pageW - margin, yRight);
      yRight += 5;

      const totals = [
        ['Subtotal', fmt(subtotal), false],
        ['IVA (19%)', fmt(iva),     false],
        ['Total',     fmt(total),   true ],
      ];

      totals.forEach(([label, value, isBold]) => {
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setFontSize(isBold ? 9 : 8);
        pdf.setTextColor(isBold ? 0 : 60, isBold ? 77 : 60, isBold ? 119 : 60);
        pdf.text(label, rightX, yRight);
        pdf.text(value, pageW - margin, yRight, { align: 'right' });
        if (isBold) {
          pdf.setDrawColor(0, 77, 119);
          pdf.setLineWidth(0.4);
          pdf.line(rightX - 1, yRight - 4, pageW - margin, yRight - 4);
        }
        yRight += 5.5;
      });

      // ── Footer ───────────────────────────────────────────────────────────
      const footerY = pdf.internal.pageSize.getHeight() - 10;
      pdf.setFillColor(0, 77, 119);
      pdf.rect(0, footerY - 2, pageW, 12, 'F');
      pdf.setTextColor(200, 230, 245);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(
        `Documento generado el ${new Date().toLocaleDateString('es-CO')}`,
        pageW / 2, footerY + 4, { align: 'center' }
      );

      pdf.save(`venta_${sale.factura}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (!sale) {
    handleClose();
    return null;
  }

  return (
    <div
      onClick={handleClose}
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">Más información</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* ── Body (con scroll) ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {/* Contenido que se capturará para el PDF */}
          <div className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

              {/* ── Columna izquierda: Detalles de la venta ───────────── */}
              <div className="px-6 py-5">
                <p className="text-sm font-bold text-gray-700 text-center mb-3">
                  Detalles de la venta
                </p>
                <DetailRow label="Factura No."    value={sale.factura}    />
                <DetailRow label="Fecha"          value={sale.fecha}      />
                <DetailRow label="Cliente"        value={sale.cliente}    />
                <DetailRow label="Vendedor"       value={sale.vendedor}   />
                <DetailRow label="Método de pago" value={sale.metodoPago} />
                <DetailRow label="Estado"         value={sale.estado}     />
                <DetailRow label="Entrega"        value={sale.entrega}    />
                <DetailRow label="Dirección"      value={sale.direccion}  />
                <DetailRow label="Registrado"     value={sale.registradoDesde} />
              </div>

              {/* ── Columna derecha: Detalles del pedido ──────────────── */}
              <div className="px-6 py-5 flex flex-col">
                <p className="text-sm font-bold text-gray-700 text-center mb-3">
                  Detalles del pedido
                </p>

                {/* Domicilio */}
                {sale.entrega === 'Domicilio' && sale.direccion && (
                  <p className="text-xs text-gray-600 mb-3">
                    <span className="font-semibold">Domicilio</span> {sale.direccion}
                  </p>
                )}

                {items.length > 0 ? (
                  <>
                    {/* Encabezado tabla */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-1.5 border-b-2 border-gray-800 mb-1">
                      <span className="text-xs font-bold text-gray-700">Prod</span>
                      <span className="text-xs font-bold text-gray-700 text-right">Cant</span>
                      <span className="text-xs font-bold text-gray-700 text-right">V. Unit</span>
                      <span className="text-xs font-bold text-gray-700 text-right">Total</span>
                    </div>

                    {/* Filas */}
                    <div className="flex flex-col divide-y divide-gray-100 mb-4">
                      {items.map(({ product, cantidad }) => (
                        <div
                          key={product.id}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-1.5 items-start"
                        >
                          <span className="text-xs text-gray-700">{product.nombre}</span>
                          <span className="text-xs text-gray-600 text-right tabular-nums">{cantidad}</span>
                          <span className="text-xs text-gray-600 text-right tabular-nums">
                            {product.precioDetal.toLocaleString('es-CO')}
                          </span>
                          <span className="text-xs text-gray-700 text-right tabular-nums">
                            {(product.precioDetal * cantidad).toLocaleString('es-CO')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totales */}
                    <div className="mt-auto border-t border-gray-200 pt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-gray-600">Subtotal</span>
                        <span className="text-xs text-gray-700 tabular-nums">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-semibold text-gray-600">IVA</span>
                        <span className="text-xs text-gray-700 tabular-nums">{formatPrice(iva)}</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-gray-800">
                        <span className="text-sm font-bold text-gray-800">Total</span>
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    Sin productos registrados
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          {/* Descargar PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" strokeWidth={1.8} />
            {downloading ? 'Generando...' : 'Descargar'}
          </button>

          {/* Cerrar */}
          <button
            onClick={handleClose}
            className="px-8 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleInfo;