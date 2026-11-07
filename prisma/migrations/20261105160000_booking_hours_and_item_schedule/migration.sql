-- Количество часов сессии в брони (влияет на сумму)
ALTER TABLE "bookings" ADD COLUMN "hours" INTEGER NOT NULL DEFAULT 1;

-- Снимок флага «требует даты/времени» в позиции брони (для пересчёта суммы)
ALTER TABLE "booking_items" ADD COLUMN "requiresSchedule" BOOLEAN NOT NULL DEFAULT true;

UPDATE "booking_items" bi
SET "requiresSchedule" = s."requiresSchedule"
FROM "services" s
WHERE s."id" = bi."serviceId";
