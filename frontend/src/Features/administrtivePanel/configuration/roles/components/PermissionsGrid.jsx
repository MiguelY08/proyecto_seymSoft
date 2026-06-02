import { useEffect } from "react";

export default function PermissionsGrid({

  permisosSistema=[],
  permisosRol=[],
  onChange=()=>{},
  readOnly=false

}) {


// ─────────────────────────────
// CREAR ESTRUCTURA INICIAL
// ─────────────────────────────

useEffect(()=>{

if(!permisosSistema.length)
return;

if(permisosRol.length>0)
return;

const permisosIniciales=

permisosSistema.map(

(modulo)=>({

id:
modulo.id,

acciones:

modulo.acciones.reduce(

(acc,accion)=>{

acc[
accion.key
]=false;

return acc;

},

{}

)

})

);

onChange(
permisosIniciales
);

},[
permisosSistema
]);


// ─────────────────────────────
// TOGGLE ACCIÓN
// ─────────────────────────────

const toggleAccion=(

moduloId,
accionKey

)=>{

if(readOnly)
return;

const updated=

permisosRol.map(

(modulo)=>

modulo.id===moduloId

?{

...modulo,

acciones:{

...modulo.acciones,

[accionKey]:

!modulo.acciones[
accionKey
]

}

}

:

modulo

);

onChange(
updated
);

};


// ─────────────────────────────
// TOGGLE MÓDULO
// ─────────────────────────────

const toggleModuloCompleto=(

moduloId

)=>{

if(readOnly)
return;

const updated=

permisosRol.map(

(modulo)=>{

if(
modulo.id!==moduloId
){

return modulo;

}

const allSelected=

Object.values(
modulo.acciones
).every(Boolean);

const nuevasAcciones=

Object.keys(
modulo.acciones
).reduce(

(acc,key)=>{

acc[key]=
!allSelected;

return acc;

},

{}

);

return{

...modulo,

acciones:
nuevasAcciones

};

}

);

onChange(
updated
);

};


// ─────────────────────────────
// TOGGLE TODOS
// ─────────────────────────────

const toggleAllModules=()=>{

if(readOnly)
return;

const allSelected=

permisosRol.every(

(modulo)=>

Object.values(
modulo.acciones
).every(Boolean)

);

const updated=

permisosRol.map(

(modulo)=>{

const nuevasAcciones=

Object.keys(
modulo.acciones
).reduce(

(acc,key)=>{

acc[key]=
!allSelected;

return acc;

},

{}

);

return{

...modulo,

acciones:
nuevasAcciones

};

}

);

onChange(
updated
);

};


// ─────────────────────────────
// UI
// ─────────────────────────────

return(

<div>

{!readOnly&&(

<div className="flex justify-end mb-3">

<button
onClick={toggleAllModules}
className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
>

Seleccionar todos

</button>

</div>

)}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{

permisosSistema.map(

(modulo)=>{

const rolModulo=

permisosRol.find(

(p)=>

p.id===modulo.id

);

const hasPermission=

rolModulo&&

Object.values(

rolModulo.acciones

).some(Boolean);

const allChecked=

rolModulo&&

Object.values(

rolModulo.acciones

).every(Boolean);

return(

<div
key={modulo.id}
className={`border rounded-xl p-4 shadow-sm bg-white transition

${

hasPermission

?

"border-blue-500 ring-2 ring-blue-400"

:

"border-gray-400"

}

`}
>

<div className="flex justify-between items-center mb-3">

<h4 className="font-semibold text-sm">

{modulo.modulo}

</h4>

<input
type="checkbox"
checked={allChecked||false}
disabled={readOnly}
onChange={()=>toggleModuloCompleto(modulo.id)}
className={`accent-blue-600 ${
readOnly
?
"opacity-100 cursor-default"
:
"cursor-pointer"
}`}
/>

</div>


<div className="grid grid-cols-2 gap-3 text-sm">

{

modulo.acciones.map(

(accion)=>(

<label
key={accion.key}
className="flex items-center gap-2 cursor-pointer"
>

<input
type="checkbox"
checked={
rolModulo?.acciones?.[
accion.key
]
||
false
}
onChange={()=>

toggleAccion(

modulo.id,
accion.key

)

}
className={`accent-blue-600 ${

readOnly

?

"pointer-events-none"

:

"cursor-pointer"

}`}
/>

{accion.label}

</label>

)

)

}

</div>

</div>

);

}

)

}

</div>

</div>

);

}