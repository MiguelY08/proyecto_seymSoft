

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Spinner from "../../../../shared/spinner/Spinner";

import PermissionsGrid from "./PermissionsGrid";

import { validateRole } from "../validators/rolesValidators";

import { useAlert } from "../../../../shared/alerts/useAlert";

import {
  getPermissions
} from "../services/rolesServices";

export default function RoleModal({

  isOpen,
  onClose,
  onSave,
  roleData,
  mode = "create"

}) {

  const {

    showSuccess,
    showWarning

  } = useAlert();

  const isView =
    mode === "view";

  const today =
    new Date().toLocaleDateString();

  const [nombre,setNombre] =
    useState("");

  const [descripcion,setDescripcion] =
    useState("");

  const [permisosSistema,setPermisosSistema] =
    useState([]);

  const [permisosRol,setPermisosRol] =
    useState([]);

  const [errors,setErrors] =
    useState({});

  const [loadingPermissions,setLoadingPermissions] =
    useState(false);

  // ─────────────────────────────
  // CARGAR MÓDULOS Y PRIVILEGIOS
  // ─────────────────────────────

  useEffect(()=>{

    const loadPermissions =
    async()=>{

      try{

        setLoadingPermissions(true);

        const data =
          await getPermissions();

        setPermisosSistema(
          Array.isArray(data)
          ? data
          : []
        );

      }catch(error){

        console.error(
          "Error cargando permisos:",
          error
        );

        setPermisosSistema([]);

      }finally{

        setLoadingPermissions(false);

      }

    };

    if(isOpen){

      loadPermissions();

    }

  },[isOpen]);



// ─────────────────────────────
// INICIALIZAR FORMULARIO
// ─────────────────────────────

useEffect(() => {

  if (!isOpen) return;

  if (!permisosSistema.length) return;

  // ✅ LIMPIAR SIEMPRE PRIMERO
  setNombre("");
  setDescripcion("");
  setPermisosRol([]);
  setErrors({});

  // ─────────────────────────
  // CREAR
  // ─────────────────────────

  if (mode === "create") {

    const permisosIniciales =

      permisosSistema.map((modulo) => {

        const accionesIniciales = {};

        modulo.acciones.forEach((accion) => {

          accionesIniciales[
            accion.key
          ] = false;

        });

        return {

          id:
            modulo.id,

          selectedActions:
            accionesIniciales

        };

      });

    setPermisosRol(
      permisosIniciales
    );

    return;

  }

  // ─────────────────────────
  // EDITAR / VER
  // ─────────────────────────

  if (
    (mode === "edit" || mode === "view")
    &&
    roleData
  ) {

    setNombre(
      roleData.name || ""
    );

    setDescripcion(
      roleData.description || ""
    );

    const permisosMapeados =

      permisosSistema.map((modulo) => {

        // ✅ INICIALIZAR TODO FALSE
        const accionesIniciales = {};

        modulo.acciones.forEach((accion) => {

          accionesIniciales[
            accion.key
          ] = false;

        });

        // ✅ MARCAR SOLO LOS DEL ROL
        (
          roleData.permisos || []

        ).forEach((permiso) => {

          if (

            permiso.id_module ===
            modulo.id

          ) {

            const accionEncontrada =

              modulo.acciones.find(

                (acc) =>

                  acc.id_privilege ===
                  permiso.id_privilege

              );

            if (accionEncontrada) {

              accionesIniciales[
                accionEncontrada.key
              ] = true;

            }

          }

        });

        return {

          id:
            modulo.id,

          selectedActions:
            accionesIniciales

        };

      });

    setPermisosRol(
      permisosMapeados
    );

  }

}, [

  isOpen,
  mode,
  roleData,
  permisosSistema

]);



  if(!isOpen)
  return null;

  // ─────────────────────────────
  // INPUTS
  // ─────────────────────────────

  const handleNombreChange =
  (value)=>{

    setNombre(value);

    const validation =
      validateRole({

        name:
          value,

        description:
          descripcion,

        permissions:
          permisosRol

      });

    setErrors((prev)=>({

      ...prev,

      name:
        validation.name || ""

    }));

  };

  const handleDescripcionChange =
  (value)=>{

    setDescripcion(value);

    const validation =
      validateRole({

        name:
          nombre,

        description:
          value,

        permissions:
          permisosRol

      });

    setErrors((prev)=>({

      ...prev,

      description:
        validation.description || ""

    }));

  };

  const handlePermissionsChange =
  (permisos)=>{

    setPermisosRol(
      permisos
    );

    const validation =
      validateRole({

        name:
          nombre,

        description:
          descripcion,

        permissions:
          permisos

      });

    setErrors((prev)=>({

      ...prev,

      permissions:
        validation.permissions || ""

    }));

  };

  // ─────────────────────────────
  // SUBMIT
  // ─────────────────────────────

  const handleSubmit = async () => {

    if (isView)
      return;

    const validationErrors =
      validateRole({

        name:
          nombre,

        description:
          descripcion,

        permissions:
          permisosRol

      });

    if (

      Object.keys(
        validationErrors
      ).length > 0

    ) {

      setErrors(
        validationErrors
      );

      showWarning(

        "Campos incompletos",

        "Revisa la información del rol"

      );

      return;

    }

    const payload = {

      id:
        roleData?.id,

      name:
        nombre.trim(),

      description:
        descripcion.trim(),

      active:
        roleData?.active ?? true,

      createdAt:
        roleData?.createdAt || today,

      permisos:
        permisosRol

    };

    try {

      const response =
        await onSave(
          payload
        );

      if(response?.success){

        if(mode === "create"){

          showSuccess(

            "Rol creado",

            "El rol fue registrado correctamente"

          );

        }

        if(mode === "edit"){

          showSuccess(

            "Rol actualizado",

            "Los cambios del rol fueron guardados"

          );

        }

        // ✅ LIMPIAR
        setNombre("");
        setDescripcion("");
        setPermisosRol([]);
        setErrors({});

        onClose();

      }

    } catch (error) {

      console.error(
        "Error guardando rol:",
        error
      );

      showWarning(

        "Error",

        error?.response?.data?.message ||

        "Hubo un problema al guardar el rol"

      );

    }

  };

  return(

<div className="fixed inset-0 z-50 flex items-center justify-center p-4">

<div
className="absolute inset-0 bg-black/40 backdrop-blur-sm"
onClick={onClose}
/>

<div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col font-lexend z-10">

<div className="bg-[#0E5676] text-white px-6 py-4 flex justify-between items-center rounded-t-xl">

<h2 className="text-lg font-semibold">

{mode==="create" && "Crear Rol"}
{mode==="edit" && "Editar Rol"}
{mode==="view" && "Ver Rol"}

</h2>

<button onClick={onClose}>

<X size={22} />

</button>

</div>

<div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div>

<label className="text-sm font-medium">

Nombre del Rol

</label>

<input
value={nombre}
disabled={isView}
onChange={(e)=>
handleNombreChange(
e.target.value
)
}
className="w-full mt-2 border border-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-blue-600"
/>

{errors.name && (

<p className="text-red-500 text-xs mt-1">

{errors.name}

</p>

)}

</div>

<div>

<label className="text-sm font-medium">

Fecha de Creación

</label>

<input
value={roleData?.createdAt || today}
disabled
className="w-full mt-2 bg-gray-200 rounded-lg px-4 py-2 text-sm"
/>

</div>

<div className="md:col-span-2">

<label className="text-sm font-medium">

Descripción

</label>

<textarea
rows="4"
value={descripcion}
disabled={isView}
onChange={(e)=>
handleDescripcionChange(
e.target.value
)
}
className="w-full mt-2 border border-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-blue-600"
/>

{errors.description && (

<p className="text-red-500 text-xs mt-1">

{errors.description}

</p>

)}

</div>

</div>

<div>

<h3 className="text-sm font-semibold mb-4">

Permisos y Privilegios

</h3>

{
  loadingPermissions

  ?

  <Spinner
    message="Cargando permisos..."
    className="min-h-[250px]"
  />

  :

  <PermissionsGrid

    permisosSistema={permisosSistema}

    permisosRol={permisosRol}

    onChange={handlePermissionsChange}

    readOnly={isView}

  />

}

{errors.permissions && (

<p className="text-red-500 text-xs mt-2">

{errors.permissions}

</p>

)}

</div>

</div>

{mode !== "view" && (

<div className="px-6 py-4 flex justify-between gap-4">

<button
onClick={onClose}
className="w-1/3 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
>

Cancelar

</button>

<button
onClick={handleSubmit}
className="w-1/3 bg-[#004D77] text-white py-2 rounded-lg hover:bg-[#003b5c] transition"
>

Guardar

</button>

</div>

)}

</div>

</div>

);

}
