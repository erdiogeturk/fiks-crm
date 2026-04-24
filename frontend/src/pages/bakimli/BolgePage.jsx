import LookupTablePage from '../../components/LookupTablePage'
import { useRegions } from '../../hooks/useLookup'

const config = {
  title: 'Bölge/Eyalet Tablosu',
  hooks: useRegions,
  defaultValues: { code: '', name: '', countryId: '', status: 'Aktif' },
  columns: [
    { field: 'code',        label: 'Kod' },
    { field: 'name',        label: 'Bölge/Eyalet Adı' },
    { field: 'countryName', label: 'Ülke' },
    { field: 'status',      label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'Bölge Kodu', required: true },
    { field: 'name',   label: 'Bölge Adı',  required: true },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const BolgePage = () => <LookupTablePage config={config} />
export default BolgePage
