import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import TopBar         from '../components/TopBar';
import UsersTable     from '../components/UsersTable';
import PaginatorUsers from '../components/PaginatorUsers';

const sampleData = [
  { id: 1,  tipo: 'CC',  documento: '1023984712',    nombre: 'Daniel Martínez Salazar',        correo: 'daniel.ms@gmail.com',            telefono: '3148650920', rol: 'Administrador', activo: true  },
  { id: 2,  tipo: 'CC',  documento: '1089456721',    nombre: 'Natalia García Pardo',           correo: 'natalia.ms@gmail.com',           telefono: '3156428790', rol: 'Administrador', activo: false },
  { id: 3,  tipo: 'CC',  documento: '1032165987',    nombre: 'Sebastián López Herrera',        correo: 'seb.lopezh@hotmail.com',         telefono: '3204846751', rol: 'Empleado',      activo: false },
  { id: 4,  tipo: 'CE',  documento: '1076543219',    nombre: 'Valentina Ortiz Ramírez',        correo: 'vale.ortiz@gmail.com',           telefono: '3112987645', rol: 'Empleado',      activo: true  },
  { id: 5,  tipo: 'CC',  documento: '1009874563',    nombre: 'Juan David Restrepo Ruiz',       correo: 'juandavidr@gmail.com',           telefono: '3017546892', rol: 'Empleado',      activo: true  },
  { id: 6,  tipo: 'CC',  documento: '1098234567',    nombre: 'Camila Rodríguez Gómez',         correo: 'camilardg@gmail.com',            telefono: '3129087645', rol: 'Empleado',      activo: true  },
  { id: 7,  tipo: 'CC',  documento: '1094827365',    nombre: 'Carlos Ramírez Gómez',           correo: 'carlos.ramirez@gmail.com',       telefono: '3204568790', rol: 'Cliente',       activo: true  },
  { id: 8,  tipo: 'CE',  documento: '1029384756',    nombre: 'Ana Lucía Torres',               correo: 'ana.torres@hotmail.com',         telefono: '3129087645', rol: 'Cliente',       activo: true  },
  { id: 9,  tipo: 'NIT', documento: '901457892-3',   nombre: 'Papelera El Punto S.A.S',        correo: 'contacto@papeleraelpunto.c...',  telefono: '6013459876', rol: 'Cliente',       activo: false },
  { id: 10, tipo: 'CC',  documento: '1002938475',    nombre: 'Jorge Ríos',                     correo: 'jorge.rios@yahoo.com',           telefono: '3115698234', rol: 'Cliente',       activo: true  },
  { id: 11, tipo: 'CC',  documento: '1109876543',    nombre: 'Natalia Castaño López',          correo: 'natalia.castano@gmail.com',      telefono: '3208796541', rol: 'Cliente',       activo: true  },
  { id: 12, tipo: 'NIT', documento: '901237845-9',   nombre: 'Distribuciones Andina Ltda.',    correo: 'ventas@andinaltda.co',           telefono: '6043218790', rol: 'Cliente',       activo: true  },
  { id: 13, tipo: 'CE',  documento: '1039847265',    nombre: 'Pedro Alvarado Mendoza',         correo: 'pedro.alvarado@gmail.com',       telefono: '3117659870', rol: 'Cliente',       activo: true  },
  { id: 14, tipo: 'CC',  documento: '1092736452',    nombre: 'Laura Restrepo Ortiz',           correo: 'laura.restrepo@gmail.com',       telefono: '3149087234', rol: 'Cliente',       activo: false },
  { id: 15, tipo: 'NIT', documento: '901984563-2',   nombre: 'Industrias Bolívar S.A.',        correo: 'contacto@industriasbolivar.c...', telefono: '6019087654', rol: 'Cliente',      activo: false },
  { id: 16, tipo: 'CC',  documento: '1087654321',    nombre: 'Ricardo Peña Salazar',           correo: 'ricardo.pena@gmail.com',         telefono: '3008765432', rol: 'Cliente',       activo: true  },
  { id: 17, tipo: 'CC',  documento: '1045678923',    nombre: 'Sofía Mendoza Vargas',           correo: 'sofia.mendoza@gmail.com',        telefono: '3134567890', rol: 'Empleado',      activo: true  },
  { id: 18, tipo: 'CE',  documento: '1056789034',    nombre: 'Andrés Felipe Cano Ruiz',        correo: 'andres.cano@hotmail.com',        telefono: '3223456781', rol: 'Cliente',       activo: false },
  { id: 19, tipo: 'CC',  documento: '1067890145',    nombre: 'Mariana Suárez Pineda',          correo: 'mariana.suarez@gmail.com',       telefono: '3001234567', rol: 'Cliente',       activo: true  },
  { id: 20, tipo: 'NIT', documento: '900876543-1',   nombre: 'Comercializadora Sur Ltda.',     correo: 'info@comercializadorasur.co',    telefono: '6054321098', rol: 'Cliente',       activo: true  },
  { id: 21, tipo: 'CC',  documento: '1112345678',    nombre: 'Felipe Castro Díaz',             correo: 'felipe.castro@gmail.com',        telefono: '3104567891', rol: 'Empleado',      activo: true  },
  { id: 22, tipo: 'CE',  documento: '1123456789',    nombre: 'Tatiana Morales Rojas',          correo: 'tatiana.morales@gmail.com',      telefono: '3115678902', rol: 'Cliente',       activo: true  },
  { id: 23, tipo: 'NIT', documento: '901111222-3',   nombre: 'Soluciones Tech S.A.S',          correo: 'contacto@solucionestech.co',     telefono: '6012345678', rol: 'Cliente',       activo: true  },
  { id: 24, tipo: 'CC',  documento: '1134567890',    nombre: 'Miguel Ángel Torres',            correo: 'miguel.torres@gmail.com',        telefono: '3126789013', rol: 'Administrador', activo: true  },
  { id: 25, tipo: 'CC',  documento: '1145678901',    nombre: 'Paula Andrea Gómez',             correo: 'paula.gomez@gmail.com',          telefono: '3137890124', rol: 'Empleado',      activo: false },
  { id: 26, tipo: 'CE',  documento: '1156789012',    nombre: 'Javier Hernando Ruiz',           correo: 'javier.ruiz@hotmail.com',        telefono: '3148901235', rol: 'Cliente',       activo: true  },
  { id: 27, tipo: 'CC',  documento: '1167890123',    nombre: 'Daniela Herrera Castro',         correo: 'daniela.herrera@gmail.com',      telefono: '3159012346', rol: 'Empleado',      activo: true  },
  { id: 28, tipo: 'NIT', documento: '902222333-4',   nombre: 'Inversiones del Norte S.A.S',    correo: 'info@inversionesnorte.co',       telefono: '6045678901', rol: 'Cliente',       activo: false },
  { id: 29, tipo: 'CC',  documento: '1178901234',    nombre: 'Esteban Vargas León',            correo: 'esteban.vargas@gmail.com',       telefono: '3160123457', rol: 'Cliente',       activo: true  },
  { id: 30, tipo: 'CC',  documento: '1189012345',    nombre: 'Laura Fernanda Mejía',           correo: 'laura.mejia@gmail.com',          telefono: '3171234568', rol: 'Cliente',       activo: true  },
  { id: 31, tipo: 'CE',  documento: '1190123456',    nombre: 'Kevin Andrés Salgado',           correo: 'kevin.salgado@hotmail.com',      telefono: '3182345679', rol: 'Empleado',      activo: true  },
  { id: 32, tipo: 'CC',  documento: '1201234567',    nombre: 'María José Ramírez',             correo: 'maria.ramirez@gmail.com',        telefono: '3193456780', rol: 'Cliente',       activo: false },
  { id: 33, tipo: 'NIT', documento: '903333444-5',   nombre: 'Alimentos La Canasta Ltda.',     correo: 'ventas@lacanasta.co',            telefono: '6056789012', rol: 'Cliente',       activo: true  },
  { id: 34, tipo: 'CC',  documento: '1212345678',    nombre: 'Cristian Eduardo Pardo',         correo: 'cristian.pardo@gmail.com',       telefono: '3204567801', rol: 'Empleado',      activo: true  },
  { id: 35, tipo: 'CE',  documento: '1223456789',    nombre: 'Angie Lorena Castillo',          correo: 'angie.castillo@gmail.com',       telefono: '3215678902', rol: 'Cliente',       activo: true  },
  { id: 36, tipo: 'CC',  documento: '1234567890',    nombre: 'Diego Alejandro Suárez',         correo: 'diego.suarez@gmail.com',         telefono: '3226789013', rol: 'Administrador', activo: false },
  { id: 37, tipo: 'NIT', documento: '904444555-6',   nombre: 'Servicios Integrales S.A.S',     correo: 'contacto@serviciosint.co',       telefono: '6067890123', rol: 'Cliente',       activo: true  },
  { id: 38, tipo: 'CC',  documento: '1245678901',    nombre: 'Karen Julieth Navarro',          correo: 'karen.navarro@gmail.com',        telefono: '3237890124', rol: 'Empleado',      activo: true  },
  { id: 39, tipo: 'CE',  documento: '1256789012',    nombre: 'Brayan Stiven Martínez',         correo: 'brayan.martinez@hotmail.com',    telefono: '3248901235', rol: 'Cliente',       activo: false },
  { id: 40, tipo: 'CC',  documento: '1267890123',    nombre: 'Alejandra Rincón Soto',          correo: 'alejandra.rincon@gmail.com',     telefono: '3259012346', rol: 'Cliente',       activo: true  },
  { id: 41, tipo: 'NIT', documento: '905555666-7',   nombre: 'Comercializadora Central S.A.S', correo: 'info@centralcomercial.co',       telefono: '6078901234', rol: 'Cliente',       activo: true  },
  { id: 42, tipo: 'CC',  documento: '1278901234',    nombre: 'Juan Pablo Cárdenas',            correo: 'juan.cardenas@gmail.com',        telefono: '3260123457', rol: 'Empleado',      activo: true  },
  { id: 43, tipo: 'CE',  documento: '1289012345',    nombre: 'Melissa Andrea Quintero',        correo: 'melissa.quintero@gmail.com',     telefono: '3271234568', rol: 'Cliente',       activo: true  },
  { id: 44, tipo: 'CC',  documento: '1290123456',    nombre: 'Santiago Beltrán Gómez',         correo: 'santiago.beltran@gmail.com',     telefono: '3282345679', rol: 'Empleado',      activo: false },
  { id: 45, tipo: 'NIT', documento: '906666777-8',   nombre: 'Distribuidora El Progreso Ltda.', correo: 'ventas@elprogreso.co',         telefono: '6089012345', rol: 'Cliente',       activo: true  },
  { id: 46, tipo: 'CC',  documento: '1301234567',    nombre: 'Valeria Hernández Díaz',         correo: 'valeria.hernandez@gmail.com',    telefono: '3293456780', rol: 'Cliente',       activo: true  },
  { id: 47, tipo: 'CE',  documento: '1312345678',    nombre: 'Luis Fernando Aguilar',          correo: 'luis.aguilar@hotmail.com',       telefono: '3004567891', rol: 'Empleado',      activo: true  },
  { id: 48, tipo: 'CC',  documento: '1323456789',    nombre: 'Natalia Jiménez Ríos',           correo: 'natalia.jimenez@gmail.com',      telefono: '3015678902', rol: 'Cliente',       activo: false },
  { id: 49, tipo: 'NIT', documento: '907777888-9',   nombre: 'Tecnologías del Caribe S.A.S',   correo: 'contacto@teccaribe.co',          telefono: '6090123456', rol: 'Cliente',       activo: true  },
  { id: 50, tipo: 'CC',  documento: '1334567890',    nombre: 'Óscar Iván Medina',              correo: 'oscar.medina@gmail.com',         telefono: '3026789013', rol: 'Administrador', activo: true  },
];

const RECORDS_PER_PAGE = 13;

// ─── Users ────────────────────────────────────────────────────────────────────
function Users({ onDownload }) {
  const [data,        setData]        = useState(sampleData);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggle = (id) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, activo: !row.activo } : row));
  };

  const handleDelete = (row) => {
    console.log('Eliminar:', row);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filtered = data.filter((row) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      row.documento.toLowerCase().includes(term) ||
      row.nombre.toLowerCase().includes(term)    ||
      row.correo.toLowerCase().includes(term)    ||
      row.telefono.toLowerCase().includes(term)
    );
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* ── Barra superior ───────────────────────────────────────────────── */}
      <TopBar
        search={search}
        onSearchChange={handleSearchChange}
        onDownload={onDownload}
      />

      {/* ── Card contenedor Tabla + Paginador ────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        <UsersTable
          data={paginatedData}
          onToggle={handleToggle}
          onDelete={handleDelete}
          search={search}
        />

        <div className="border-t border-gray-400 bg-gray-50 px-4 py-0.5">
          <PaginatorUsers
            recordsPerPage={RECORDS_PER_PAGE}
            totalRecords={filtered.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Outlet />
    </div>
  );
}

export default Users;