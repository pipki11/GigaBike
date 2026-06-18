/* ===========================================================
   GigaBike — seed data (ported 1:1 from the design's data.jsx)
   Used as a fallback when Supabase env is not configured, and
   as the source for supabase/seed.sql.
   =========================================================== */
import type { Bike, Category, RepairGroup, ShopSettings } from "./types";

export const SEED_SHOP: ShopSettings = {
  name: "GigaBike",
  tagline: "Ride into the city.",
  phone: "+995 555 12 34 56",
  whatsapp: "995555123456",
  facebook: "gigabike",
  email: "hello@gigabike.ge",
  address: "14 Aghmashenebeli Ave, Tbilisi, Georgia",
  hours: "Mon–Sat · 10:00–20:00",
};

export const SEED_CATEGORIES: Category[] = [
  { id: "electric", name_en: "Electric", name_ka: "ელექტრო", name_ru: "Электро", blurb: "Power-assisted rides", hue: 293, sort: 0 },
  { id: "city", name_en: "City", name_ka: "ქალაქის", name_ru: "Городские", blurb: "Everyday commuting", hue: 258, sort: 1 },
  { id: "mountain", name_en: "Mountain", name_ka: "მთის", name_ru: "Горные", blurb: "Built for the trail", hue: 342, sort: 2 },
  { id: "kids", name_en: "Kids", name_ka: "საბავშვო", name_ru: "Детские", blurb: "Small wheels, big fun", hue: 315, sort: 3 },
];

export const SEED_BIKES: Bike[] = [
  { id: "volt-e1", slug: "volt-e1", name: "Volt E1 Commuter", category_id: "electric", price: 1890, condition: "New", featured: true,
    description: "Mid-drive electric commuter with a 70 km range and integrated lights.",
    keywords: ["electric", "commuter", "city", "long range", "hydraulic brakes"], gallery: 4, hue: 293, image_urls: [] },
  { id: "trailhawk-29", slug: "trailhawk-29", name: "TrailHawk 29", category_id: "mountain", price: 1240, condition: "New", featured: true,
    description: "29-inch hardtail with hydraulic disc brakes and a 12-speed drivetrain.",
    keywords: ["mountain", "29 inch", "hardtail", "hydraulic brakes", "trail"], gallery: 4, hue: 342, image_urls: [] },
  { id: "metro-7", slug: "metro-7", name: "Metro 7 City", category_id: "city", price: 620, condition: "New", featured: true,
    description: "Lightweight aluminium city bike with a 7-speed gearset and rack mounts.",
    keywords: ["city", "commuter", "lightweight", "7 speed"], gallery: 3, hue: 258, image_urls: [] },
  { id: "spark-jr", slug: "spark-jr", name: "Spark Junior 20", category_id: "kids", price: 280, condition: "New", featured: true,
    description: "A confident first bike for ages 6–9 with training-wheel mounts.",
    keywords: ["kids", "20 inch", "junior", "first bike"], gallery: 3, hue: 315, image_urls: [] },
  { id: "volt-x", slug: "volt-x", name: "Volt X Fat Tire", category_id: "electric", price: 2350, condition: "New", featured: false,
    description: "Fat-tire e-bike with a 750W motor for any terrain or season.",
    keywords: ["electric", "fat tire", "750w", "off road", "all terrain"], gallery: 4, hue: 293, image_urls: [] },
  { id: "ridge-pro", slug: "ridge-pro", name: "Ridge Pro Enduro", category_id: "mountain", price: 2180, condition: "New", featured: false,
    description: "Full-suspension enduro frame with 160 mm travel and a dropper post.",
    keywords: ["mountain", "full suspension", "enduro", "dropper post"], gallery: 4, hue: 342, image_urls: [] },
  { id: "metro-step", slug: "metro-step", name: "Metro Step-Through", category_id: "city", price: 540, condition: "New", featured: false,
    description: "Step-through frame, upright posture and a comfy saddle for easy riding.",
    keywords: ["city", "step through", "comfort", "commuter"], gallery: 3, hue: 258, image_urls: [] },
  { id: "breeze-3", slug: "breeze-3", name: "Breeze 3-Speed", category_id: "city", price: 460, condition: "Used", featured: false,
    description: "Classic 3-speed cruiser, recently serviced and ready to roll.",
    keywords: ["city", "cruiser", "3 speed", "used", "serviced"], gallery: 3, hue: 258, image_urls: [] },
  { id: "rocky-24", slug: "rocky-24", name: "Rocky Kids 24", category_id: "kids", price: 340, condition: "New", featured: false,
    description: "A 24-inch trail-ready bike for older kids with real gears and disc brakes.",
    keywords: ["kids", "24 inch", "gears", "disc brakes"], gallery: 3, hue: 315, image_urls: [] },
  { id: "volt-lite", slug: "volt-lite", name: "Volt Lite Folding", category_id: "electric", price: 1450, condition: "New", featured: false,
    description: "Folding e-bike that fits under a desk — perfect for mixed commutes.",
    keywords: ["electric", "folding", "compact", "commute", "lightweight"], gallery: 4, hue: 293, image_urls: [] },
  { id: "summit-xc", slug: "summit-xc", name: "Summit XC Carbon", category_id: "mountain", price: 2640, condition: "New", featured: false,
    description: "Carbon cross-country racer built to climb fast and descend faster.",
    keywords: ["mountain", "carbon", "xc", "race", "lightweight"], gallery: 4, hue: 342, image_urls: [] },
  { id: "tiny-12", slug: "tiny-12", name: "Tiny Rider 12", category_id: "kids", price: 160, condition: "New", featured: false,
    description: "Balance-to-pedal starter bike for the littlest riders, ages 2–4.",
    keywords: ["kids", "12 inch", "balance", "toddler"], gallery: 3, hue: 315, image_urls: [] },
];

