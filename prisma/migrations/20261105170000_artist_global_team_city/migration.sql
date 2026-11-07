-- Артисты больше не привязаны к городу/студии
ALTER TABLE "artists" DROP CONSTRAINT "artists_studioId_fkey";
DROP INDEX "artists_studioId_slug_key";
ALTER TABLE "artists" DROP COLUMN "studioId";
CREATE UNIQUE INDEX "artists_slug_key" ON "artists"("slug");

-- Участник команды может быть привязан к городу (null — во всех городах)
ALTER TABLE "team_members" ADD COLUMN "studioId" TEXT;
CREATE INDEX "team_members_studioId_idx" ON "team_members"("studioId");
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
