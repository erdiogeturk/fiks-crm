import LookupTablePage from '../../components/LookupTablePage'
import { usePositions } from '../../hooks/useLookup'

const config = {
  title: 'Pozisyon Tablosu',
  hooks: usePositions,
  defaultValues: { code: '', name: '', status: 'Aktif' },
  columns: [
    { field: 'code',   label: 'Kod' },
    { field: 'name',   label: 'Pozisyon Adı' },
    { field: 'status', label: 'Durum' },
  ],
  formFields: [
    { field: 'code',   label: 'Pozisyon Kodu', required: true },
    { field: 'name',   label: 'Pozisyon Adı',  required: true },
    { field: 'status', label: 'Durum', type: 'select', options: ['Aktif', 'Pasif'] },
  ],
}

const PozisyonPage = () => <LookupTablePage config={config} />
export default PozisyonPage
