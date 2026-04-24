import LookupTablePage from '../../components/LookupTablePage'
import { useCurrencies } from '../../hooks/useLookup'

const config = {
  title: 'Para Birimi Tablosu',
  hooks: useCurrencies,
  defaultValues: { code: '', name: '', symbol: '', status: 'Aktif' },
  columns: [
    { field: 'code',   label: 'Kod (ISO)' },
    { field: 'name',   label: 'Para Birimi Adı' },
    { field: 'symbol', label: 'Sembol' },
    { field: 'status', label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'Para Birimi Kodu (ISO)', required: true },
    { field: 'name',   label: 'Para Birimi Adı',        required: true },
    { field: 'symbol', label: 'Sembol (₺, $, €…)',      required: false },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const ParaBirimiPage = () => <LookupTablePage config={config} />
export default ParaBirimiPage
