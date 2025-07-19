// src/components/Common/DropDownSelect.jsx
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

export default function DropDownSelect({ label = 'Select Option', value, onChange, options = [], fullWidth = true, sx = {} }) {
  return (
    <FormControl fullWidth={fullWidth} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.id || option} value={option.id || option}>
            {option.name || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}