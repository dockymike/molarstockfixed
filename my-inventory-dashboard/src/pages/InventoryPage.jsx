
// src/pages/InventoryPage.jsx
// src/pages/InventoryPage.jsx
import {
  Box,
  Typography,
  Stack,
  Button,
  useTheme,
  Chip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AddInventoryButton from '../components/Common/AddInventoryButton'
import ExportButton from '../components/Common/ExportButton'
import SearchBar from '../components/Common/SearchBar'
import FilterDialog from '../components/Common/FilterDialog'
import Pagination from '../components/Common/Pagination'
import InventoryTable from '../components/InventoryTable/InventoryTable'
import ConsumeInventoryButton from '../components/Common/ConsumeInventoryButton'
import ConsumeModal from '../components/Modals/ConsumeModal'
import AddInventoryModal from '../components/Modals/AddInventoryModal'
import { fetchLocations } from '../services/LocationService'

import { useLowStock } from '../context/LowStockContext'

import { useUser } from '../context/UserContext'



export default function InventoryPage() {
  const theme = useTheme()
  const { token } = useUser()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 })
  const [filters, setFilters] = useState({ sortBy: '' })
  const [totalRows, setTotalRows] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [locations, setLocations] = useState([])

  const { triggerLowStockRefresh } = useLowStock()


  useEffect(() => {
    const loadLocations = async () => {
      if (!token) return
      try {
        const data = await fetchLocations(token)
        setLocations(data)
        console.log('📍 Available Locations:', data)
      } catch (error) {
        console.error('❌ Error fetching locations:', error)
      }
    }

    loadLocations()
  }, [token])

  useEffect(() => {
    console.log('🔄 Pagination updated:', pagination)
  }, [pagination])

  useEffect(() => {
    console.log('🔍 Search term updated:', searchTerm)
  }, [searchTerm])

  useEffect(() => {
    console.log('📂 Filters updated:', filters)
  }, [filters])

  const handleExportClick = () => alert('Export Clicked')

  const handleFilterApply = (data) => {
    console.log('✅ Filter applied from dialog:', data)
    setFilters(data)
  }

  const handleInventoryAdded = () => {
    setRefreshKey((prev) => prev + 1)
    triggerLowStockRefresh() // ✅ trigger low stock alert update
  }

  const clearLocation = (loc) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== loc),
    }))
  }

  const showClearAll =
    searchTerm || filters.category || (filters.locations && filters.locations.length > 0 && !filters.locations.includes('all'))

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: 0, mx: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Inventory
        </Typography>
        <Stack direction="row" spacing={2}>
          <AddInventoryButton onClick={() => setIsAddModalOpen(true)} />
          <ConsumeInventoryButton onClick={() => setIsConsumeOpen(true)} />
        </Stack>
      </Box>

      {/* Search + Filter Left, Export Right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} flex="1">
          <SearchBar onChange={(val) => setSearchTerm(val)} />
          <Button
            variant="outlined"
            onClick={() => setIsFilterOpen(true)}
            sx={{ height: 40 }}
          >
            Filter
          </Button>
        </Stack>

        <Box>
          <ExportButton onClick={handleExportClick} />
        </Box>
      </Box>

      {/* Active Filter Summary */}
      {showClearAll && (
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {searchTerm && (
            <Chip
              label={`Search: "${searchTerm}"`}
              onDelete={() => setSearchTerm('')}
              variant="outlined"
            />
          )}
          {filters.category && (
            <Chip
              label={`Category: ${filters.category}`}
              onDelete={() =>
                setFilters((prev) => ({ ...prev, category: undefined }))
              }
              variant="outlined"
            />
          )}
          {filters.locations &&
            filters.locations.length > 0 &&
            !filters.locations.includes('all') &&
            filters.locations.map((loc) => (
              <Chip
                key={loc}
                label={`Location: ${loc}`}
                onDelete={() => clearLocation(loc)}
                variant="outlined"
              />
            ))}
          <Button
            size="small"
            onClick={() => {
              setSearchTerm('')
              setFilters({ sortBy: '' })
            }}
          >
            Clear All
          </Button>
        </Stack>
      )}

      {/* Inventory Table */}
      <InventoryTable
        search={searchTerm}
        filters={filters}
        pagination={pagination}
        setTotalCount={setTotalRows}
        refreshKey={refreshKey}
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        count={totalRows}
        onChangePage={(page) => {
          console.log('📃 Page changed to:', page)
          setPagination((prev) => ({ ...prev, page }))
        }}
        onChangeRowsPerPage={(rowsPerPage) => {
          console.log('📏 Rows per page changed to:', rowsPerPage)
          setPagination((prev) => ({ ...prev, rowsPerPage, page: 0 }))
        }}
      />

      {/* Filter Modal */}
      <FilterDialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        availableLocations={locations}
      />

      {/* Add Inventory Modal */}
      <AddInventoryModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onInventoryAdded={handleInventoryAdded}
      />

      {/* Consume Inventory Modal */}
      <ConsumeModal
        open={isConsumeOpen}
        onClose={() => setIsConsumeOpen(false)}
        onInventoryConsumed={() => {
          setIsConsumeOpen(false)
          setRefreshKey((prev) => prev + 1)
          triggerLowStockRefresh() // ✅ trigger low stock alert update
        }}
      />
    </Box>
  )
}
