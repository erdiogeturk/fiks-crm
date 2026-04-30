import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel,
  Switch, FormControlLabel, Divider, IconButton, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CodeIcon from '@mui/icons-material/Code'
import { useColumns, usePreview } from '../../../hooks/useAlans'
import { useSchemaTables } from '../../../hooks/useSchema'

const DATA_TYPES = [
  { value: 'TEXT',      label: 'Metin',           desc: 'VARCHAR — kısa metin (varsayılan 255 karakter)' },
  { value: 'LONG_TEXT', label: 'Uzun Metin',       desc: 'TEXT — uzun açıklamalar, notlar' },
  { value: 'NUMBER',    label: 'Sayı (Tam)',        desc: 'BIGINT — tam sayı' },
  { value: 'DECIMAL',   label: 'Ondalık Sayı',     desc: 'DECIMAL(18,2) — para birimi, ölçümler' },
  { value: 'DATE',      label: 'Tarih',             desc: 'DATE — yalnızca tarih' },
  { value: 'DATETIME',  label: 'Tarih ve Saat',    desc: 'DATETIME — tarih + saat' },
  { value: 'BOOLEAN',   label: 'Evet / Hayır',     desc: 'TINYINT(1) — iki durumlu alan' },
  { value: 'SELECT',    label: 'Seçim Listesi',    desc: 'VARCHAR(100) — önceden tanımlı seçenekler' },
]

const STEPS = ['Alan Tanımı', 'Önizleme', 'Sonuç']

// Turkish label for common system columns
const SYSTEM_LABELS = {
  id: 'ID', company_id: 'Şirket', created_at: 'Oluşturma Tarihi', updated_at: 'Güncelleme Tarihi',
  name: 'Ad', email: 'E-posta', phone: 'Telefon', status: 'Durum', code: 'Kod',
  parent_id: 'Üst Kayıt', title: 'Unvan', first_name: 'Ad', last_name: 'Soyad',
  full_name: 'Ad Soyad', description: 'Açıklama', notes: 'Notlar',
}

const FieldTypeChip = ({ fieldType, custom }) => {
  const dt = DATA_TYPES.find(d => d.value === fieldType)
  if (custom) {
    return <Chip label={dt?.label || fieldType} size="small" color="primary" variant="outlined"
      sx={{ fontSize: 11, fontWeight: 600 }} />
  }
  return <Chip label={dt?.label || fieldType} size="small" variant="outlined"
    sx={{ fontSize: 11, color: 'text.secondary', borderColor: 'divider' }} />
}

const toFieldName = (label) =>
  label.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 49)

const EMPTY_FORM = {
  label: '', fieldName: '', dataType: 'TEXT', fieldLength: 255,
  nullable: true, defaultValue: '', selectOptions: '',
}

// ── Main Component ──────────────────────────────────────────────────────────

