// ✅ src/services/InventoryService.js

import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// ✅ Fetch all inventory items with optional filters
export async function fetchInventory({ token, search = '', filters = {}, pagination = {} }) {
  try {
    const query = new URLSearchParams()

    if (search) query.append('search', search)

    if (pagination.page != null) query.append('page', pagination.page)
    if (pagination.rowsPerPage != null) query.append('limit', pagination.rowsPerPage)

    if (filters?.category) {
      query.append('category', filters.category)
    }

    if (filters?.locations && filters.locations.length > 0 && !filters.locations.includes('all')) {
      query.append('locations', filters.locations.join(','))
    }

    const response = await axios.get(`${API}/inventory?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // ✅ Log full response data for debugging
    console.log('📥 Fetched inventory from backend:', response.data)

    return response.data
  } catch (err) {
    console.error('❌ Failed to fetch inventory:', err?.response?.data || err.message)
    throw err
  }
}


// ✅ Add Inventory Entry (includes location info)
export async function addInventory(data, token) {
  console.log('📤 Sending inventory payload to backend (Add):', data)

  try {
    const response = await axios.post(`${API}/inventory/add`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Inventory added successfully:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Inventory add error:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Update inventory for a specific location
export async function updateInventory(id, data, token) {
  const locationId = data.location_id

  if (!locationId) {
    console.error('❌ Missing location_id in update payload:', data)
    throw new Error('Location ID is required to update inventory')
  }

  console.log(`📤 Updating inventory ID ${id} at location ${locationId} with payload:`, data)

  try {
    const response = await axios.put(`${API}/inventory/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Inventory updated successfully:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Error updating inventory:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Delete inventory for ONE location
export async function deleteInventory(inventoryId, locationId, token) {
  if (!inventoryId || !locationId) {
    throw new Error('deleteInventory needs both inventoryId and locationId')
  }

  try {
    const response = await axios.delete(
      `${API}/inventory/${inventoryId}/location/${locationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    return response.data            // { message: 'Item deleted from location successfully' }
  } catch (err) {
    console.error('❌ Error deleting inventory from location:', err?.response?.data || err.message)
    throw err
  }
}


// Fetching intentory options without location data for search
export async function fetchInventoryOptions(token) {
  try {
    const response = await axios.get(`${API}/inventory/options`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('📥 Inventory search options:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Failed to fetch search options:', err?.response?.data || err.message)
    throw err
  }
}


// ✅ Transfer inventory between locations
export async function transferInventory(data, token) {
  console.log('📤 Transfer payload:', data)

  try {
    const response = await axios.post(`${API}/inventory/transfer`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Inventory transferred successfully:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Error transferring inventory:', err?.response?.data || err.message)
    throw err
  }
}


// ✅ Consume inventory from a location
export async function consumeInventory(data, token) {
  console.log('📤 Sending inventory payload to backend (Consume):', data)

  try {
    const response = await axios.post(`${API}/inventory/consume`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Inventory consumed successfully:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Inventory consume error:', err?.response?.data || err.message)
    throw err
  }
}



