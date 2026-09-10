import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const root = process.cwd();
const output = path.join(root, 'public', 'Terminos_y_Condiciones_Papeleria_Magic.pdf');
const logoPath = path.join(root, 'src', 'assets', 'PapeleriaMagicLogo_512x512.png');

const doc = new jsPDF({ unit: 'mm', format: 'a4' });
const pageWidth = 210;
const pageHeight = 297;
const margin = 20;
const contentWidth = pageWidth - margin * 2;
const blue = [0, 77, 119];
const lightBlue = [232, 242, 248];
const gray = [76, 86, 95];
const dark = [30, 41, 59];

function addHeader() {
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 30, 'F');
  const logo = fs.readFileSync(logoPath).toString('base64');
  doc.addImage(`data:image/png;base64,${logo}`, 'PNG', margin, 5, 20, 20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('Papelería Magic', margin + 26, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Términos y Condiciones de Uso', margin + 26, 21);
}

function addFooter() {
  const page = doc.getNumberOfPages();
  doc.setDrawColor(210, 220, 228);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('Papelería Magic | Medellín, Colombia', margin, pageHeight - 10);
  doc.text(`Página ${page}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
}

function newPageIfNeeded(height = 12) {
  if (cursorY + height > pageHeight - 23) {
    addFooter();
    doc.addPage();
    addHeader();
    cursorY = 42;
  }
}

function heading(title, number) {
  newPageIfNeeded(18);
  doc.setFillColor(...lightBlue);
  doc.roundedRect(margin, cursorY - 5, contentWidth, 11, 2, 2, 'F');
  doc.setTextColor(...blue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${number}. ${title}`, margin + 4, cursorY + 2.5);
  cursorY += 14;
}

function paragraph(text, options = {}) {
  const size = options.size ?? 9.4;
  const lineHeight = options.lineHeight ?? 4.8;
  const indent = options.indent ?? 0;
  const lines = doc.splitTextToSize(text, contentWidth - indent);
  newPageIfNeeded(lines.length * lineHeight + 2);
  doc.setTextColor(...(options.color ?? dark));
  doc.setFont('helvetica', options.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.text(lines, margin + indent, cursorY);
  cursorY += lines.length * lineHeight + 3;
}

function bullet(text) {
  const indent = 6;
  const bulletIndent = 3;
  const lines = doc.splitTextToSize(text, contentWidth - indent);
  newPageIfNeeded(lines.length * 4.7 + 2);
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.circle(margin + bulletIndent, cursorY - 1.2, 0.8, 'F');
  doc.text(lines, margin + indent, cursorY);
  cursorY += lines.length * 4.7 + 2.5;
}

addHeader();
let cursorY = 43;

doc.setTextColor(...dark);
doc.setFont('helvetica', 'bold');
doc.setFontSize(17);
doc.text('Términos y Condiciones', margin, cursorY);
cursorY += 8;
doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(...gray);
doc.text('Última actualización: 10 de septiembre de 2026', margin, cursorY);
cursorY += 9;

paragraph(
  'Estos términos y condiciones regulan el acceso y uso de la tienda virtual de Papelería Magic, así como la gestión de pedidos, pagos, envíos, devoluciones, reemplazos y saldos a favor. Al crear una cuenta, navegar en las funcionalidades autenticadas o realizar un pedido, el usuario declara que ha leído y acepta estas condiciones.'
);

heading('Uso de la plataforma y cuentas de usuario', 1);
bullet('El catálogo y la información general de los productos son de acceso público.');
bullet('Para guardar artículos en favoritos, añadir productos al carrito y utilizar las demás funcionalidades interactivas, es obligatorio crear una cuenta y mantener una sesión activa.');
bullet('El usuario debe suministrar información veraz, mantenerla actualizada y proteger sus credenciales de acceso. Las operaciones realizadas desde su cuenta se entenderán efectuadas por el titular, salvo reporte oportuno de acceso no autorizado.');
bullet('Los precios publicados están asociados a la categoría de cliente asignada a la cuenta: Detal, Mayorista, Colegas o Por Pacas, de acuerdo con las políticas comerciales del establecimiento.');

heading('Procesamiento de pedidos y tiempos de pago', 2);
bullet('Todo pedido generado en la tienda web dispone de un plazo estricto de cuarenta y ocho (48) horas continuas para registrar o completar la totalidad de su pago.');
bullet('Si al vencerse dicho plazo no existe confirmación del pago total, el sistema podrá anular automáticamente la orden y liberar la reserva de inventario.');
bullet('Se admiten abonos parciales. Estos se registrarán con base en el comprobante de pago digital adjuntado en la plataforma y sujeto a validación por el establecimiento.');
bullet('Cuando un pedido sea anulado por vencimiento del plazo, el importe efectivamente pagado se acreditará automáticamente como Saldo a Favor en el perfil del cliente, una vez validado el pago.');
bullet('La disponibilidad de productos se encuentra sujeta a inventario. La creación de un pedido no garantiza por sí sola la disponibilidad indefinida si no se completa el pago dentro del plazo indicado.');

heading('Envíos y despachos a domicilio', 3);
bullet('En pedidos seleccionados con modalidad de entrega “Domicilio”, la opción de pago completo se habilitará después de que un asesor valide la dirección de entrega y cargue a la orden el costo correspondiente al transporte.');
bullet('El valor y las condiciones del transporte dependen de la dirección, cobertura, transportadora y características del pedido. Cualquier ajuste será informado antes de completar el pago.');
bullet('El cliente debe suministrar una dirección completa y datos de contacto disponibles para coordinar la entrega.');

heading('Devoluciones, reemplazos y garantías', 4);
bullet('Toda solicitud de devolución o cambio debe iniciarse o gestionarse de manera presencial en los puntos de atención de Papelería Magic, conforme a la revisión del caso y a las condiciones aplicables.');
bullet('El despacho a domicilio de un artículo devuelto podrá ofrecerse como alternativa únicamente cuando exista un acuerdo entre el cliente y el establecimiento.');
bullet('Las devoluciones procesadas bajo el concepto de “Reemplazo” se realizarán exclusivamente por la misma referencia o código del producto original.');
bullet('Si no existe disponibilidad para efectuar el reemplazo directo, el establecimiento acreditará el valor exacto del producto devuelto en la cuenta del cliente como Saldo a Favor.');
bullet('El Saldo a Favor generado por un reemplazo no estará sujeto a modificación manual. Su aplicación se realizará por el valor registrado y conforme a la trazabilidad de la operación.');
bullet('Las solicitudes estarán sujetas a la verificación del estado del producto, comprobante de compra y demás condiciones comerciales o legales aplicables al caso.');

heading('Saldos a favor', 5);
bullet('El Saldo a Favor es un crédito interno asociado al perfil del cliente y se genera por conceptos debidamente validados, como abonos de pedidos anulados o reemplazos no disponibles.');
bullet('El saldo se aplicará por el valor reconocido en el sistema y no podrá ser alterado manualmente por el cliente.');
bullet('Para solicitar información o aclarar un movimiento, el cliente debe presentar los datos del pedido, comprobante de pago o documento de la devolución correspondiente.');

heading('Actualizaciones y aceptación', 6);
paragraph(
  'Papelería Magic podrá modificar o actualizar estos términos para reflejar cambios en la operación de la plataforma, políticas comerciales, procesos de pago, inventario, envíos o atención al cliente. La versión vigente estará disponible desde el enlace “Términos y condiciones” de la tienda virtual. Las actualizaciones se identificarán con su fecha de última modificación.'
);
paragraph(
  'Si el usuario continúa utilizando la plataforma después de publicada una actualización, se entenderá que conoce y acepta la versión vigente. Cuando una modificación requiera una aceptación expresa por motivos legales o técnicos, esta será solicitada antes de continuar con la funcionalidad correspondiente.'
);

heading('Canales de atención', 7);
paragraph('Para consultas relacionadas con estos términos, pedidos, pagos, envíos, devoluciones o saldos a favor, el cliente puede comunicarse con Papelería Magic a través de los canales publicados en la tienda virtual o acudir presencialmente a nuestros puntos de atención.');

addFooter();
doc.save(output);
console.log(`PDF generado: ${output}`);
