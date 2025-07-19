// ✅ ManualConsume.jsx – modal for manual inventory consumption with auto-refresh

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import DropDownSelect from '../Common/DropDownSelect'
import CounterInput from '../Common/CounterInput'
import { consumeInventory, fetchInventoryOptions } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'

import { useLowStock } from '../../context/LowStockContext'


export default function ManualConsume({ open, onClose, onInventoryConsumed }) {
  const [location, setLocation] = useState('')
  const [supplyOptions, setSupplyOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [selectedSupplies, setSelectedSupplies] = useState([])

  const { user, token } = useUser()

  const { triggerLowStockRefresh } = useLowStock()


  useEffect(() => {
    if (open && user && token) {
      const load = async () => {
        const invOptions = await fetchInventoryOptions(token)
        const locs = await fetchLocations(user.id, token)
        setSupplyOptions(invOptions)
        setLocationOptions(locs)
      }
      load()
    }
  }, [open, user, token])

  const handleSubmit = async () => {
    if (!location || selectedSupplies.length === 0) return

    const payload = {
      method: 'consume',
      location,
      entryType: 'manual',
      supplies: selectedSupplies.map((s) => ({
        inventory_id: s.supply.inventory_id,
        quantity: s.quantity,
        location_id: location,
      })),
    }

    try {
      await consumeInventory(payload, token)
      onInventoryConsumed?.()
      triggerLowStockRefresh() // ✅ Trigger inventory table refresh
      handleClose()           // ✅ Only close after success
    } catch (err) {
      console.error('❌ Manual consume failed:', err)
    }
  }

  const handleClose = () => {
    setSelectedSupplies([])
    setLocation('')
    onClose()
  }

  const filteredSupplyOptions = supplyOptions.filter(
    (supply) =>
      !selectedSupplies.some((s) => s.supply?.inventory_id === supply.inventory_id)
  )

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Manual Consumption</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <DropDownSelect
            label="Select Location"
            value={location}
            onChange={setLocation}
            options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
          />
          <Typography fontWeight={600}>Search Items</Typography>
          <Autocomplete
            options={filteredSupplyOptions}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => {
              if (!value) return
              setSelectedSupplies((prev) => [...prev, { supply: value, quantity: 1 }])
            }}
            renderInput={(params) => <TextField {...params} label="Search Items" fullWidth />}
            clearOnBlur
            selectOnFocus
          />
          {selectedSupplies.map((item, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography sx={{ flex: 1 }}>{item.supply?.name}</Typography>
              <CounterInput
                value={item.quantity}
                setValue={(val) => {
                  const updated = [...selectedSupplies]
                  updated[i].quantity = val
                  setSelectedSupplies(updated)
                }}
              />
              <Button
                color="error"
                onClick={() => setSelectedSupplies((prev) => prev.filter((_, idx) => idx !== i))}
              >
                x
              </Button>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!location || selectedSupplies.length === 0}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
