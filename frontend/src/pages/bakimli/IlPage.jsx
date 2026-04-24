import LookupTablePage from '../../components/LookupTablePage'
import { useCities } from '../../hooks/useLookup'

const config = {
  title: 'İl/Şehir Tablosu',
  hooks: useCities,
  defaultValues: { code: '', name: '', countryId: '', regionId: '', status: 'Aktif' },
  columns: [
    { field: 'code',        label: 'Kod' },
    { field: 'name',        label: 'İl/Şehir Adı' },
    { field: 'countryName', label: 'Ülke' },
    { field: 'regionName',  label: 'Bölge/Eyalet' },
    { field: 'status',      label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'İl Kodu', required: true },
    { field: 'name',   label: 'İl Adı',  required: true },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const IlPage = () => <LookupTablePage config={config} />
export default IlPage
