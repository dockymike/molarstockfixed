// src/services/UserService.js
import api from './api'

export const updateDarkModePreference = async (userId, dark_mode) => {
  try {
    await api.patch('/users/dark-mode', { dark_mode })
    console.log('🌙 Dark mode preference saved:', dark_mode)
  } catch (err) {
    console.error('❌ Failed to update dark mode preference:', err)
  }
}
