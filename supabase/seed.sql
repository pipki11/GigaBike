-- ===========================================================
-- GigaBike — seed data (matches packages/supabase/src/seed.ts)
-- Idempotent: safe to re-run.
-- ===========================================================

-- ---------- shop ----------
insert into public.shop_settings (id, name, tagline, phone, whatsapp, facebook, email, address, hours)
values (1, 'GigaBike', 'Ride into the city.', '+995 555 12 34 56', '995555123456', 'gigabike',
        'hello@gigabike.ge', '14 Aghmashenebeli Ave, Tbilisi, Georgia', 'Mon–Sat · 10:00–20:00')
on conflict (id) do update set
  name = excluded.name, tagline = excluded.tagline, phone = excluded.phone, whatsapp = excluded.whatsapp,
  facebook = excluded.facebook, email = excluded.email, address = excluded.address, hours = excluded.hours;

-- ---------- categories ----------
insert into public.categories (id, name_en, name_ka, name_ru, blurb, hue, sort) values
  ('electric', 'Electric', 'ელექტრო',  'Электро',   'Power-assisted rides', 293, 0),
  ('city',     'City',     'ქალაქის',  'Городские', 'Everyday commuting',   258, 1),
  ('mountain', 'Mountain', 'მთის',     'Горные',    'Built for the trail',  342, 2),
  ('kids',     'Kids',     'საბავშვო', 'Детские',   'Small wheels, big fun',315, 3)
on conflict (id) do update set
  name_en = excluded.name_en, name_ka = excluded.name_ka, name_ru = excluded.name_ru,
  blurb = excluded.blurb, hue = excluded.hue, sort = excluded.sort;

-- ---------- bikes ----------
insert into public.bikes (id, slug, name, category_id, price, condition, featured, description, keywords, gallery, hue) values
  ('volt-e1','volt-e1','Volt E1 Commuter','electric',1890,'New',true,'Mid-drive electric commuter with a 70 km range and integrated lights.','{electric,commuter,city,"long range","hydraulic brakes"}',4,293),
  ('trailhawk-29','trailhawk-29','TrailHawk 29','mountain',1240,'New',true,'29-inch hardtail with hydraulic disc brakes and a 12-speed drivetrain.','{mountain,"29 inch",hardtail,"hydraulic brakes",trail}',4,342),
  ('metro-7','metro-7','Metro 7 City','city',620,'New',true,'Lightweight aluminium city bike with a 7-speed gearset and rack mounts.','{city,commuter,lightweight,"7 speed"}',3,258),
  ('spark-jr','spark-jr','Spark Junior 20','kids',280,'New',true,'A confident first bike for ages 6–9 with training-wheel mounts.','{kids,"20 inch",junior,"first bike"}',3,315),
  ('volt-x','volt-x','Volt X Fat Tire','electric',2350,'New',false,'Fat-tire e-bike with a 750W motor for any terrain or season.','{electric,"fat tire",750w,"off road","all terrain"}',4,293),
  ('ridge-pro','ridge-pro','Ridge Pro Enduro','mountain',2180,'New',false,'Full-suspension enduro frame with 160 mm travel and a dropper post.','{mountain,"full suspension",enduro,"dropper post"}',4,342),
  ('metro-step','metro-step','Metro Step-Through','city',540,'New',false,'Step-through frame, upright posture and a comfy saddle for easy riding.','{city,"step through",comfort,commuter}',3,258),
  ('breeze-3','breeze-3','Breeze 3-Speed','city',460,'Used',false,'Classic 3-speed cruiser, recently serviced and ready to roll.','{city,cruiser,"3 speed",used,serviced}',3,258),
  ('rocky-24','rocky-24','Rocky Kids 24','kids',340,'New',false,'A 24-inch trail-ready bike for older kids with real gears and disc brakes.','{kids,"24 inch",gears,"disc brakes"}',3,315),
  ('volt-lite','volt-lite','Volt Lite Folding','electric',1450,'New',false,'Folding e-bike that fits under a desk — perfect for mixed commutes.','{electric,folding,compact,commute,lightweight}',4,293),
  ('summit-xc','summit-xc','Summit XC Carbon','mountain',2640,'New',false,'Carbon cross-country racer built to climb fast and descend faster.','{mountain,carbon,xc,race,lightweight}',4,342),
  ('tiny-12','tiny-12','Tiny Rider 12','kids',160,'New',false,'Balance-to-pedal starter bike for the littlest riders, ages 2–4.','{kids,"12 inch",balance,toddler}',3,315)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, category_id = excluded.category_id, price = excluded.price,
  condition = excluded.condition, featured = excluded.featured, description = excluded.description,
  keywords = excluded.keywords, gallery = excluded.gallery, hue = excluded.hue;

