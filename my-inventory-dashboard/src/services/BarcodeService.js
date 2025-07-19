// ✅ src/services/BarcodeService.js

import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// ✅ Lookup barcode
export async function lookupBarcode(barcode, token) {
  try {
    const response = await axios.get(`${API}/barcode/lookup/${barcode}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    return response.data
  } catch (err) {
    console.error('❌ Barcode lookup failed:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Add new item by barcode
export async function addItemByBarcode({ barcode, name, quantity, location, token }) {
  try {
    const payload = {
      method: 'add',
      location,
      entryType: 'scan',
      scanMode: 'single',
      quantity,
      supplies: [
        {
          isNew: true,
          name,
          quantity,
          barcode,
          location_id: location,
        },
      ],
    }

    const response = await axios.post(`${API}/inventory/add`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response && response.data) {
      return response.data
    } else {
      throw new Error('Empty response from server')
    }
  } catch (err) {
    console.error('❌ Failed to add item by barcode:', err?.response?.data || err.message)
    throw err
  }
}
