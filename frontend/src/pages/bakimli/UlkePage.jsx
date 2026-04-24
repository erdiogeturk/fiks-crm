import LookupTablePage from '../../components/LookupTablePage'
import { useCountries } from '../../hooks/useLookup'

const config = {
  title: 'Ülke Tablosu',
  hooks: useCountries,
  defaultValues: { code: '', name: '', phoneCode: '', status: 'Aktif' },
  columns: [
    { field: 'code',      label: 'Kod' },
    { field: 'name',      label: 'Ülke Adı' },
    { field: 'phoneCode', label: 'Telefon Kodu' },
    { field: 'status',    label: 'Durum' },
  ],
  formFields: [
    { field: 'code',      label: 'Ülke Kodu (ISO)', required: true },
    { field: 'name',      label: 'Ülke Adı',        required: true },
    { field: 'phoneCode', label: 'Telefon Kodu',     required: false },
    { field: 'status',    label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const UlkePage = () => <LookupTablePage config={config} />
export default UlkePage
