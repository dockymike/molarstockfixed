// src/services/AuthService.js
import api from './api'

export async function login({ email, password }) {
  const res = await api.post('/users/login', { email, password })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

export async function register({ email, password, practice_name }) {
  const res = await api.post('/users/register', { email, password, practice_name })
  return res.data
}
