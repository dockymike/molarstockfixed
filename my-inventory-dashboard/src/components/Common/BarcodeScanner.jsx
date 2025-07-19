// ✅ BarcodeScanner.jsx – single-scan output, no stacking, and onNewItemAdded support

import {
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { lookupBarcode, addItemByBarcode } from '../../services/BarcodeService'
import { useUser } from '../../context/UserContext'

export default function BarcodeScanner({
  active,
  locationId,
  scanMode,
  quantity = 1,
  onChange,
  onNewItemAdded,        // ✅ new optional callback
}) {
  const [buffer, setBuffer] = useState('')
  const [notFoundBarcode, setNotFoundBarcode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [scannedItems, setScannedItems] = useState([])

  const timeoutRef = useRef(null)
  const { token } = useUser()
  const [scannerActive, setScannerActive] = useState(active)

  useEffect(() => setScannerActive(active), [active])

  /* ───────── key listener ───────── */
  useEffect(() => {
    if (!scannerActive) return
    console.log('🔍 BarcodeScanner listening. Active:', scannerActive)

    const handleKeyPress = (e) => {
      const key = e.key
      if (key === 'Enter') {
        const trimmed = buffer.trim()
        if (trimmed.length) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          processBarcode(trimmed)
          setBuffer('')
        }
        return
      }
      if (key.length !== 1) return

      setBuffer((prev) => {
        const next = prev + key
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          const trimmed = next.trim()
          if (trimmed.length) processBarcode(trimmed)
          setBuffer('')
        }, 300)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [scannerActive, buffer])

  /* ───────── process scanned barcode ───────── */
  const processBarcode = async (barcode) => {
    console.log('📦 Processing barcode:', barcode)
    if (!barcode) return
    try {
      const item = await lookupBarcode(barcode, token)
      console.log('✅ Found item:', item)

      const updated = [...scannedItems, { inventory_id: item.id, quantity, item }]
      setScannedItems(updated)
      onChange?.({ item, quantity })          // send current scan up
    } catch (err) {
      console.error('❌ Barcode lookup failed:', err)
      setNotFoundBarcode(barcode)
      setNewItemName('')
      setScannerActive(false)                 // pause scanner while dialog open
    }
  }

  /* ───────── add new item flow ───────── */
  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return
    try {
      const result = await addItemByBarcode({
        barcode: notFoundBarcode,
        name: newItemName.trim(),
        quantity,
        location: locationId,
        token,
      })
      console.log('✅ New item added via barcode:', result)

      setScannedItems((prev) => [...prev, { inventory_id: result.id, quantity, item: result }])
      onChange?.({ item: result, quantity })
      onNewItemAdded?.(result, quantity)      // ✅ notify parent
    } catch (err) {
      console.error('❌ Failed to add new item:', err)
    }

    // reset dialog & resume scanner
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
  }

  const handleCancelNotFound = () => {
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
  }

  /* ───────── render ───────── */
  return (
    <Dialog open={!!notFoundBarcode} onClose={handleCancelNotFound} maxWidth="xs" fullWidth>
      <DialogTitle>Barcode Not Found</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Barcode <strong>{notFoundBarcode}</strong> was not found. Enter a name to add this new item:
        </Typography>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            fullWidth
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelNotFound}>Cancel</Button>
        <Button onClick={handleAddNewItem} variant="contained">
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  )
}
