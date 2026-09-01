# Manual tecnico - Seguridad frontend

## Configuracion CSP

**Pregunta:** ¿Existe configuracion CSP en el frontend o hosting?

**Respuesta:** Si. El frontend cuenta con una politica `Content-Security-Policy` configurada en `vercel.json`, aplicada desde el hosting para controlar que recursos puede cargar la aplicacion y reducir el riesgo de ataques XSS.

La politica permite unicamente los origenes necesarios para el funcionamiento de la aplicacion:

- Recursos propios del frontend mediante `'self'`.
- Conexion al backend autorizado mediante `connect-src`.
- Dominios de Supabase para carga de imagenes o archivos.
- Dominios requeridos por Google para OAuth, perfiles e integraciones usadas por la aplicacion.
- Google Fonts cuando se requieren fuentes externas.
- Imagenes desde origenes confiables, incluyendo `self`, `data:`, `blob:`, Supabase y perfiles de Google.

Adicionalmente, la politica restringe comportamientos riesgosos:

- `object-src 'none'` evita la carga de plugins u objetos embebidos.
- `frame-ancestors 'none'` evita que la aplicacion sea embebida en otros sitios.
- `base-uri 'self'` limita la manipulacion de la URL base del documento.
- `form-action 'self'` restringe el envio de formularios a origenes propios.

Tambien se reviso el componente `AlertItem.jsx`, el cual renderizaba contenido HTML mediante `dangerouslySetInnerHTML`. Para disminuir el riesgo de XSS, el contenido HTML de las alertas ahora se sanitiza con `DOMPurify` antes de mostrarse al usuario.

La configuracion fue validada localmente con una prueba de humo sobre rutas principales de la aplicacion, incluyendo inicio, tienda, login y panel administrativo, sin detectar bloqueos CSP en recursos legitimos. Para produccion, se debe verificar que la URL real del backend este incluida en `connect-src` y probar los flujos de autenticacion, Google OAuth, renovacion de sesion, imagenes, formularios y alertas HTML con el entorno productivo.

Esta configuracion mejora la proteccion del frontend, aunque no representa seguridad absoluta. Debe mantenerse actualizada cada vez que la aplicacion incorpore nuevos dominios externos, servicios de terceros o recursos cargados desde otros origenes.
