export const permissionsList = [

  {
    id:1,
    modulo:"usuarios",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"},
      {key:"descargar", backend:"DESCARGAR", label:"Descargar"}
    ]
  },

  {
    id:2,
    modulo:"roles",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"}
    ]
  },

  {
    id:3,
    modulo:"clientes",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"}
    ]
  },

  {
    id:4,
    modulo:"productos",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"}
    ]
  },

  {
    id:5,
    modulo:"categorias",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear_categoria", backend:"CREATE", label:"Crear categoría"},
      {key:"crear_subcategoria", backend:"CREATE", label:"Crear subcategoría"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"}
    ]
  },

  {
    id:6,
    modulo:"proveedores",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"}
    ]
  },

  {
    id:7,
    modulo:"compras",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"anular", backend:"ANULAR", label:"Anular"},
      {key:"devolver", backend:"DEVOLVER", label:"Devolver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"}
    ]
  },

  {
    id:8,
    modulo:"producto_no_conforme",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"exportar", backend:"EXPORT", label:"Exportar"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"anular", backend:"ANULAR", label:"Anular"}
    ]
  },

  {
    id:9,
    modulo:"pedidos",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"anular", backend:"ANULAR", label:"Anular"},
      {key:"exportar", backend:"EXPORT", label:"Exportar"}
    ]
  },

  {
    id:10,
    modulo:"ventas",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"},
      {key:"descargar", backend:"DESCARGAR", label:"Descargar"},
      {key:"crear_devolucion", backend:"CREAR_DEVOLUCION", label:"Crear devolución"},
      {key:"anular", backend:"ANULAR", label:"Anular"}
    ]
  },

  {
    id:11,
    modulo:"devoluciones_en_ventas",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"crear", backend:"CREATE", label:"Crear"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"anular", backend:"ANULAR", label:"Anular"}
    ]
  },

  {
    id:12,
    modulo:"pagos_y_abonos",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"abonar", backend:"ABONAR", label:"Abonar"},
      {key:"anular", backend:"ANULAR", label:"Anular"},
      {key:"descargar", backend:"DESCARGAR", label:"Descargar"},
      {key:"exportar", backend:"EXPORT", label:"Exportar"},
      {key:"contactar", backend:"CONTACTAR", label:"Contactar"},
      {key:"generar_interes", backend:"GENERAR_INTERES", label:"Generar interés"}
    ]
  },

  {
    id:13,
    modulo:"banners",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"subir_imagen", backend:"SUBIR_IMAGEN", label:"Subir imagen"},
      {key:"eliminar", backend:"DELETE", label:"Eliminar"},
      {key:"activar_desactivar", backend:"ACTIVATE_DEACTIVATE", label:"Activar / Desactivar"},
      {key:"ordenar", backend:"ORDENAR", label:"Ordenar"}
    ]
  },

  {
    id:14,
    modulo:"devoluciones_en_compras",
    acciones:[
      {key:"ver", backend:"READ", label:"Ver"},
      {key:"ver_informacion", backend:"READ_DETAIL", label:"Ver información"},
      {key:"editar", backend:"UPDATE", label:"Editar"},
      {key:"anular", backend:"ANULAR", label:"Anular"}
    ]
  },

  {
    id:15,
    modulo:"dashboard",
    acciones:[
      {key:"ver", backend:"READ", label:"Visualizar metricas de inicio"}
    ]
  }

];
