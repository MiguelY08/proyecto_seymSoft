// src/data/OrdersDB.js
const ordersDB = [
  {
    id: 1001,
    numerosPedido: '1001',
    cliente: {
      nombre: 'Elizabeth Esparza',
      telefono: '3001234567',
      email: 'elizabeth.esparza@email.com',
      direccion: 'Cra 73 #21-30 (Belén San Bernardo 1er piso)'
    },
    productos: [
      { id: 1, nombre: 'Cuaderno Universitario', cantidad: 5, precioUnitario: 8500, subtotal: 42500 },
      { id: 7, nombre: 'Colores Prismacolor x24', cantidad: 2, precioUnitario: 45000, subtotal: 90000 },
      { id: 9, nombre: 'Regla 30cm Metálica', cantidad: 3, precioUnitario: 5500, subtotal: 16500 }
    ],
    fecha: '01/11/2025',
    total: 150000,
    estado: 'Por aprobar',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1001.pdf'
  },
  {
    id: 1002,
    numerosPedido: '1002',
    cliente: {
      nombre: 'Andrea Moreno',
      telefono: '3109876543',
      email: 'andrea.moreno@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 3, nombre: 'Resma Papel Bond A4', cantidad: 10, precioUnitario: 25000, subtotal: 250000 }
    ],
    fecha: '02/11/2025',
    total: 250000,
    estado: 'Aprobado',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1003,
    numerosPedido: '1003',
    cliente: {
      nombre: 'Lorena Castaño',
      telefono: '3158765432',
      email: 'lorena.castano@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 2, nombre: 'Bolígrafo Azul Pack x12', cantidad: 5, precioUnitario: 15000, subtotal: 75000 },
      { id: 8, nombre: 'Pegamento en Barra', cantidad: 30, precioUnitario: 3500, subtotal: 105000 }
    ],
    fecha: '03/11/2025',
    total: 185000,
    estado: 'Aprobado',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1003.pdf'
  },
  {
    id: 1004,
    numerosPedido: '1004',
    cliente: {
      nombre: 'Andrea Hernandes',
      telefono: '3201234567',
      email: 'andrea.hernandes@email.com',
      direccion: 'Dg 75 #72-1 (Laureles Chacho)'
    },
    productos: [
      { id: 4, nombre: 'Marcadores Permanentes x6', cantidad: 8, precioUnitario: 18000, subtotal: 144000 },
      { id: 11, nombre: 'Corrector Líquido', cantidad: 12, precioUnitario: 4500, subtotal: 54000 },
      { id: 14, nombre: 'Cinta Adhesiva Transparente', cantidad: 6, precioUnitario: 3500, subtotal: 21000 }
    ],
    fecha: '04/11/2025',
    total: 320000,
    estado: 'Por aprobar',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1004.pdf'
  },
  {
    id: 1005,
    numerosPedido: '1005',
    cliente: {
      nombre: 'Luisa Morales',
      telefono: '3187654321',
      email: 'luisa.morales@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 10, nombre: 'Borrador Nata', cantidad: 50, precioUnitario: 2000, subtotal: 100000 }
    ],
    fecha: '05/11/2025',
    total: 95000,
    estado: 'Por aprobar',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1006,
    numerosPedido: '1006',
    cliente: {
      nombre: 'Daniel Gomez',
      telefono: '3109876543',
      email: 'daniel@example.com',
      direccion: 'Cll 30 #89-07(Belén los almendros)'
    },
    productos: [
      { id: 6, nombre: 'Carpeta de Argollas', cantidad: 15, precioUnitario: 12000, subtotal: 180000 },
      { id: 13, nombre: 'Sacapuntas Metálico', cantidad: 30, precioUnitario: 3000, subtotal: 90000 }
    ],
    fecha: '06/11/2025',
    total: 275000,
    estado: 'Aprobado',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1006.pdf'
  },
  {
    id: 1007,
    numerosPedido: '1007',
    cliente: {
      nombre: 'Melissa Martin',
      telefono: '3145678901',
      email: 'melissa.martin@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 5, nombre: 'Tijeras Escolares', cantidad: 20, precioUnitario: 6500, subtotal: 130000 }
    ],
    fecha: '07/11/2025',
    total: 140000,
    estado: 'Cancelado',
    metodoPago: 'Transferencia',
    comprobantePago: null
  },
  {
    id: 1008,
    numerosPedido: '1008',
    cliente: {
      nombre: 'Marcela Reyes',
      telefono: '3167890123',
      email: 'marcela.reyes@email.com',
      direccion: 'Carrera 26#40S-81 (Belén rincón)'
    },
    productos: [
      { id: 12, nombre: 'Temperas x12 colores', cantidad: 8, precioUnitario: 28000, subtotal: 224000 },
      { id: 15, nombre: 'Block de Dibujo A3', cantidad: 10, precioUnitario: 15000, subtotal: 150000 }
    ],
    fecha: '08/11/2025',
    total: 410000,
    estado: 'Por aprobar',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1008.pdf'
  },
  {
    id: 1009,
    numerosPedido: '1009',
    cliente: {
      nombre: 'Danna Mejia',
      telefono: '3198765432',
      email: 'danna.mejia@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 1, nombre: 'Cuaderno Universitario', cantidad: 10, precioUnitario: 8500, subtotal: 85000 },
      { id: 8, nombre: 'Pegamento en Barra', cantidad: 20, precioUnitario: 3500, subtotal: 70000 }
    ],
    fecha: '09/11/2025',
    total: 155000,
    estado: 'Cancelado',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1010,
    numerosPedido: '1010',
    cliente: {
      nombre: 'Luciano Madrid',
      telefono: '3123456789',
      email: 'luciano.madrid@email.com',
      direccion: 'Calle 60#60B-36(Manantiales oriental)'
    },
    productos: [
      { id: 7, nombre: 'Colores Prismacolor x24', cantidad: 5, precioUnitario: 45000, subtotal: 225000 },
      { id: 4, nombre: 'Marcadores Permanentes x6', cantidad: 4, precioUnitario: 18000, subtotal: 72000 }
    ],
    fecha: '10/11/2025',
    total: 290000,
    estado: 'Aprobado',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1010.pdf'
  },
  {
    id: 1011,
    numerosPedido: '1011',
    cliente: {
      nombre: 'Sebastian Gallego',
      telefono: '3134567890',
      email: 'sebastian.gallego@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 3, nombre: 'Resma Papel Bond A4', cantidad: 5, precioUnitario: 25000, subtotal: 125000 }
    ],
    fecha: '11/11/2025',
    total: 125000,
    estado: 'Por aprobar',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1012,
    numerosPedido: '1012',
    cliente: {
      nombre: 'Miguel Bautista',
      telefono: '3156789012',
      email: 'miguel.bautista@email.com',
      direccion: 'Carrera 107#49A-97(San Javier)'
    },
    productos: [
      { id: 2, nombre: 'Bolígrafo Azul Pack x12', cantidad: 20, precioUnitario: 15000, subtotal: 300000 },
      { id: 10, nombre: 'Borrador Nata', cantidad: 50, precioUnitario: 2000, subtotal: 100000 }
    ],
    fecha: '12/11/2025',
    total: 355000,
    estado: 'Aprobado',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1012.pdf'
  },
  {
    id: 1013,
    numerosPedido: '1013',
    cliente: {
      nombre: 'Andres Iglesias',
      telefono: '3178901234',
      email: 'andres.iglesias@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 9, nombre: 'Regla 30cm Metálica', cantidad: 15, precioUnitario: 5500, subtotal: 82500 },
      { id: 13, nombre: 'Sacapuntas Metálico', cantidad: 25, precioUnitario: 3000, subtotal: 75000 }
    ],
    fecha: '13/11/2025',
    total: 108000,
    estado: 'Por aprobar',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1014,
    numerosPedido: '1014',
    cliente: {
      nombre: 'Antonio Botero',
      telefono: '3189012345',
      email: 'antonio.botero@email.com',
      direccion: 'Transversal 74#RD-5(Poblado)'
    },
    productos: [
      { id: 6, nombre: 'Carpeta de Argollas', cantidad: 25, precioUnitario: 12000, subtotal: 300000 },
      { id: 11, nombre: 'Corrector Líquido', cantidad: 30, precioUnitario: 4500, subtotal: 135000 }
    ],
    fecha: '14/11/2025',
    total: 485000,
    estado: 'Por aprobar',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1014.pdf'
  },
  {
    id: 1015,
    numerosPedido: '1015',
    cliente: {
      nombre: 'Cristian Monsalve',
      telefono: '3190123456',
      email: 'cristian.monsalve@email.com',
      direccion: 'El cliente lo recoge'
    },
    productos: [
      { id: 14, nombre: 'Cinta Adhesiva Transparente', cantidad: 40, precioUnitario: 3500, subtotal: 140000 }
    ],
    fecha: '15/11/2025',
    total: 175000,
    estado: 'Por aprobar',
    metodoPago: 'Efectivo',
    comprobantePago: null
  },
  {
    id: 1016,
    numerosPedido: '1016',
    cliente: {
      nombre: 'Nicol Espinoza',
      telefono: '3112345678',
      email: 'nicol.espinoza@email.com',
      direccion: 'Tenerife #54-88(La candelaria)'
    },
    productos: [
      { id: 15, nombre: 'Block de Dibujo A3', cantidad: 15, precioUnitario: 15000, subtotal: 225000 },
      { id: 12, nombre: 'Temperas x12 colores', cantidad: 5, precioUnitario: 28000, subtotal: 140000 }
    ],
    fecha: '16/11/2025',
    total: 260000,
    estado: 'Aprobado',
    metodoPago: 'Transferencia',
    comprobantePago: 'comprobante_1016.pdf'
  }
];

export default ordersDB;