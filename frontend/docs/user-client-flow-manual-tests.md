# Pruebas Manuales: Flujo Usuario > Cliente

Fecha de referencia: 2026-08-04

## Objetivo

Validar de forma controlada el flujo:

`Usuarios > Editar usuario > Hacer cliente > Crear cliente asociado`

sin afectar los flujos existentes de usuarios y clientes.

## Alcance

Estas pruebas cubren:

- Asociar un cliente a un usuario existente
- Manejo de errores funcionales del flujo asociado
- No regresión básica del flujo normal de clientes sin `userId`

Estas pruebas no cubren:

- Edición avanzada de clientes
- Eliminación de usuarios o clientes
- Activación o desactivación de usuarios/clientes

## Preparación

Antes de iniciar, contar con:

- Un usuario existente sin cliente asociado
- Un usuario existente con cliente ya asociado
- Un identificador de usuario inexistente o un caso reproducible donde el usuario haya sido eliminado
- Acceso al módulo administrativo de usuarios
- Acceso al módulo de clientes para validar creación final

## Caso 1: Usuario existente sin cliente asociado

Objetivo:
Confirmar que se pueda crear un cliente ligado a un `userId` existente.

Pasos:

1. Ir al módulo `Usuarios`.
2. Buscar un usuario que no tenga cliente asociado.
3. Abrir `Editar usuario`.
4. Pulsar `Hacer cliente`.
5. Confirmar que el formulario de cliente abra con datos precargados.
6. Completar los campos faltantes obligatorios.
7. Enviar el formulario.

Resultado esperado:

- El formulario se envía sin error técnico.
- Se muestra mensaje de éxito.
- La lista de usuarios se refresca.
- El usuario queda marcado como asociado a cliente.
- En el módulo de clientes aparece el nuevo cliente vinculado al usuario.

## Caso 2: Usuario ya asociado a cliente

Objetivo:
Confirmar que el sistema no permita duplicar la asociación.

Pasos:

1. Ir al módulo `Usuarios`.
2. Buscar un usuario que ya tenga cliente asociado.
3. Intentar abrir el flujo `Hacer cliente`.

Resultado esperado:

- El sistema bloquea el flujo antes de crear un cliente nuevo.
- Se muestra un mensaje funcional indicando que el usuario ya tiene un perfil de cliente asociado.
- No se crea un segundo cliente.

## Caso 3: Conflicto detectado por backend con UI desactualizada

Objetivo:
Confirmar que, si la UI quedó desactualizada y el backend responde conflicto, el sistema lo trate como error funcional.

Pasos:

1. Abrir `Hacer cliente` sobre un usuario aparentemente disponible.
2. Antes de enviar, provocar o reproducir que ese usuario ya tenga cliente asociado.
3. Enviar el formulario.

Resultado esperado:

- El backend responde conflicto `409`.
- El frontend muestra mensaje funcional de usuario ya asociado.
- La lista de usuarios se refresca.
- No aparece error técnico genérico.

## Caso 4: Usuario no encontrado

Objetivo:
Confirmar que el backend responda de forma controlada cuando el `userId` ya no exista.

Pasos:

1. Abrir el flujo `Hacer cliente` sobre un usuario válido.
2. Antes de enviar, provocar o reproducir que el usuario ya no exista en backend.
3. Enviar el formulario.

Resultado esperado:

- El backend responde `404`.
- El frontend muestra advertencia clara indicando que el usuario no está disponible.
- La lista de usuarios se refresca.
- No aparece un `500` genérico por método inexistente.

## Caso 5: Usuario con nombre de una sola palabra

Objetivo:
Confirmar que el sembrado de datos no bloquee la creación cuando el usuario no tiene apellido separado.

Pasos:

1. Ir a `Usuarios`.
2. Seleccionar un usuario cuyo nombre tenga una sola palabra.
3. Abrir `Hacer cliente`.
4. Completar campos faltantes y enviar.

Resultado esperado:

- El formulario no se bloquea solo por apellido vacío en este flujo asociado.
- El cliente se crea correctamente si el resto de datos es válido.

## Caso 6: Flujo normal de cliente sin `userId`

Objetivo:
Confirmar que la creación normal de cliente siga funcionando igual.

Pasos:

1. Ir al módulo `Clientes`.
2. Crear un cliente desde el flujo normal, no desde usuarios.
3. Completar el formulario con datos válidos.
4. Enviar el formulario.

Resultado esperado:

- El flujo sigue funcionando normalmente.
- Si corresponde, se crea usuario + cliente como antes.
- No se observa impacto por los cambios del flujo asociado.

## Caso 7: Validaciones de formulario en flujo asociado

Objetivo:
Confirmar que las validaciones principales siguen activas en `Usuario > Cliente`.

Probar:

- Documento vacío
- Dirección vacía
- Tipo de cliente sin seleccionar
- RUT sin seleccionar
- CIU inválido cuando `RUT = si`
- Correo inválido
- Documento duplicado

Resultado esperado:

- Cada caso muestra mensaje de validación claro.
- El formulario no se envía mientras existan errores bloqueantes.

## Checklist de cierre

Marcar como completado cuando se confirme:

- [ ] Caso 1 aprobado
- [ ] Caso 2 aprobado
- [ ] Caso 3 aprobado
- [ ] Caso 4 aprobado
- [ ] Caso 5 aprobado
- [ ] Caso 6 aprobado
- [ ] Caso 7 aprobado

## Criterio de aprobación final

El flujo `Usuario > Cliente` se considera estable si:

- crea correctamente el cliente asociado cuando corresponde
- bloquea duplicados de asociación
- responde con errores funcionales claros para `404` y `409`
- no rompe la creación normal de clientes
