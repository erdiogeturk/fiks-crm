import { useState, useMemo } from 'react'
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'

const STATUS_OPTIONS = ['Aktif', 'Pasif']

const statusChip = (status) => (
  <Chip
    label={status}
    size="small"
    sx={{
      bgcolor: status === 'Aktif' ? '#ecfdf5' : '#f8fafc',
      color: status === 'Aktif' ? '#059669' : '#64748b',
      fontWeight: 600,
      fontSize: 11,
      border: `1px solid ${status === 'Aktif' ? '#a7f3d0' : '#e2e8f0'}`,
    }}
  />
)

/**
 * Generic maintenance table page.
 *
 * props.config = {
 *   title: string,
 *   columns: [{ field, label, render? }],
 *   formFields: [{ field, label, required, type:'text'|'select', options?, selectComponent? }],
 *   defaultValues: object,
 *   hooks: { list, create, update, remove }  ← from useLookup
 * }
 */
const LookupTablePage = ({ config }) => {
  const { title, columns, formFields, defaultValues, hooks } = config
  const { list, create, update, remove } = hooks()

  const [search, setSearch]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem]   = useState(null)       // null = create mode
  const [form, setForm]           = useState(defaultValues)
  const [deleteId, setDeleteId]   = useState(null)

  const filtered = useMemo(() => {
    const rows = list.data || []
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      columns.some(col => {
        const val = r[col.field]
        return val && String(val).toLowerCase().includes(q)
      })
    )
  }, [list.data, search, columns])

  const openCreate = () => {
    setEditItem(null)
    setForm(defaultValues)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    const vals = {}
    formFields.forEach(f => { vals[f.field] = item[f.field] ?? defaultValues[f.field] ?? '' })
    setForm(vals)
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (editItem) {
      await update.mutateAsync({ id: editItem.id, data: form })
    } else {
      await create.mutateAsync(form)
    }
    setModalOpen(false)
  }

  const handleDelete = async () => {
    await remove.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const isSaving = create.isPending || update.isPending
  const isDeleting = remove.isPending

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          size="small"
          sx={{ px: 2.5 }}
        >
          Ekle
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 18 }} /> }}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Error */}
      {list.isError && <Alert severity="error" sx={{ mb: 2 }}>Veriler yüklenemedi.</Alert>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.field}>{col.label}</TableCell>
              ))}
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(row => (
                <TableRow key={row.id} hover>
                  {columns.map(col => (
                    <TableCell key={col.field}>
                      {col.render ? col.render(row) : col.field === 'status' ? statusChip(row[col.field]) : (row[col.field] ?? '—')}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => openEdit(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
        {filtered.length} kayıt
      </Typography>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editItem ? `Düzenle — ${editItem.name || editItem.code}` : `Yeni ${title}`}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {formFields.map(field => {
            if (field.type === 'select') {
              return (
                <FormControl key={field.field} fullWidth size="small" required={field.required}>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={form[field.field] || ''}
                    label={field.label}
                    onChange={e => setForm(p => ({ ...p, [field.field]: e.target.value }))}
                  >
                    {(field.options || STATUS_OPTIONS).map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }
            if (field.selectComponent) {
              return (
                <field.selectComponent
                  key={field.field}
                  value={form[field.field] || ''}
                  onChange={val => setForm(p => ({ ...p, [field.field]: val }))}
                  label={field.label}
                  required={field.required}
                />
              )
            }
            return (
              <TextField
                key={field.field}
                label={field.label}
                value={form[field.field] || ''}
                onChange={e => setForm(p => ({ ...p, [field.field]: e.target.value }))}
                required={field.required}
                size="small"
                fullWidth
              />
            )
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined" color="inherit" size="small">
            İptal
          </Button>
          <Button onClick={handleSave} variant="contained" size="small" disabled={isSaving}>
            {isSaving ? <CircularProgress size={16} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Kaydı Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu kaydı silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={handleDelete} variant="contained" color="error" size="small" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={16} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LookupTablePage
