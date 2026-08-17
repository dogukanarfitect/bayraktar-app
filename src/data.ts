import type { ActionItem, NewsItem, RecognitionMember, TabId, IconName } from './types';

export const tabs: { id: TabId; label: string; icon: IconName; featured?: boolean }[] = [
  { id: 'home', label: 'Ana', icon: 'home' },
  { id: 'news', label: 'Haberler', icon: 'news' },
  { id: 'isg', label: 'SOS', icon: 'shield', featured: true },
  { id: 'recognition', label: 'Takdir', icon: 'star' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];

export const quickActions: ActionItem[] = [
  { id: 'hrChat', title: "İK'ya Soru Sor", desc: 'Soru, görüş ve çalışan hizmetleri talepleri için hızlı sohbet.', icon: 'message' },
  { id: 'foodMenu', title: 'Yemek Listesi', desc: 'Günlük menü ve haftalık plan.', icon: 'food' },
  { id: 'serviceRoutes', title: 'Servisler', desc: 'Şirket, üretim tesisi ve ulaşım bilgileri.', icon: 'bus' },
  { id: 'survey', title: 'Anket', desc: 'Nabız anketi ve çalışan geri bildirimi.', icon: 'survey' },
];

export const employeeServices: ActionItem[] = [
  { id: 'employeeInfo', title: 'Özlük ve Organizasyon', desc: 'Departman, pozisyon ve çalışan bilgileri.', icon: 'org' },
  { id: 'calendar', title: 'Önemli Günler Takvimi', desc: 'Etkinlik, denetim, bayram ve duyuru hatırlatmaları.', icon: 'calendar' },
  { id: 'doctorSchedule', title: 'Doktor Takvimi', desc: 'Revir ve doktor uygunluk planı.', icon: 'medical' },
  { id: 'documents', title: 'Dokümanlar', desc: 'İK, İSG ve şirket dokümanları.', icon: 'doc' },
  { id: 'payroll', title: 'Bordro', desc: 'Aylık bordro görüntüleme.', icon: 'payroll' },
  { id: 'feedbackForm', title: 'Görüş / Öneri', desc: 'Öneri, şikayet ve geri bildirim formu.', icon: 'message' },
];

export const newsItems: NewsItem[] = [
  {
    id: 'announcement', title: 'Mobil çalışan portalı kapsamı genişliyor', category: 'Duyuru', date: '05 Temmuz 2026',
    image: require('../assets/news-announcement.jpg'),
    summary: 'İK, İSG, doküman, servis, yemek ve duyuru akışları tek mobil deneyimde toplanıyor. Yeni araçlar çalışanların günlük işlemlerini daha hızlı tamamlamasını sağlayacak.',
    detail: [
      'Mobil çalışan portalının yeni sürümüyle günlük iş akışında ihtiyaç duyulan hizmetler tek noktada bir araya getirildi. Çalışanlar İK sorularından yemek listesine, servis güzergâhlarından şirket duyurularına kadar birçok bilgiye mobil cihazlarından ulaşabilecek.',
      'Güncellenen yapı; bordro ve özlük belgeleri, doktor takvimi, görüş ve öneri formu, İSG eğitimleri ile risk bildirim süreçlerini de kapsıyor. Sayfalar daha sade adımlar, anlaşılır durum mesajları ve hızlı yönlendirmelerle yeniden tasarlandı.',
      'Portalın kapsamı çalışanlardan gelen geri bildirimler doğrultusunda geliştirilmeye devam edecek. Yeni özellikler yayınlandıkça bildirim merkezi üzerinden bilgilendirme yapılacak.',
    ],
  },
  {
    id: 'safety', title: 'İSG eğitim haftası başladı', category: 'İSG', date: '04 Temmuz 2026',
    image: require('../assets/news-safety.jpg'),
    summary: 'Tüm ekipler için kısa eğitim modülleri, saha uygulamaları ve acil durum tatbikatları takvime eklendi. Program hafta boyunca farklı vardiyalarda devam edecek.',
    detail: [
      'İSG eğitim haftası kapsamında risk farkındalığı, kişisel koruyucu donanım kullanımı ve acil durum iletişimi başlıklarında yeni içerikler yayınlandı. Eğitimler üretim sahasındaki günlük örneklerle destekleniyor.',
      'Çalışanlar kendilerine atanan modülleri İSG Eğitimleri sayfasından takip edebilir, kaldıkları yerden devam edebilir ve tamamlanma durumlarını görüntüleyebilir. Vardiya planlarına uygun oturum saatleri ekip yöneticileriyle ayrıca paylaşılacak.',
      'Hafta sonunda gerçekleştirilecek saha tatbikatında tahliye yönlendirmeleri, toplanma alanları ve ekipler arası iletişim adımları uygulamalı olarak değerlendirilecek.',
    ],
  },
  {
    id: 'community', title: 'Bayraktar aile buluşması duyuruldu', category: 'Etkinlik', date: '03 Temmuz 2026',
    image: require('../assets/news-community.jpg'),
    summary: 'Temmuz ayı çalışan buluşması için kayıtlar açıldı. Ailelerin de katılabileceği etkinliğin ulaşım ve program ayrıntıları mobil portalda yayınlandı.',
    detail: [
      'Bayraktar aile buluşması, çalışanların ve ailelerinin birlikte vakit geçirebileceği açık hava etkinlikleriyle bu yıl yeniden düzenleniyor. Programda çocuklara yönelik atölyeler, takım oyunları ve gün boyunca devam edecek sosyal alanlar yer alacak.',
      'Katılım kaydı mobil portal üzerinden tamamlanabilecek. Kayıt sırasında katılımcı sayısı ve servis ihtiyacı belirtilebilecek; kontenjan ile ulaşım planı başvuru bilgilerine göre güncellenecek.',
      'Etkinlik günü, buluşma saati ve servis duraklarına ilişkin son bilgiler kayıt yaptıran çalışanlara bildirim olarak iletilecek.',
    ],
  },
  {
    id: 'hr', title: 'Çalışan dokümanları güncellendi', category: 'İK', date: '01 Temmuz 2026',
    image: require('../assets/news-hr.jpg'),
    summary: 'İzin süreci, çalışan el kitabı ve özlük bilgi rehberi güncel sürümleriyle Dokümanlar bölümüne eklendi. Eski revizyonların yerine yeni belgeler kullanılacak.',
    detail: [
      'İnsan Kaynakları tarafından kullanılan temel çalışan dokümanları gözden geçirilerek güncel sürümleri mobil portalda yayınlandı. İzin süreçleri, özlük bilgilerinin güncellenmesi ve şirket içi uygulamalar daha açık adımlarla yeniden anlatıldı.',
      'Dokümanlar sayfasındaki kategori filtreleri kullanılarak ilgili belgeye hızlıca ulaşılabilir. Her belgenin yayın tarihi ve revizyon bilgisi liste üzerinde görüntülenebilir; PDF dosyaları cihaz üzerinden indirilebilir.',
      'İçeriklerle ilgili soru veya düzeltme talepleri Görüş ve Öneri alanından İnsan Kaynakları ekibine iletilebilir.',
    ],
  },
  {
    id: 'production', title: 'Pınarbaşı tesisinde iyileştirme çalışmaları tamamlandı', category: 'Duyuru', date: '29 Haziran 2026',
    image: require('../assets/news-production.jpg'),
    summary: 'Üretim akışını daha güvenli ve verimli hale getiren saha düzenlemeleri tamamlandı. Yeni yerleşim ve yönlendirmeler vardiyalarla paylaşılmaya başlandı.',
    detail: [
      'Pınarbaşı tesisinde yürütülen saha iyileştirme çalışmaları planlanan takvim doğrultusunda tamamlandı. Çalışmalar kapsamında üretim alanlarındaki yaya yolları, malzeme geçiş noktaları ve görsel güvenlik yönlendirmeleri yeniden düzenlendi.',
      'Yeni yerleşim planı, ekiplerin ortak alanlara daha güvenli ulaşmasını ve üretim içi hareketlerin daha düzenli ilerlemesini amaçlıyor. Vardiya başlangıç toplantılarında güncellenen alanlar ve kullanım kuralları ekip yöneticileri tarafından aktarılacak.',
      'Çalışanlar sahada fark ettikleri ek iyileştirme ihtiyaçlarını Risk veya Olay Bildir ekranından İSG ekibine iletebilir.',
    ],
  },
];

export const surveyQuestions = [
  'İş yerimde kendimi güvende hissediyorum.',
  'Yöneticim geri bildirimlerimi dinliyor.',
  'Takımımda iş birliği güçlü.',
  'Kariyer fırsatlarından memnunum.',
  'Bayraktar Holding çatısı altında çalışmaktan gurur duyuyorum.',
];

export const recognitionMembers: RecognitionMember[] = [
  { name: 'Elif Kaya', team: 'Bakım', hint: 'Vardiya desteği', photo: require('../assets/elif-kaya.jpg'), points: '2.180' },
  { name: 'Mehmet Yılmaz', team: 'Üretim', hint: 'Hat 2 katkısı', photo: require('../assets/mehmet-yilmaz.jpg'), points: '1.240' },
  { name: 'Selin Öz', team: 'Kalite', hint: 'Kontrol disiplini', photo: require('../assets/elif-oz.jpg'), points: '1.080' },
];

export const detailContent = {
  foodMenu: { title: 'Yemek Listesi', subtitle: 'Bugünün menüsü · 17 Ağustos', icon: 'food' as IconName, rows: [
    ['Günün Çorbası', 'Mercimek çorbası', '118 kcal'], ['Ana Yemek', 'Etli türlü', '420 kcal'], ['Yardımcı Yemek', 'Şehriyeli pirinç pilavı', '265 kcal'], ['Salata / Tatlı', 'Mevsim salata · Fırın sütlaç', '180 kcal'],
  ]},
  serviceRoutes: { title: 'Servisler', subtitle: 'İzmir üretim tesisleri', icon: 'bus' as IconName, rows: [
    ['Ege Endüstri · Pınarbaşı', 'Kemalpaşa Cad. No:280, Bornova', 'İzmir'], ['Ege Fren · Pınarbaşı', '7405/2 Sok. No:4, Bornova', 'İzmir'],
  ]},
  employeeInfo: { title: 'Özlük ve Organizasyon', subtitle: 'Çalışan profiliniz', icon: 'org' as IconName, rows: [
    ['Sicil', 'BYK-2482', 'Aktif'], ['Birim', 'Üretim · Hat 2', 'Tesis 2'], ['Yönetici', 'Ahmet Demir', 'Üretim Şefi'], ['Vardiya', 'A vardiyası', '08:00–18:00'],
  ]},
  calendar: { title: 'Önemli Günler Takvimi', subtitle: 'Ağustos 2026', icon: 'calendar' as IconName, rows: [
    ['14 Ağustos', 'İSG saha denetimi', '09:30'], ['18 Ağustos', 'Aile buluşması kayıt sonu', 'Tüm gün'], ['24 Ağustos', 'Kalite eğitimi', '14:00'], ['30 Ağustos', 'Zafer Bayramı', 'Resmî tatil'],
  ]},
  doctorSchedule: { title: 'Doktor Takvimi', subtitle: 'Tesis 2 revir planı', icon: 'medical' as IconName, rows: [
    ['Bugün', 'Dr. Ayşe Akın', '09:00–16:00'], ['14 Ağustos', 'Dr. Murat Eren', '10:00–17:00'], ['17 Ağustos', 'Dr. Ayşe Akın', '09:00–16:00'],
  ]},
  documents: { title: 'Dokümanlar', subtitle: 'Güncel çalışan dokümanları', icon: 'doc' as IconName, rows: [
    ['Çalışan El Kitabı', 'PDF · 2,4 MB', 'Güncel'], ['İzin Süreci Rehberi', 'PDF · 840 KB', 'Yeni'], ['İSG Temel Prosedürü', 'PDF · 1,8 MB', 'Güncel'], ['KVKK Aydınlatma Metni', 'PDF · 520 KB', '2026'],
  ]},
  payroll: { title: 'Bordro ve Özlük', subtitle: 'Maaş ve izin özeti', icon: 'payroll' as IconName, rows: [
    ['Temmuz 2026', 'Net bordro hazır', 'Görüntüle'], ['Haziran 2026', 'Bordro arşivi', 'PDF'], ['Yıllık izin', 'Kullanılabilir bakiye', '9 gün'], ['Kıdem', 'İşe giriş 12.03.2018', '8 yıl'],
  ]},
  safetyTraining: { title: 'İSG Eğitimleri', subtitle: 'Atanmış eğitimler', icon: 'survey' as IconName, rows: [
    ['Risk Farkındalığı', '12 dk · Video', '%80'], ['KKD Kullanımı', '8 dk · Video', 'Tamamlandı'], ['Acil Durum İletişimi', '10 dk · İçerik', 'Başla'],
  ]},
  safetyDocs: { title: 'Prosedürler', subtitle: 'İSG doküman ve talimatları', icon: 'doc' as IconName, rows: [
    ['Acil Durum Prosedürü', 'Revizyon 4', 'PDF'], ['Tahliye Planı', 'Tesis 2', 'Güncel'], ['Kaza Bildirim Akışı', 'Revizyon 2', 'PDF'],
  ]},
  emergencyPhones: { title: 'Acil Telefonlar', subtitle: 'Tek dokunuşla ulaşın', icon: 'phone' as IconName, rows: [
    ['İşyeri Güvenliği', 'Dahili acil destek', '2222'], ['Tesis Reviri', 'Sağlık birimi', '2230'], ['İtfaiye', 'Acil çağrı', '112'], ['Güvenlik Kapısı', 'Tesis 2', '2200'],
  ]},
  notifications: { title: 'Bildirimler', subtitle: 'Güncel aksiyonlarınız', icon: 'bell' as IconName, rows: [
    ['Servis hatırlatması', 'Sincan servisi 18:10’da kalkacak.', '8 dk'], ['Yeni doküman', 'Çalışan el kitabı güncellendi.', '1 sa'], ['İSG eğitimi', 'Risk Farkındalığı modülü atandı.', 'Dün'],
  ]},
} as const;
