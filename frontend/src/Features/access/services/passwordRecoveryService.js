import UsersDB from "../../administrtivePanel/users/services/usersDB"
import { generateOTP } from "../helpers/generateOTP"
import { sendRecoveryEmail } from "../api/emailApi"

const RECOVERY_KEY = "pm_password_recovery"

// ─── Solicitar restablecimiento ──────────────────────────────────────────────
export const requestPasswordRecovery = async (email) => {

  const users = UsersDB.list()

  const user = users.find((u) => u.email === email)  // ← correo → email

  if (!user) {
    throw new Error("No existe una cuenta con este correo")
  }

  if (!user.active) {                                 // ← activo → active
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

// ─── Verificar código ────────────────────────────────────────────────────────
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

// ─── Cambiar contraseña ──────────────────────────────────────────────────────
export const resetPassword = (email, newPassword) => {

  const users = UsersDB.list()

  const updatedUsers = users.map((user) => {
    if (user.email === email) {               
      return { ...user, password: newPassword }
    }
    return user
  })

  localStorage.setItem("users", JSON.stringify(updatedUsers))  

  localStorage.removeItem(RECOVERY_KEY)

}