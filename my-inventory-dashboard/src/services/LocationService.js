// ✅ src/services/LocationService.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export const fetchLocations = async (token) => {
  const res = await axios.get(`${BASE_URL}/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return Array.isArray(res.data) ? res.data : []
}

export const addLocation = async (name, token) => {
  const res = await axios.post(
    `${BASE_URL}/locations`,
    { name },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export const updateLocation = async (id, data, token) => {
  const res = await axios.put(
    `${BASE_URL}/locations/${id}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data
}

export const deleteLocation = async (id, token) => {
  const res = await axios.delete(`${BASE_URL}/locations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