export const SEED_REPAIR_GROUPS: RepairGroup[] = [
  {
    id: "brakes", icon: "shield", sort: 0,
    title_en: "Brake service", title_ka: "მუხრუჭების სერვისი", title_ru: "Сервис тормозов",
    blurb_en: "Sharp, safe, confident stopping.", blurb_ka: "მკვეთრი და უსაფრთხო დამუხრუჭება.", blurb_ru: "Чёткое и безопасное торможение.",
    items: [
      { id: "brakes-1", group_id: "brakes", sort: 0, price: "15 ₾", name_en: "Brake adjustment", name_ka: "მუხრუჭების რეგულირება", name_ru: "Регулировка тормозов" },
      { id: "brakes-2", group_id: "brakes", sort: 1, price: "20 ₾", name_en: "U/V-brake service", name_ka: "U-V მუხრუჭების სერვისი", name_ru: "Сервис U/V тормозов" },
      { id: "brakes-3", group_id: "brakes", sort: 2, price: "25 ₾", name_en: "Brake system setup", name_ka: "სამუხრუჭე სისტემის დაყენება", name_ru: "Установка тормозной системы" },
      { id: "brakes-4", group_id: "brakes", sort: 3, price: "40 ₾", name_en: "Brake system replacement", name_ka: "სამუხრუჭე სისტემის შეცვლა", name_ru: "Замена тормозной системы" },
      { id: "brakes-5", group_id: "brakes", sort: 4, price: "20 ₾", name_en: "Brake pad replacement", name_ka: "ხუნდების შეცვლა", name_ru: "Замена тормозных колодок" },
      { id: "brakes-6", group_id: "brakes", sort: 5, price: "25 ₾", name_en: "Brake lever replacement", name_ka: "სახელურების შეცვლა", name_ru: "Замена тормозных ручек" },
    ],
  },
  {
    id: "wheels", icon: "wheel", sort: 1,
    title_en: "Wheels & tyres", title_ka: "დისკებისა და საბურავების სერვისი", title_ru: "Сервис колёс и шин",
    blurb_en: "True wheels, reliable rolling.", blurb_ka: "სწორი ბორბლები და საიმედო სვლა.", blurb_ru: "Ровные колёса и надёжный ход.",
    items: [
      { id: "wheels-1", group_id: "wheels", sort: 0, price: "10 ₾", name_en: "Puncture patch", name_ka: "ლაპკა", name_ru: "Заклейка прокола" },
      { id: "wheels-2", group_id: "wheels", sort: 1, price: "15 ₾", name_en: "Tyre & tube replacement", name_ka: "საბურავ-კამერის შეცვლა", name_ru: "Замена покрышки и камеры" },
      { id: "wheels-3", group_id: "wheels", sort: 2, price: "20 ₾", name_en: "Wheel truing", name_ka: "დისკის გასწორება", name_ru: "Правка колеса" },
      { id: "wheels-4", group_id: "wheels", sort: 3, price: "25 ₾", name_en: "Spoke tensioning", name_ka: "დისკის გაჭიმვა", name_ru: "Натяжка спиц" },
      { id: "wheels-5", group_id: "wheels", sort: 4, price: "10 ₾", name_en: "Rim tape replacement", name_ka: "ლენტის შეცვლა", name_ru: "Замена ободной ленты" },
    ],
  },
  {
    id: "drivetrain", icon: "wrench", sort: 2,
    title_en: "Gears & chain", title_ka: "სიჩქარეებისა და ჯაჭვის სერვისი", title_ru: "Сервис передач и цепи",
    blurb_en: "Smooth shifting, every gear.", blurb_ka: "გლუვი გადართვა ყველა გადაცემაზე.", blurb_ru: "Плавное переключение передач.",
    items: [
      { id: "drivetrain-1", group_id: "drivetrain", sort: 0, price: "20 ₾", name_en: "Chain service", name_ka: "ჯაჭვის სერვისი", name_ru: "Сервис цепи" },
      { id: "drivetrain-2", group_id: "drivetrain", sort: 1, price: "20 ₾", name_en: "Setup / adjustment", name_ka: "დაყენება / რეგულირება", name_ru: "Установка / регулировка" },
      { id: "drivetrain-3", group_id: "drivetrain", sort: 2, price: "35 ₾", name_en: "Gears replacement", name_ka: "სიჩქარეების შეცვლა", name_ru: "Замена передач" },
      { id: "drivetrain-4", group_id: "drivetrain", sort: 3, price: "30 ₾", name_en: "Derailleur replacement", name_ka: "გადამრთველების შეცვლა", name_ru: "Замена переключателей" },
      { id: "drivetrain-5", group_id: "drivetrain", sort: 4, price: "25 ₾", name_en: "Replacement service", name_ka: "ჩანაცვლება სერვისი", name_ru: "Сервис замены" },
    ],
  },
];
