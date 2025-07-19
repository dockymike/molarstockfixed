// ✅ ScanConsume.jsx – With deep logs for toast debugging and location name in toast

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
import { fetchInventoryOptions, consumeInventory } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'
import { useSnackbar } from 'notistack'
import { useLowStock } from '../../context/LowStockContext'


export default function ScanConsume({ open, onClose, onInventoryConsumed }) {
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

    const payload = {
      method: 'consume',
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

    console.log('📤 Submitting consume payload to backend:', payload)

    try {
      const result = await consumeInventory(payload, token)
      console.log('✅ Backend response received:', result)

      const toastMsg = `–${scannedQty}x ${item.name} consumed from "${location.name}"`
      console.log('📢 Showing toast:', toastMsg)

      enqueueSnackbar(toastMsg, { variant: 'info' })
      onInventoryConsumed?.()
      triggerLowStockRefresh()

    } catch (err) {
      const errMsg =
        `❌ ${err.response?.data?.error || 'Failed to consume'} ${item.name}`
      console.error('🔥 Error consuming inventory:', errMsg, err)
      enqueueSnackbar(errMsg, { variant: 'error' })
    } finally {
      setTimeout(() => {
        console.log('🔁 Resetting scan cooldown')
        isProcessingRef.current = false
      }, 200)
    }
  }

  const scannerActive = Boolean(open && location)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Consume Inventory</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <DropDownSelect
            label="Select Location"
            value={location?.id || ''}
            onChange={(val) =>
              setLocation(locationOptions.find((loc) => loc.id === Number(val)))
            }
            options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
          />

          <BarcodeScanner
            key={`consume-${location?.id || 'none'}`}
            active={scannerActive}
            locationId={Number(location?.id)}
            scanMode="fast"
            quantity={1}
            onChange={handleScan}
          />

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
