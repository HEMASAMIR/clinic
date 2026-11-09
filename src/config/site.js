// Everything a buyer-facing page shows about the product lives here — change it once.
export const site = {
  name: 'موعِد',
  nameEn: 'Mawid',
  tagline: 'نظام حجز المواعيد الأذكى في الخليج',
  description:
    'موعِد نظام حجز مواعيد عربي متكامل للصالونات والعيادات والجيم ومراكز الخدمات: رابط حجز باسمك، تذكير تلقائي، لوحة تحكم، وتطبيق جوال باسم نشاطك.',
  // Sales contact — replace with the real ones before launch.
  whatsapp: '201055673184',
  email: 'hello@mawid.app',
  currency: 'ر.س',
};

export const whatsappLink = (text = 'السلام عليكم، حابب أعرف تفاصيل نظام موعِد لنشاطي') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
