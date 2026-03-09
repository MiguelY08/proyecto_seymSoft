const SESSION_KEY = "session";

// Guardar sesión
export const saveSession = (sessionData) => {

  if(!sessionData){
    console.error("Intentando guardar sesión vacía");
    return;
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(sessionData)
  );

};

// Obtener sesión
export const getSession = () => {

  try{

    const session = localStorage.getItem(SESSION_KEY);

    return session ? JSON.parse(session) : null;

  }catch(error){

    console.error("Error leyendo sesión:",error);

    localStorage.removeItem(SESSION_KEY);

    return null;

  }

};

// Limpiar sesión
export const clearSession = () => {

  localStorage.removeItem(SESSION_KEY);
}