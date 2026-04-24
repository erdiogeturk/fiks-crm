import LookupTablePage from '../../components/LookupTablePage'
import { useDistricts } from '../../hooks/useLookup'

const config = {
  title: 'İlçe Tablosu',
  hooks: useDistricts,
  defaultValues: { code: '', name: '', cityId: '', status: 'Aktif' },
  columns: [
    { field: 'code',     label: 'Kod' },
    { field: 'name',     label: 'İlçe Adı' },
    { field: 'cityName', label: 'İl/Şehir' },
    { field: 'status',   label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'İlçe Kodu', required: true },
    { field: 'name',   label: 'İlçe Adı',  required: true },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const IlcePage = () => <LookupTablePage config={config} />
export default IlcePage
