-- Помещения (PRO ROOM / LIGHT ROOM в Москве, одна студия в Петербурге)
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rooms_studioId_slug_key" ON "rooms"("studioId", "slug");

ALTER TABLE "rooms" ADD CONSTRAINT "rooms_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Базовые помещения
INSERT INTO "rooms" ("id", "studioId", "slug", "name", "description", "image", "sortOrder", "isActive", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    st."id",
    v.slug,
    v.name,
    v.description,
    v.image,
    v.sort_order,
    true,
    NOW(),
    NOW()
FROM "studios" st
JOIN (VALUES
    ('moscow', 'pro-room',   'PRO ROOM',   'Премиум-комната: мониторинг, топовые микрофоны, комфортная работа с инженером.', '/images/moscow/studio/stu1.jpg', 0),
    ('moscow', 'light-room', 'LIGHT ROOM', 'Светлая комната для вокала и быстрых демо: микрофон, наушники, уютная атмосфера.', '/images/moscow/studio/stu2.jpg', 1),
    ('spb',    'main',       'БЛИЗКИЕ',    'Основная студия в Петербурге: запись вокала, продакшн и сведение.', '/images/spb/studio/stu1.jpg', 0)
) AS v(studio_slug, slug, name, description, image, sort_order)
    ON v.studio_slug = st."slug"
ON CONFLICT ("studioId", "slug") DO NOTHING;

-- Услуга может принадлежать помещению (null — доступна в любом помещении города)
ALTER TABLE "services" ADD COLUMN "roomId" TEXT;
ALTER TABLE "services" ADD COLUMN "requiresSchedule" BOOLEAN NOT NULL DEFAULT true;

UPDATE "services" svc
SET "roomId" = r."id"
FROM "rooms" r, "studios" st
WHERE svc."studioId" = st."id"
  AND r."studioId" = st."id"
  AND (
      (st."slug" = 'moscow' AND svc."slug" = 'rent-light-room' AND r."slug" = 'light-room')
      OR (st."slug" = 'moscow' AND svc."slug" = 'rent-pro-room' AND r."slug" = 'pro-room')
      OR (st."slug" = 'spb' AND svc."slug" = 'rent' AND r."slug" = 'main')
  );

-- Удалённые услуги не требуют даты и времени
UPDATE "services"
SET "requiresSchedule" = false
WHERE "slug" IN ('mixing', 'mastering', 'distribution', 'beat-custom');

CREATE INDEX "services_roomId_idx" ON "services"("roomId");

ALTER TABLE "services" ADD CONSTRAINT "services_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Заявка может быть гостевой
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";
ALTER TABLE "bookings" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD COLUMN "roomId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "name" TEXT;
ALTER TABLE "bookings" ADD COLUMN "phone" TEXT;
ALTER TABLE "bookings" ADD COLUMN "telegram" TEXT;
ALTER TABLE "bookings" ADD COLUMN "total" INTEGER NOT NULL DEFAULT 0;

-- Запись может быть без даты и времени (удалённые услуги)
ALTER TABLE "bookings" ALTER COLUMN "date" DROP NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "time" DROP NOT NULL;

-- Позиции заявки: одна бронь — несколько услуг
CREATE TABLE "booking_items" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id")
);

-- Переносим старые одиночные услуги в позиции
INSERT INTO "booking_items" ("id", "bookingId", "serviceId", "name", "price", "duration")
SELECT
    gen_random_uuid()::text,
    b."id",
    b."serviceId",
    COALESCE(s."name", 'Услуга'),
    COALESCE(s."price", 0),
    COALESCE(s."duration", 0)
FROM "bookings" b
LEFT JOIN "services" s ON s."id" = b."serviceId";

UPDATE "bookings" b
SET "total" = COALESCE((SELECT SUM(bi."price") FROM "booking_items" bi WHERE bi."bookingId" = b."id"), 0);

-- Помещение старой заявки — помещение её услуги
UPDATE "bookings" b
SET "roomId" = s."roomId"
FROM "services" s
WHERE s."id" = b."serviceId" AND s."roomId" IS NOT NULL;

-- Контакты старых заявок: имя из аккаунта, телефон неизвестен
UPDATE "bookings" b
SET "name" = COALESCE(u."name", '')
FROM "users" u
WHERE u."id" = b."userId";

UPDATE "bookings" SET "name" = '' WHERE "name" IS NULL;
UPDATE "bookings" SET "phone" = '' WHERE "phone" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "phone" SET NOT NULL;

-- Старое одиночное поле услуги больше не нужно
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_serviceId_fkey";
ALTER TABLE "bookings" DROP COLUMN "serviceId";

CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_roomId_idx" ON "bookings"("roomId");
CREATE INDEX "bookings_date_idx" ON "bookings"("date");

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "booking_items_bookingId_idx" ON "booking_items"("bookingId");

ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
