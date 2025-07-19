// ✅ src/services/SuppliersService.js
import axios from 'axios'
const API = import.meta.env.VITE_API_URL

// ✅ Log the full API base
console.log('🔧 Using API URL:', API)

function logToken(token) {
  if (!token) {
    console.warn('⚠️ No token provided!')
    return
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('👤 Decoded JWT Payload:', payload)
  } catch (err) {
    console.warn('❌ Failed to decode JWT:', err)
  }
}

// ✅ Fetch all suppliers
export async function fetchSuppliers(token) {
  logToken(token)
  const url = `${API}/suppliers`
  console.log('📡 GET:', url)

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Fetched suppliers:', res.data)
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Failed to fetch suppliers:', err?.response?.data || err.message)
    return []
  }
}

// ✅ Add a new supplier
export async function addSupplier(data, token) {
  logToken(token)
  const url = `${API}/suppliers`
  console.log('📤 POST:', url, 'Payload:', data)

  try {
    const res = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Added supplier:', res.data)
    return res.data
  } catch (err) {
    console.error('❌ Failed to add supplier:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Update supplier
export async function updateSupplier(id, updatedData, token) {
  logToken(token)
  const url = `${API}/suppliers/${id}`
  console.log('✏️ PUT:', url, 'Payload:', updatedData)

  try {
    const res = await axios.put(url, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Updated supplier:', res.data)
    return res.data
  } catch (err) {
    console.error('❌ Failed to update supplier:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Delete supplier
export async function deleteSupplier(id, token) {
  logToken(token)
  const url = `${API}/suppliers/${id}`
  console.log('🗑️ DELETE:', url)

  try {
    const res = await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Deleted supplier:', res.data)
    return res.data
  } catch (err) {
    console.error('❌ Failed to delete supplier:', err?.response?.data || err.message)
    throw err
  }
}
