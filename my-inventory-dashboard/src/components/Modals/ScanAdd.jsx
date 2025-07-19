// ✅ ScanAdd.jsx – With deep logs for toast debugging and location name in toast

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import DropDownSelect from '../Common/DropDownSelect'
import BarcodeScanner from '../Common/BarcodeScanner'
import { fetchInventoryOptions, addInventory } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'
import { useSnackbar } from 'notistack'

import { useLowStock } from '../../context/LowStockContext'


export default function ScanAdd({ open, onClose, onInventoryAdded }) {
  const [location, setLocation] = useState(null)
  const [supplyOptions, setSupplyOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])

  const isProcessingRef = useRef(false)
  const { user, token } = useUser()
  const { enqueueSnackbar } = useSnackbar()

  const { triggerLowStockRefresh } = useLowStock()


  useEffect(() => {
    if (open && user && token) {
      (async () => {
        try {
          const invOptions = await fetchInventoryOptions(token)
          const locs = await fetchLocations(user.id, token)
          setSupplyOptions(invOptions)
          setLocationOptions(locs)
        } catch (err) {
          console.error('❌ Failed to fetch dropdown data:', err)
        }
      })()
    }

    isProcessingRef.current = false
  }, [open, user, token])

const handleScan = async ({ item, quantity: scannedQty = 1 }) => {
  if (isProcessingRef.current) {
    console.log('⛔ Skipping scan — still processing...')
    return
  }

  console.log('🔔 Scan received:', item, 'Quantity:', scannedQty)
  isProcessingRef.current = true

  const matched = supplyOptions.find((opt) => opt.inventory_id === item.id)
  if (!matched || !location) {
    console.warn('⚠️ Match or location missing:', { matched, location })
    isProcessingRef.current = false
    return
  }

  // 🛑 Prevent duplicates by name (case-insensitive)
  const duplicateNameMatch = supplyOptions.find(
    (opt) => opt.name.toLowerCase() === item.name.toLowerCase()
  )

  if (duplicateNameMatch && duplicateNameMatch.inventory_id !== item.id) {
    const warning = `Item "${item.name}" already exists with different capitalization`
    console.warn('⚠️ Duplicate name conflict:', warning)
    enqueueSnackbar(warning, { variant: 'warning' })
    isProcessingRef.current = false
    return
  }

  const payload = {
    method: 'add',
    destination: 'direct',
    location: Number(location.id),
    entryType: 'scan',
    scanMode: 'fast',
    quantity: scannedQty,
    supplies: [
      {
        isNew: false,
        inventory_id: matched.inventory_id,
        quantity: scannedQty,
        location_id: Number(location.id),
      },
    ],
  }

  console.log('📤 Submitting payload to backend:', payload)

  try {
    const result = await addInventory(payload, token)
    console.log('✅ Backend response received:', result)

    const toastMsg = `+${scannedQty}x ${item.name} added to "${location.name}"`
    console.log('📢 Showing toast:', toastMsg)

    enqueueSnackbar(toastMsg, { variant: 'success' })
    onInventoryAdded?.()
    triggerLowStockRefresh() // ✅ refresh alerts
  } catch (err) {
    const errMsg = `❌ ${err.response?.data?.error || 'Failed to add'} ${item.name}`
    console.error('🔥 Error adding inventory:', errMsg, err)
    enqueueSnackbar(errMsg, { variant: 'error' })
  } finally {
    setTimeout(() => {
      console.log('🔁 Resetting scan cooldown')
      isProcessingRef.current = false
    }, 200)
  }
}


const handleNewItemAdded = async (item, scannedQty) => {
  const locationName = locationOptions.find((loc) => loc.id === Number(location?.id))?.name || 'Unknown'
  const toastMsg = `+${scannedQty}x ${item.name} added to "${locationName}"`
  console.log('📢 [NEW ITEM] Showing toast:', toastMsg)
  enqueueSnackbar(toastMsg, { variant: 'success' })
  onInventoryAdded?.()
  triggerLowStockRefresh() // ✅ refresh alerts

  // 🔁 REFRESH supply options so future scans work
  try {
    const updated = await fetchInventoryOptions(token)
    setSupplyOptions(updated)
  } catch (err) {
    console.error('❌ Failed to refresh supply options:', err)
  }
}


  const scannerActive = Boolean(open && location)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Scan Inventory</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {/* Location Selector */}
          <DropDownSelect
            label="Select Location"
            value={location?.id || ''}
            onChange={(val) =>
              setLocation(locationOptions.find((loc) => loc.id === Number(val)))
            }
            options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
          />

          {/* Barcode Scanner */}
          <BarcodeScanner
            key={`scan-${location?.id || 'none'}`}
            active={scannerActive}
            locationId={Number(location?.id)}
            scanMode="fast"
            quantity={1}
            onChange={handleScan}
            onNewItemAdded={handleNewItemAdded}
          />

          {/* Spinner */}
          {scannerActive && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Ready to scan…</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
