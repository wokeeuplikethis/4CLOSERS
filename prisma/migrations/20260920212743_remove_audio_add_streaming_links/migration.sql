/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `tracks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tracks" DROP COLUMN "audioUrl",
ADD COLUMN     "spotifyUrl" TEXT,
ADD COLUMN     "vkUrl" TEXT,
ADD COLUMN     "yandexUrl" TEXT;