const AlanDetayPage = () => {
  const { tableName } = useParams()
  const { data: tables = [] } = useSchemaTables()
  const entityLabel = tables.find(t => t.tableName === tableName)?.displayName || tableName

  const { columns, apply, deactivate } = useColumns(tableName)
  const preview = usePreview(tableName)

  const [open, setOpen]               = useState(false)
  const [step, setStep]               = useState(0)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [previewData, setPreviewData] = useState(null)
  const [applyResult, setApplyResult] = useState(null)
  const [formError, setFormError]     = useState(null)
  const [deactivateId, setDeactivateId] = useState(null)

  // auto-generate fieldName from label
  useEffect(() => {
    if (step === 0 && form.label) {
      setForm(p => ({ ...p, fieldName: toFieldName(form.label) }))
    }
  }, [form.label]) // eslint-disable-line

  const openWizard = () => {
    setForm(EMPTY_FORM)
    setPreviewData(null)
    setApplyResult(null)
    setFormError(null)
    setStep(0)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handlePreview = async () => {
    setFormError(null)
    if (!form.label.trim() || !form.fieldName.trim()) {
      setFormError('Etiket ve alan adı zorunludur.')
      return
    }
    if (form.dataType === 'SELECT' && !form.selectOptions.trim()) {
      setFormError('Seçim listesi için en az bir seçenek giriniz.')
      return
    }
    try {
      const req = buildRequest()
      const data = await preview.mutateAsync(req)
      setPreviewData(data)
      setStep(1)
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Önizleme oluşturulamadı.')
    }
  }

  const handleApply = async () => {
    try {
      const req = buildRequest()
      const result = await apply.mutateAsync(req)
      setApplyResult(result)
      setStep(2)
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Alan uygulanamadı.')
      setStep(1)
    }
  }

  const buildRequest = () => ({
    label: form.label,
    fieldName: form.fieldName,
    dataType: form.dataType,
    fieldLength: form.dataType === 'TEXT' ? (Number(form.fieldLength) || 255) : undefined,
    nullable: form.nullable,
    defaultValue: form.defaultValue || undefined,
    selectOptions: form.dataType === 'SELECT'
      ? form.selectOptions.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined,
  })

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))
  const setSwitch = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.checked }))

  const cols = columns.data || []
  const systemCols = cols.filter(c => !c.custom)
  const customCols = cols.filter(c => c.custom)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{entityLabel}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Tablo alanlarını görüntüleyin ve yeni özel alanlar ekleyin.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={openWizard}>
          Yeni Alan Ekle
        </Button>
      </Box>

      {columns.isError && <Alert severity="error" sx={{ mb: 2 }}>Sütun bilgileri yüklenemedi.</Alert>}

      {/* Column Table */}
      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>DB Sütunu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Etiket</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Alan Tipi</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DB Tipi</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Maks. Uzunluk</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Boş Olabilir</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Varsayılan</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tür</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.isLoading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : cols.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>Tablo bulunamadı veya henüz oluşturulmamış.</TableCell></TableRow>
            ) : (
              <>
                {/* System columns */}
                {systemCols.map(col => (
                  <TableRow key={col.columnName} hover sx={{ bgcolor: 'transparent' }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
                      {col.columnName}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{SYSTEM_LABELS[col.columnName] || col.label}</TableCell>
                    <TableCell><FieldTypeChip fieldType={col.fieldType} custom={false} /></TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.disabled' }}>
                      {col.dbDataType}{col.maxLength ? `(${col.maxLength})` : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{col.maxLength || '—'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{col.nullable ? 'Evet' : 'Hayır'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.disabled' }}>
                      {col.defaultValue ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Chip label="Sistem" size="small" sx={{ fontSize: 10, color: 'text.disabled', borderColor: 'divider', bgcolor: 'grey.50' }} variant="outlined" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))}

                {/* Custom columns */}
                {customCols.map(col => (
                  <TableRow key={col.columnName} hover
                    sx={{ bgcolor: col.status === 'INACTIVE' ? 'action.hover' : 'transparent', opacity: col.status === 'INACTIVE' ? 0.5 : 1 }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: 'primary.main', fontWeight: 600 }}>
                      {col.columnName}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{col.label}</TableCell>
                    <TableCell><FieldTypeChip fieldType={col.fieldType} custom={true} /></TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.disabled' }}>
                      {col.dbDataType}{col.maxLength ? `(${col.maxLength})` : ''}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{col.maxLength || '—'}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{col.nullable ? 'Evet' : 'Hayır'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: 'text.disabled' }}>
                      {col.defaultValue ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={col.status === 'INACTIVE' ? 'Pasif' : 'Özel'}
                        size="small"
                        color={col.status === 'INACTIVE' ? 'default' : 'primary'}
                        variant={col.status === 'INACTIVE' ? 'outlined' : 'filled'}
                        sx={{ fontSize: 10, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {col.status === 'ACTIVE' && (
                        <Tooltip title="Devre Dışı Bırak">
                          <IconButton size="small" color="error" onClick={() => setDeactivateId(col.customFieldId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
        {systemCols.length} sistem alanı · {customCols.filter(c => c.status === 'ACTIVE').length} özel alan
      </Typography>

      {/* ── Deactivate Confirm ─────────────────────────────── */}
      <Dialog open={!!deactivateId} onClose={() => setDeactivateId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Alanı Devre Dışı Bırak</DialogTitle>
        <DialogContent>
          <Typography>Bu özel alanı devre dışı bırakmak istiyor musunuz?</Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Sütun veritabanında kalır; yalnızca görünürlük kapatılır.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeactivateId(null)} variant="outlined" color="inherit" size="small">İptal</Button>
          <Button onClick={async () => { await deactivate.mutateAsync(deactivateId); setDeactivateId(null) }}
            variant="contained" color="error" size="small" disabled={deactivate.isPending}>
            {deactivate.isPending ? <CircularProgress size={16} /> : 'Devre Dışı Bırak'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add Field Wizard Dialog ────────────────────────── */}
      <Dialog open={open} onClose={step < 2 ? handleClose : undefined} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Yeni Alan Ekle — {entityLabel}
        </DialogTitle>

        <Box sx={{ px: 3, pb: 1 }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>
        </Box>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {/* ── Step 0: Form ────────────────── */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Alan Etiketi" required size="small" fullWidth
                  value={form.label} onChange={set('label')}
                  helperText="Kullanıcıya gösterilen isim (ör. Proje Kodu)"
                />
                <TextField
                  label="DB Sütun Adı" required size="small" fullWidth
                  value={form.fieldName} onChange={set('fieldName')}
                  helperText={`DB'de: cf_${form.fieldName || '…'}`}
                  inputProps={{ pattern: '[a-z][a-z0-9_]*' }}
                />
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel>Veri Tipi</InputLabel>
                <Select value={form.dataType} label="Veri Tipi" onChange={set('dataType')}>
                  {DATA_TYPES.map(dt => (
                    <MenuItem key={dt.value} value={dt.value}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{dt.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{dt.desc}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {form.dataType === 'TEXT' && (
                <TextField
                  label="Maks. Uzunluk" type="number" size="small" sx={{ width: 200 }}
                  value={form.fieldLength} onChange={set('fieldLength')}
                  inputProps={{ min: 1, max: 16383 }}
                />
              )}

              {form.dataType === 'SELECT' && (
                <TextField
                  label="Seçenekler (her satır bir seçenek)" multiline rows={4} size="small" fullWidth
                  value={form.selectOptions} onChange={set('selectOptions')}
                  placeholder={'Aktif\nPasif\nBeklemede'}
                />
              )}

              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel
                  control={<Switch checked={form.nullable} onChange={setSwitch('nullable')} size="small" />}
                  label={<Typography variant="body2">Boş bırakılabilir</Typography>}
                />
                <TextField
                  label="Varsayılan Değer" size="small" sx={{ flex: 1 }}
                  value={form.defaultValue} onChange={set('defaultValue')}
                  disabled={!form.nullable}
                />
              </Box>

              {formError && <Alert severity="error">{formError}</Alert>}
            </Box>
          )}

          {/* ── Step 1: Preview ─────────────── */}
          {step === 1 && previewData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {previewData.columnAlreadyExists && (
                <Alert severity="warning" icon={<WarningAmberIcon />}>
                  Bu sütun veritabanında zaten mevcut. Yalnızca metadata kaydedilecek.
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', mb: 2 }}>
                  Alan Özeti
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {[
                    ['Etiket',           previewData.label],
                    ['DB Sütunu',        `cf_${form.fieldName}`],
                    ['Tablo',            previewData.tableName],
                    ['Veri Tipi',        DATA_TYPES.find(d => d.value === previewData.dataType)?.label || previewData.dataType],
                    ['DB Veri Tipi',     previewData.dbDataType],
                    ['Boş Olabilir',     previewData.nullable ? 'Evet' : 'Hayır'],
                    ['Varsayılan',       previewData.defaultValue || '—'],
                    ...(previewData.selectOptions?.length ? [['Seçenekler', previewData.selectOptions.join(', ')]] : []),
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontSize: 13 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <CodeIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>
                    Uygulanacak SQL
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'grey.900', borderRadius: 1, p: 2 }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#86efac', lineHeight: 1.7, wordBreak: 'break-all' }}>
                    {previewData.ddlStatement}
                  </Typography>
                </Box>
              </Paper>

              {formError && <Alert severity="error">{formError}</Alert>}
            </Box>
          )}

          {/* ── Step 2: Result ──────────────── */}
          {step === 2 && applyResult && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Alan Başarıyla Eklendi</Typography>
              <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <strong>{applyResult.label}</strong> etiketi ile{' '}
                <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                  {applyResult.columnName}
                </code>{' '}
                sütunu tabloya eklendi ve metadata kaydedildi.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {step === 0 && (
            <>
              <Button onClick={handleClose} variant="outlined" color="inherit" size="small">İptal</Button>
              <Button onClick={handlePreview} variant="contained" size="small" disabled={preview.isPending}>
                {preview.isPending ? <CircularProgress size={16} /> : 'Önizlemeye Geç →'}
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button onClick={() => { setStep(0); setFormError(null) }} variant="outlined" color="inherit" size="small">
                ← Geri
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button onClick={handleClose} variant="outlined" color="inherit" size="small">İptal</Button>
              <Button onClick={handleApply} variant="contained" color="success" size="small" disabled={apply.isPending}>
                {apply.isPending ? <CircularProgress size={16} /> : 'Veritabanına Uygula ✓'}
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button onClick={() => { setStep(0); setForm(EMPTY_FORM) }} variant="outlined" size="small">
                Yeni Alan Ekle
              </Button>
              <Button onClick={handleClose} variant="contained" size="small">Kapat</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AlanDetayPage
