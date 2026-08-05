Controladores esperados para el flujo de pagos
==============================================

Resumen
-------
Documento orientativo que describe rutas, responsabilidades y validaciones esperadas en controladores backend relacionados con pagos, comprobantes y ventas.

Rutas y controladores (mapa rápido)
- POST /orders -> OrdersController.create
  - Validaciones: cliente, items, shippingAmount si domicilio.
  - Comportamiento de pagos: si `payments` viene en el body, procesarlos en la misma transacción (crear pagos, actualizar totalPagado, actualizar pagoEstado).
  - Respuestas: 201 con pedido creado; incluir `favorBalanceRestoredAmount` si aplica.

- POST /orders/{orderId}/payments -> PaymentsController.createForOrder
  - Validaciones: idPaymentMethod válido, amount > 0 (o <0 para devoluciones si se permite), referencia/idempotency.
  - Comportamiento: crear pago, recalcular `totalPagado` y `pagoEstado`. Retornar 201 o 409 si duplicado.

- POST /orders/{orderId}/payment-receipts -> PaymentReceiptsController.upload
  - Soporta multipart/form-data con `image` y `observations`.
  - Guardar archivo (S3 o almacenamiento local), retornar `imageUrl`, `id`, `status` (pendiente).
  - Validaciones: tipo MIME, tamaño, extensión.

- PATCH /orders/{orderId}/payment-receipts/{receiptId}/review -> PaymentReceiptsController.review
  - Requiere rol (revisor). Actualiza estado (approved/rejected), añade reviewer, reviewedAt y reviewObservations.

- POST /payments/installments -> PaymentsController.createInstallment
- PATCH /payments/installments/{id}/cancel -> PaymentsController.cancelInstallment
- POST /payments/interests -> PaymentsController.generateInterest

- GET /payments/payment-methods -> PaymentsController.listMethods
- GET /payments/customers -> PaymentsController.listCreditCustomers
- GET /payments/customers/{id}/invoices -> PaymentsController.getCustomerInvoices
- GET /payments/invoices/{id}/installments -> PaymentsController.getInvoiceInstallments

Validaciones y reglas de negocio críticas
- Idempotencia: aceptar `Idempotency-Key` o `reference` para evitar pagos duplicados.
- Transaccionalidad: crear pedido + pagos debe ocurrir en la misma transacción o con compensaciones claras.
- Reglas sobre saldo a favor:
  - Aceptar `favorBalanceAmount` en creación solo si backend aplica y devuelve el estado resultante.
  - En anulaciones, devolver `favorBalanceRestoredAmount` en la respuesta cuando corresponda.
- Pagos negativos: si se usa para devoluciones, documentar claramente (o exponer endpoint refund separado).

Mensajes de error y códigos (para mapear en UI)
- 400: Validación de campos.
- 401/403: Autenticación/Autorización.
- 409: Conflicto / pago duplicado / idempotency.
- 422: Reglas de negocio (ej. cupo de crédito insuficiente, saldo a favor insuficiente).

Recomendaciones de implementación
- Registrar auditoría (who/when) en pagos, aprobaciones y anulaciones.
- Exponer en responses datos útiles para UI: `totalPagado`, `pagoEstado`, `saldoPendiente`, `favorBalanceRestoredAmount`.
- Implementar pruebas: crear pedido con payments; crear payment por separado; upload y review de receipt; anulación de abono.
