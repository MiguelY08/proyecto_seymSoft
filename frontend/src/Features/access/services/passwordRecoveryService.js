import UsersDB from "../../administrtivePanel/users/services/usersDB"
import { generateOTP } from "../helpers/generateOTP"
import { sendRecoveryEmail } from "../api/emailApi"


// ─── Clave de localStorage ────────────────────────────────────────────────────
const RECOVERY_KEY = "pm_password_recovery"


// ─── Solicitar restablecimiento de contraseña ───────────────────────────────────────
export const requestPasswordRecovery = async (email) => {

  const users = UsersDB.list()

  const user = users.find((u) => u.correo === email)

  if (!user) {
    throw new Error("No existe una cuenta con este correo")
  }

  if (!user.activo) {
    throw new Error("El usuario está inactivo")
  }

  const code = generateOTP()

  const recoveryData = {
    email,
    code,
    attempts: 0,
    expiresAt: Date.now() + 10 * 60 * 1000
  }

  localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData))

  await sendRecoveryEmail(email, code)

}

// ─── Verificar código de restablecimiento de contraseña ──────────────────────────────
export const verifyRecoveryCode = (code) => {

  const recovery = JSON.parse(localStorage.getItem("pm_password_recovery"))

  if (!recovery) {
    throw new Error("No hay solicitud activa")
  }

  if (Date.now() > recovery.expiresAt) {
    throw new Error("El código expiró")
  }

  if (recovery.attempts >= 5) {
    throw new Error("Demasiados intentos. Solicite un nuevo código.")
  }

  if (recovery.code !== code) {

    recovery.attempts += 1

    localStorage.setItem("pm_password_recovery", JSON.stringify(recovery))

    throw new Error(`Código incorrecto. Intentos restantes: ${5 - recovery.attempts}`)
  }

  return recovery.email
}
// cambiar contraseña
export const resetPassword = (email, newPassword) => {

  const users = UsersDB.list()

  const updatedUsers = users.map((user) => {

    if (user.correo === email) {
      return {
        ...user,
        password: newPassword
      }
    }

    return user
  })

  localStorage.setItem("pm_users", JSON.stringify(updatedUsers))

  localStorage.removeItem(RECOVERY_KEY)

}