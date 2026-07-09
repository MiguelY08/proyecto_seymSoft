export const permissionsList = [

  {
    id: 1,
    modulo: "usuarios",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
    ],
  },

  {
    id: 2,
    modulo: "roles",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
    ],
  },

  {
    id: 3,
    modulo: "clientes",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
    ],
  },

  {
    id: 4,
    modulo: "productos",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
    ],
  },

  {
    id: 5,
    modulo: "categorias",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
    ],
  },

  {
    id: 6,
    modulo: "proveedores",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
    ],
  },

  {
    id: 7,
    modulo: "compras",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
      { key: "devolver", backend: "DEVOLVER", label: "Devolver" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
      { key: "crear_devolucion", backend: "CREAR_DEVOLUCION", label: "Crear devolucion" },
    ],
  },

  {
    id: 8,
    modulo: "producto_no_conforme",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
    ],
  },

  {
    id: 9,
    modulo: "pedidos",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
    ],
  },

  {
    id: 10,
    modulo: "ventas",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
      { key: "crear_devolucion", backend: "CREAR_DEVOLUCION", label: "Crear devolucion" },
    ],
  },

  {
    id: 11,
    modulo: "devoluciones_en_ventas",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
    ],
  },

  {
    id: 12,
    modulo: "pagos_y_abonos",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "abonar", backend: "ABONAR", label: "Abonar" },
      { key: "generar_interes", backend: "GENERAR_INTERES", label: "Generar interes" },
      { key: "contactar", backend: "CONTACTAR", label: "Contactar" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
      { key: "descargar", backend: "DESCARGAR", label: "Descargar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
    ],
  },

  {
    id: 13,
    modulo: "banners",
    acciones: [
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "eliminar", backend: "DELETE", label: "Eliminar" },
      { key: "ordenar", backend: "ORDENAR", label: "Ordenar" },
      { key: "subir_imagen", backend: "SUBIR_IMAGEN", label: "Subir imagen" },
      { key: "activar_desactivar", backend: "ACTIVATE_DEACTIVATE", label: "Activar / Desactivar" },
      { key: "ampliar_imagen", backend: "AMPLIAR_IMAGEN", label: "Ampliar imagen" },
    ],
  },

  {
    id: 14,
    modulo: "devoluciones_en_compras",
    acciones: [
      { key: "crear", backend: "CREATE", label: "Crear" },
      { key: "ver", backend: "READ", label: "Ver" },
      { key: "ver_informacion", backend: "READ_DETAIL", label: "Ver informacion" },
      { key: "editar", backend: "UPDATE", label: "Editar" },
      { key: "anular", backend: "ANULAR", label: "Anular" },
      { key: "exportar", backend: "EXPORT", label: "Exportar" },
    ],
  },

  {
    id: 15,
    modulo: "dashboard",
    acciones: [
      { key: "ver", backend: "READ", label: "Visualizar metricas de inicio" },
    ],
  },

];
