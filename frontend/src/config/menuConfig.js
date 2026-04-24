export const menuConfig = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Ana Sayfa',
  },
  {
    id: 'sistem',
    label: 'Sistem Yönetimi',
    children: [
      { id: 'organizasyon', path: '/sistem/organizasyon', label: 'Organizasyon Yönetimi' },
      { id: 'roller', path: '/sistem/roller', label: 'Yetkilendirme/Rol Yönetimi' },
      { id: 'calisanlar', path: '/sistem/calisanlar', label: 'Çalışan Yönetimi' },
      { id: 'kullanicilar', path: '/sistem/kullanicilar', label: 'Kullanıcı Yönetimi' },
      {
        id: 'alan',
        label: 'Alan Yönetimi',
        children: [
          { id: 'alan-musteri', path: '/sistem/alan/musteri', label: 'Müşteri Yönetimi' },
          { id: 'alan-ilgili-kisi', path: '/sistem/alan/ilgili-kisi', label: 'İlgili Kişi Yönetimi' },
          { id: 'alan-aktivite', path: '/sistem/alan/aktivite', label: 'Aktivite Yönetimi' },
          { id: 'alan-satis', path: '/sistem/alan/satis-belgesi', label: 'Satış Belgesi Yönetimi' },
          { id: 'alan-urun', path: '/sistem/alan/urun', label: 'Ürün Yönetimi' },
        ],
      },
      {
        id: 'bakimli',
        label: 'Bakımlı Tablo Yönetimi',
        children: [
          { id: 'ulke', path: '/sistem/bakimli/ulke', label: 'Ülke Tablosu' },
          { id: 'bolge', path: '/sistem/bakimli/bolge', label: 'Bölge/Eyalet Tablosu' },
          { id: 'il', path: '/sistem/bakimli/il', label: 'İl/Şehir Tablosu' },
          { id: 'ilce', path: '/sistem/bakimli/ilce', label: 'İlçe Tablosu' },
          { id: 'pozisyon', path: '/sistem/bakimli/pozisyon', label: 'Pozisyon Tablosu' },
          { id: 'birim', path: '/sistem/bakimli/birim', label: 'Birim Tablosu' },
          { id: 'para-birimi', path: '/sistem/bakimli/para-birimi', label: 'Para Birimi Tablosu' },
          { id: 'urun-fiyat', path: '/sistem/bakimli/urun-fiyat', label: 'Ürün Fiyat Listesi' },
        ],
      },
      { id: 'onay', path: '/sistem/onay', label: 'Onay Süreçleri' },
      { id: 'kur', path: '/sistem/kur', label: 'Kur Dönüşümleri' },
      { id: 'liste', path: '/sistem/liste', label: 'Liste Sınırlamaları' },
      {
        id: 'veri',
        label: 'Veri Aktarımı',
        children: [
          { id: 'veri-ice', path: '/sistem/veri/ice', label: 'İçe Aktarım' },
          { id: 'veri-disa', path: '/sistem/veri/disa', label: 'Dışa Aktarım' },
        ],
      },
      {
        id: 'ciktilar',
        label: 'Sistem Çıktıları',
        children: [
          { id: 'mail', path: '/sistem/ciktilar/mail', label: 'Mail Gönderimi' },
          { id: 'bildirim', path: '/sistem/ciktilar/bildirim', label: 'Bildirim Gönderimi' },
          { id: 'raporlar', path: '/sistem/ciktilar/raporlar', label: 'Raporlar' },
        ],
      },
    ],
  },
  { id: 'musteriler', path: '/musteriler', label: 'Müşteriler' },
  { id: 'aktiviteler', path: '/aktiviteler', label: 'Aktiviteler' },
  { id: 'satis-belgeleri', path: '/satis-belgeleri', label: 'Satış Belgeleri' },
  { id: 'urunler', path: '/urunler', label: 'Ürünler' },
]
