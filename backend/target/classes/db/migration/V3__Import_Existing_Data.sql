-- V3__Import_Existing_Data.sql
-- Import data from existing FiksCRM (MySQL)

-- Insert customers
INSERT INTO customers (id, customer_no, external_no, role, name, customer_type, status, country, company_id, created_at, updated_at) VALUES
(1, NULL, NULL, 'Gerçek Müşteri', 'Yıldız Entegre Ağaç San. ve Tic. A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(2, NULL, NULL, 'Gerçek Müşteri', 'Oyak Dijital A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(3, NULL, NULL, 'Gerçek Müşteri', 'EREĞLİ DEMİR VE ÇELİK FABRİKALARI T.A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(4, NULL, NULL, 'Gerçek Müşteri', 'Oyak Pazarlama Hizmet ve Turizm A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(5, NULL, NULL, 'Gerçek Müşteri', 'İzocam Ticaret ve Sanayi A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(6, NULL, NULL, 'Gerçek Müşteri', 'Erdemir Çelik Servir Merkezi A.Ş. (ERSEM)', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(7, NULL, NULL, 'Gerçek Müşteri', 'Defacto Perakende Ticaret A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(8, NULL, NULL, 'Gerçek Müşteri', 'ASAŞ Alüminyum Sanayi ve Ticaret A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(9, NULL, NULL, 'Gerçek Müşteri', 'Norm Digital A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(10, NULL, NULL, 'Gerçek Müşteri', 'HAVELSAN A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(11, NULL, NULL, 'Gerçek Müşteri', 'SAKA Group', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(12, NULL, NULL, 'Gerçek Müşteri', 'EMLAK KONUT GYO A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(13, NULL, NULL, 'Gerçek Müşteri', 'Abdioğulları Plastik ve Ambalaj Sanayi A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(14, NULL, NULL, 'Gerçek Müşteri', 'BORUSAN MAKİNA VE GÜÇ SİSTEMLERİ SAN. VE TİC. A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(15, NULL, NULL, 'Gerçek Müşteri', 'Vakko Tekstil ve Hazır Giyim Sanayi İşletmeleri A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(16, NULL, NULL, 'Gerçek Müşteri', 'Akdeniz Chemson', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW()),
(17, NULL, NULL, 'Gerçek Müşteri', 'KoçSistem Bilgi ve İletişim Hizmetleri A.Ş.', 'Kurumsal Müşteri', 'Aktif', 'Türkiye', 1, NOW(), NOW());

-- Insert projects
INSERT INTO projects (id, customer_id, project_name, amount, currency, date, status, priority, segment, source, probability, contact, contact_email, contact_phone, notes, next_action, next_action_date, company_id, created_at, updated_at) VALUES
(1, 15, 'SAP Danışmanlık Teklifi', 16000, 'TRY', '2026-03-01', 'LOST', 'MEDIUM', 'Perakende', 'Partner', 20, 'Gökhan Gündüz', 'gokhan.gunduz@vakko.com.tr', '+90 555 980 80 89', '15.500 ve altı hedef fiyat istediler. Düşülmedi.', 'CV GÖnderimi', '2026-03-20', 1, NOW(), NOW()),
(2, 16, 'PP Modül & Ariba Entegrasyonu', 1900000, 'EUR', '2026-04-15', 'PROPOSAL', 'HIGH', 'Kimya', 'Partner', 35, 'Hülya Yakışır', 'hulya.yakisir@akdenizchemson.com', '+90 531 450 41 68', 'Nihai teklifler verildi. İhaleye davet edilecek firmalar belirleniyor. 5. sırada olduğumuz öğrenildi.', 'İhale Daveti Beklenecek', '2026-03-18', 1, NOW(), NOW()),
(3, 5, 'Kayseri Fabrika SAP Entegrasyonu', 3040000, 'TRY', '2026-01-10', 'LOST', 'MEDIUM', 'Yalıtım Malzemeleri', 'Partner', 50, 'Aras Karındaş', 'karindas@izocam.com.tr', '+90 531 731 62 99', 'Teklif gönderildi. Çok sık erteleme yapıldı. Ertelenme ihtimali var.', 'Kick-off toplantısı', '2026-03-25', 1, NOW(), NOW()),
(4, 13, 'SAP Analiz & RFP Yazımı Danışmanlık Proje', 20000, 'EUR', '2026-03-09', 'WON', 'HIGH', 'Plastik ve Ambalaj', 'Partner', 100, 'Ali Uygur', 'auygur@abco.com.tr', '+90 541 151 57 05', 'FI,CO,TRM,MM,EWM,SD,PP,QM, BASIS Sistem Yönetimi E-Çözümler', 'Proje başlangıcı', '2026-03-22', 1, NOW(), NOW()),
(5, 4, 'Kıbrıs Bordro Migrasyon', 28875, 'EUR', '2026-03-02', 'PROPOSAL', 'HIGH', 'Turizm Hizmetler', 'Partner', 70, 'Garen Bulur', 'gbulur@oypa.com.tr', '+90 538 634 84 88', '75 adam/gün, Mart-Nisan timeline, 1 Mayıs go-live', 'Teklif durum sorgulama', '2026-03-15', 1, NOW(), NOW()),
(6, 11, 'SAKA GROUP SAP S/4HANA RFP Süreç Kapsamı Danışmanlık Teklifi', 23000, 'EUR', '2026-04-01', 'WON', 'HIGH', 'Üretim', 'Partner', 100, 'Selahattin Saka', 'selahattin.saka@skgmetal.com', '+90 532 065 27 27', 'RFP Sürecinden sonra S4/Hana projesi için teklif verilecek.', 'Proje Başlangıcı', '2026-03-28', 1, NOW(), NOW()),
(7, 3, 'T&M SAP Modül Destek', 20000000, 'TRY', '2026-03-24', 'NEGOTIATION', 'HIGH', 'Demir Çelik', 'Partner', 80, 'Fatma Ceren Durmaz', 'fcdurmaz@erdemir.com.tr', '+90 538 615 09 49', '12 Aylık Basis: 1.8M TL (150K TL Aylık Basis) T&M Rate: 15.900 TL (Aylık ortalama 100 A/G bekleniyor hacim olarak) FI ağırlıklı.', 'Yönetim Onayında olduğu belirttiler.', '2026-03-24', 1, NOW(), NOW()),
(8, 6, 'ERSEM T&M SAP Modül Destek', 3000000, 'TRY', '2026-03-24', 'NEGOTIATION', 'HIGH', 'Demir Çelik', 'Partner', 80, 'Sefa Onur Dönmez', 'sodonmez@ersem.com.tr', '0538 3947025', 'Basis: Aylık: 69.000 TL + KDV (Yıllık 12 ay= 828.000 TL + KDV) T&M: 15.900 TL + KDV ( Ortalama aylık 15 A/G gelse) = 2.8 M TL Yıllık', 'Onay bekleniyor.', '2026-03-24', 1, NOW(), NOW()),
(9, 10, 'HEAS KOVAN ERP PROJESİ', 1200000, 'USD', '2026-03-24', 'WON', 'HIGH', 'Savunma Sanayii', 'Partner', 90, 'Halil CEYLAN', 'hceylan@havelsan.com.tr', '+90 533 052 16 84', 'Şuan Havelsan ile Heas arasında ihale şartname süreçleri ilerletiliyor ardından Havelsan ve Innovance sözleşme imzalayacak. Öncesinde Kick-Off ve %30 Ön avans istedik.', 'Sözleşme imzası ve Kikc-Off', '2026-03-24', 1, NOW(), NOW()),
(10, 11, 'SAKA Group S4/Hana Projesi', 600000, 'EUR', '2026-05-01', 'LEAD', 'HIGH', 'Üretim', 'Partner', 70, 'Selahattin SAKA', 'selahattin.saka@skgmetal.com', '+90 532 065 27 27', '', 'DAnışmanlık ve Lisans Teklifi ', '2026-04-20', 1, NOW(), NOW()),
(11, 13, 'S/4HANA Projesi', 800000, 'EUR', '2026-03-24', 'LEAD', 'HIGH', 'Plastik ve Ambalaj', 'Partner', 50, 'Ali Uygur', 'auygur@abco.com.tr', '+90 541 151 57 05', '', 'RFP sonrası Danışmanlık ve Lisans Teklifi', '2026-04-20', 1, NOW(), NOW()),
(12, 9, 'Norm Fasteners Morocco SAP Roll-out Projesi', 5218600, 'TRY', '2026-03-26', 'WON', 'HIGH', 'Bilişim Teknolojileri', 'Partner', 80, 'Serap Hasgüçmen Tarakçı', 'serap.tarakci@normdigital.com', '+90 505 891 6541', '1 haftaya kick off isteyebilirler (26.03.2026)', 'Onay bekleniyor', '2026-04-02', 1, NOW(), NOW()),
(13, 10, 'DIŞ KAYNAK SF-1 ', 4188000, 'TRY', '2026-03-26', 'WON', 'HIGH', 'Savunma Sanayii', 'Referans', 100, 'ÖYKÜ GARİPAĞAOĞLU', 'oykug@havelsan.com.tr', '+90 505 436 81 91', 'BENSU MELİS TONGUR 300K TL İLE ANLAŞILDI. HAVELSANA 349 K TL YE FATURALIYORUZ.', 'İK SÖZLEŞME', '2026-03-19', 1, NOW(), NOW()),
(14, 17, 'OpetFuchs Kârlılık Analiz Modeli Kurulum', 489000, 'TRY', '2026-04-02', 'WON', 'HIGH', 'Bilgi Sistem', 'Partner', 75, 'Semiye Koca', 'semiye.koca@kocsistem.com.tr', '+90 549 725 93 37', 'Faturalama Planı ayrıca görüşülecek.', 'Kick off', '2026-04-01', 1, NOW(), NOW()),
(15, 12, 'SATINALMA VE TEKLİF YÖNETİMİ SÜREÇ', 918000, 'TRY', '2026-03-26', 'WON', 'HIGH', 'İnşaat', 'Partner', 100, 'Ayşenur Açıkgöz', 'aacikgoz@emlakkonut.com.tr', '+90 539 439 46 53', '17K TL A/G rate. Birinci Faz Çalışma 374.000 TL + KDV İkinci Faz Çalışma 544.000 TL + KDV', 'Teklif onayı bekleniyor.', '2026-04-02', 1, NOW(), NOW()),
(16, 7, 'SAP Modül Destek Teklifi', 18000, 'TRY', '2026-03-26', 'WON', 'HIGH', 'Perakende', 'LinkedIn', 50, 'Esra Çırık', 'esra.cirik@defacto.com', '+905395703543', 'Öncelikle İsmail Abilerin desteği ile çalışmalara başlayacağız.', 'Sözleşme İmzası', '2026-04-02', 1, NOW(), NOW()),
(17, 8, 'Devops Hizmeti', 840000, 'TRY', '2026-04-06', 'WON', 'HIGH', 'Üretim', 'Referans', 100, 'Yasemin Yüce', 'yasemin.yuce@asastr.com', '+90 506 020 61 98', '', 'Sözleşme imzalandı ', '2026-04-06', 1, NOW(), NOW()),
(18, 1, 'İthalat-İhracat Paketi', 25000, 'EUR', '2026-04-06', 'WON', 'HIGH', 'Orman Ürünleri', 'Referans', 70, 'Caner Kabahasanoğlu', 'caner.kabahasanoglu@yildiz.com.tr', '+90 534 3650958', '', 'Sözleşme ok', '2026-04-06', 1, NOW(), NOW()),
(19, 14, 'SAP Framework Upgrade (JDK 21.9 & Spring Geçiş Projesi', 420000, 'TRY', '2026-04-06', 'NEGOTIATION', 'MEDIUM', 'Üretim', 'Referans', 80, 'Volkan BENTEŞEN', 'vbentesen@borusan.com', '+90 533 399 21 97', 'Sözleşme ve Teminat Mektubu Örneği bekleniyor.', 'Sözleşme ve Teminat Mektubu', '2026-04-13', 1, NOW(), NOW()),
(20, 2, 'Seyahat ve Masaraf Yönetimi', 4750000, 'TRY', '2026-04-06', 'PROPOSAL', 'HIGH', 'Bilişim', 'Partner', 70, 'Dilek Kaya', 'Dilek.KAYA@oyakdijital.com.tr', '+90 537 254 7690', '', 'Durum Sorgulanacak', '2026-04-13', 1, NOW(), NOW());

-- Insert activities
INSERT INTO activities (id, project_id, type, note, date, created_at) VALUES
(1, 1, 'Toplantı', 'İlk görüşme yapıldı', '2026-03-01', NOW()),
(2, 1, 'Teklif', 'Danışman kadrosu hazırlandı', '2026-03-10', NOW()),
(3, 2, 'Sunum', 'Çözüm sunumu tamamlandı', '2026-02-15', NOW()),
(4, 3, 'Toplantı', 'RFP alındı', '2026-01-10', NOW()),
(5, 3, 'Teklif', 'Teklif sunuldu', '2026-02-01', NOW()),
(6, 3, 'Kazanım', 'Proje kazanıldı!', '2026-02-20', NOW()),
(7, 2, 'Teklif', 'Executive summary sunuldu', '2026-02-20', NOW()),
(8, 5, 'Kazanım', 'Sözleşme imzalandı', '2026-02-28', NOW()),
(9, 6, 'Lead', 'Fuarda ilk temas', '2026-03-05', NOW());