-- ---------- repair groups ----------
insert into public.repair_groups (id, icon, title_en, title_ka, title_ru, blurb_en, blurb_ka, blurb_ru, sort) values
  ('brakes','shield','Brake service','მუხრუჭების სერვისი','Сервис тормозов','Sharp, safe, confident stopping.','მკვეთრი და უსაფრთხო დამუხრუჭება.','Чёткое и безопасное торможение.',0),
  ('wheels','wheel','Wheels & tyres','დისკებისა და საბურავების სერვისი','Сервис колёс и шин','True wheels, reliable rolling.','სწორი ბორბლები და საიმედო სვლა.','Ровные колёса и надёжный ход.',1),
  ('drivetrain','wrench','Gears & chain','სიჩქარეებისა და ჯაჭვის სერვისი','Сервис передач и цепи','Smooth shifting, every gear.','გლუვი გადართვა ყველა გადაცემაზე.','Плавное переключение передач.',2)
on conflict (id) do update set
  icon = excluded.icon, title_en = excluded.title_en, title_ka = excluded.title_ka, title_ru = excluded.title_ru,
  blurb_en = excluded.blurb_en, blurb_ka = excluded.blurb_ka, blurb_ru = excluded.blurb_ru, sort = excluded.sort;

-- ---------- repair services ----------
-- Wipe + reinsert so re-running stays clean (no natural unique key on names).
delete from public.repair_services;
insert into public.repair_services (group_id, price, name_en, name_ka, name_ru, sort) values
  ('brakes','15 ₾','Brake adjustment','მუხრუჭების რეგულირება','Регулировка тормозов',0),
  ('brakes','20 ₾','U/V-brake service','U-V მუხრუჭების სერვისი','Сервис U/V тормозов',1),
  ('brakes','25 ₾','Brake system setup','სამუხრუჭე სისტემის დაყენება','Установка тормозной системы',2),
  ('brakes','40 ₾','Brake system replacement','სამუხრუჭე სისტემის შეცვლა','Замена тормозной системы',3),
  ('brakes','20 ₾','Brake pad replacement','ხუნდების შეცვლა','Замена тормозных колодок',4),
  ('brakes','25 ₾','Brake lever replacement','სახელურების შეცვლა','Замена тормозных ручек',5),
  ('wheels','10 ₾','Puncture patch','ლაპკა','Заклейка прокола',0),
  ('wheels','15 ₾','Tyre & tube replacement','საბურავ-კამერის შეცვლა','Замена покрышки и камеры',1),
  ('wheels','20 ₾','Wheel truing','დისკის გასწორება','Правка колеса',2),
  ('wheels','25 ₾','Spoke tensioning','დისკის გაჭიმვა','Натяжка спиц',3),
  ('wheels','10 ₾','Rim tape replacement','ლენტის შეცვლა','Замена ободной ленты',4),
  ('drivetrain','20 ₾','Chain service','ჯაჭვის სერვისი','Сервис цепи',0),
  ('drivetrain','20 ₾','Setup / adjustment','დაყენება / რეგულირება','Установка / регулировка',1),
  ('drivetrain','35 ₾','Gears replacement','სიჩქარეების შეცვლა','Замена передач',2),
  ('drivetrain','30 ₾','Derailleur replacement','გადამრთველების შეცვლა','Замена переключателей',3),
  ('drivetrain','25 ₾','Replacement service','ჩანაცვლება სერვისი','Сервис замены',4);
