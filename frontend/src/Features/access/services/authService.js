import apiClient from "../../../setting/apiClient.js";
import {
  saveSession,
  clearSession,
  getSession,
} from "../helpers/authStorage.js";

/**
 * AUTH SERVICES
 *
 * Endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/logout
 * - GET /auth/me
 * - PUT /auth/profile
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 */

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════

export const register = async (userData) => {
  try {

    const response = await apiClient.post(
      "/auth/register",
      {
        full_name: userData.fullName,
        email: userData.email,
        pass_word: userData.password,
        phone: userData.phone,
      }
    );

    const {
      user,
      role,
      permissions,
      client,
      accessToken,
      refreshToken
    } = response.data.data;

    // guardar sesión

    saveSession({

      user,
      role: role || null,
      permissions: permissions || [],
      client: client || null,

      accessToken,

      refreshToken,

    });

    return {

      success: true,

      user,
      role: role || null,
      permissions: permissions || [],
      client: client || null,

      accessToken,

      refreshToken,

    };

  } catch (error) {

    console.error(
      "Error en register:",
      error
    );

    const errorMessage =

      error.response?.data?.message
      ||
      "Error al registrarse";

    return {

      success:false,

      error:errorMessage

    };

  }

};


// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════

export const login = async (
  email,
  password
) => {

  try {

    const response = await apiClient.post(

      "/auth/login",

      {

        email,

        pass_word: password,

      }

    );

   const {
  user,
  role,
  permissions,
  accessToken,
  refreshToken,
  client,
} = response.data.data;

console.log("LOGIN RESPONSE:");
console.log("user:", user);
console.log("role:", role);
console.log("permissions:", permissions);

saveSession({
  user,
  role,
  permissions,
  accessToken,
  refreshToken,
  client
});

console.log("SESSION SAVED:", getSession());

return {
  success:true,
  user,
  role,
  permissions,
  accessToken,
  refreshToken,
  client,
  redirectTo: role ? "/admin" : "/"
};

  } catch(error){

    console.error(
      "Error en login:",
      error
    );

    const errorMessage=

      error.response?.data?.message
      ||
      "Email o contraseña incorrectos";

    return{

      success:false,

      error:errorMessage

    };

  }

};


// ═══════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════

export const logout = async()=>{

  try{

    const session=
      getSession();

    if(
      session?.refreshToken
    ){

      await apiClient.post(

        "/auth/logout",

        {

          refresh_token:
          session.refreshToken

        }

      );

    }

  }
  catch(error){

    console.error(

      "Error en logout:",
      error

    );

  }

  finally{

    clearSession();

    return{

      success:true

    };

  }

};


// ═══════════════════════════════════════════════════════════
// PERFIL
// ═══════════════════════════════════════════════════════════

export const getProfile = async()=>{

  try{

    const response=

      await apiClient.get(
        "/auth/me"
      );

    const{

      user,
      role,
      permissions,
      client

    }=response.data.data;

    return{

      success:true,

      user,

      role,

      permissions,

      client

    };

  }
  catch(error){

    console.error(
      "Error en getProfile:",
      error
    );

    if(

      error.response?.status
      ===401

    ){

      clearSession();

    }

    return{

      success:false,

      error:
      "Error al obtener perfil"

    };

  }

};


// ═══════════════════════════════════════════════════════════
// ACTUALIZAR PERFIL
// ═══════════════════════════════════════════════════════════

export const updateProfile = async(
  changes
)=>{

  try{

    const body={};

    if(

      changes.fullName!==undefined

    ){

      body.full_name=
      changes.fullName;

    }

    if(

      changes.email!==undefined

    ){

      body.email=
      changes.email;

    }

    if(

      changes.phone!==undefined

    ){

      body.phone=
      changes.phone;

    }

    if(

      changes.currentPassword!==undefined

    ){

      body.current_password=
      changes.currentPassword;

    }

    if(

      changes.newPassword!==undefined

    ){

      body.pass_word=
      changes.newPassword;

    }

    if(

      changes.confirmPassword!==undefined

    ){

      body.confirm_password=
      changes.confirmPassword;

    }

    const response=

      await apiClient.put(

        "/auth/profile",

        body

      );

    const{

      user,
      role,
      permissions,
      client,

    }=response.data.data;


    const currentSession=
      getSession();


    saveSession({

      ...currentSession,

      user,

      role,

      permissions,

      client: client ?? currentSession?.client ?? null,


    });


    return{

      success:true,

      user,

      role,

      permissions,

      client: client ?? currentSession?.client ?? null

    };

  }

  catch(error){

    console.error(
      "Error updateProfile:",
      error
    );

    return{

      success:false,

      error:

      error.response?.data?.message

      ||

      "Error al actualizar perfil"

    };

  }

};


// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════

export const forgotPassword = async(
  email
)=>{

  try{

    const response=

      await apiClient.post(

        "/auth/forgot-password",

        {

          email

        }

      );

    return{

      success:true,

      message:
      response.data.message

    };

  }

  catch(error){

    return{

      success:false,

      error:

      error.response?.data?.message

      ||

      "Error al solicitar reset"

    };

  }

};


// ═══════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════

export const resetPassword = async(
  token,
  newPassword
)=>{

  try{

    const response=

      await apiClient.post(

        "/auth/reset-password",

        {

          token,

          new_password:
          newPassword,

          confirm_password:
          newPassword

        }

      );

    return{

      success:true,

      message:
      response.data.message

    };

  }

  catch(error){

    return{

      success:false,

      error:

      error.response?.data?.message

      ||

      "Error al resetear contraseña"

    };

  }

};


// ═══════════════════════════════════════════════════════════
// GOOGLE LOGIN
// ═══════════════════════════════════════════════════════════

export const googleLogin=(

  accessToken,
  refreshToken

)=>{

  try{

    saveSession({

      accessToken,

      refreshToken

    });

    return{

      success:true

    };

  }

  catch(error){

    return{

      success:false,

      error:
      "Error Google Login"

    };

  }

};
