// Everything a buyer-facing page shows about the product lives here — change it once.
export const site = {
  name: 'موعِد',
  nameEn: 'Mawid',
  tagline: 'نظام مواعيد العيادات الأذكى في الخليج',
  description:
    'موعِد نظام حجز مواعيد عربي متكامل للعيادات والمجمعات الطبية: رابط حجز باسم عيادتك، جدول لكل طبيب، تذكير تلقائي للمرضى، لوحة تحكم، وتطبيق جوال باسم العيادة.',
  // Sales contact — replace with the real ones before launch.
  whatsapp: '201055673184',
  email: 'hello@mawid.app',
  currency: 'ر.س',
};

export const whatsappLink = (text = 'السلام عليكم، حابب أعرف تفاصيل نظام موعِد لعيادتي') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
