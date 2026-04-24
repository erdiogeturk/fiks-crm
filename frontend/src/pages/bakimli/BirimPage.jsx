import LookupTablePage from '../../components/LookupTablePage'
import { useUnits } from '../../hooks/useLookup'

const config = {
  title: 'Birim Tablosu',
  hooks: useUnits,
  defaultValues: { code: '', name: '', status: 'Aktif' },
  columns: [
    { field: 'code',   label: 'Kod' },
    { field: 'name',   label: 'Birim Adı' },
    { field: 'status', label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'Birim Kodu', required: true },
    { field: 'name',   label: 'Birim Adı',  required: true },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const BirimPage = () => <LookupTablePage config={config} />
export default BirimPage
