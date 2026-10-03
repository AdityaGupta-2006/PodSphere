-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PROVIDER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "gear" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "studioId" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Studio_providerId_idx" ON "Studio"("providerId");

-- CreateIndex
CREATE INDEX "Booking_creatorId_idx" ON "Booking"("creatorId");

-- CreateIndex
CREATE INDEX "Booking_studioId_idx" ON "Booking"("studioId");

-- CreateIndex
CREATE INDEX "Booking_studioId_startTime_endTime_idx" ON "Booking"("studioId", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "Studio" ADD CONSTRAINT "Studio_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
