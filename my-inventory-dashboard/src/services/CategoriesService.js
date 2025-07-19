import axios from 'axios'
const API = import.meta.env.VITE_API_URL

// ✅ Fetch categories (userId pulled from JWT on backend)
export async function fetchCategories(token) {
  try {
    const res = await axios.get(`${API}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Failed to fetch categories:', err)
    return []
  }
}

// ✅ Create category (userId added on backend via token)
export async function createCategory(data, token) {
  try {
    const res = await axios.post(`${API}/categories`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error('❌ Failed to create category:', err)
    throw err
  }
}

// ✅ Update category by ID
export async function updateCategory(id, data, token) {
  try {
    const res = await axios.put(`${API}/categories/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error(`❌ Failed to update category ${id}:`, err)
    throw err
  }
}

// ✅ Delete category by ID
export async function deleteCategory(id, token) {
  try {
    const res = await axios.delete(`${API}/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error(`❌ Failed to delete category ${id}:`, err)
    throw err
  }
}
