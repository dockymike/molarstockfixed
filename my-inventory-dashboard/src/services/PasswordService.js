// ✅ src/services/passwordService.js
import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function requestPasswordReset(email) {
  const payload = { email }
  const config = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
  }
  return axios.post(`${API}/password/request-reset`, payload, config)
}

// ✅ Add this missing function ⬇️
export async function resetPassword(token, newPassword) {
  const payload = { token, newPassword }
  const config = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
  }
  return axios.post(`${API}/password/reset-password`, payload, config)
}
