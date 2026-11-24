-- CreateEnum
CREATE TYPE "EquipmentCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "RentalPricingUnit" AS ENUM ('HOURLY', 'DAILY');

-- CreateEnum
CREATE TYPE "EquipmentRentalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'RETURNED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Equipment" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "condition" "EquipmentCondition" NOT NULL DEFAULT 'GOOD',
    "specifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "dailyRate" DECIMAL(10,2),
    "pricingUnit" "RentalPricingUnit" NOT NULL DEFAULT 'HOURLY',
    "minimumRentalHours" INTEGER NOT NULL DEFAULT 1,
    "maximumRentalHours" INTEGER,
    "totalQuantity" INTEGER NOT NULL DEFAULT 1,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentRental" (
    "id" UUID NOT NULL,
    "equipmentId" UUID NOT NULL,
    "creatorId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "rentalRate" DECIMAL(10,2) NOT NULL,
    "pricingUnit" "RentalPricingUnit" NOT NULL DEFAULT 'HOURLY',
    "duration" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "EquipmentRentalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentRental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Equipment_providerId_idx" ON "Equipment"("providerId");

-- CreateIndex
CREATE INDEX "Equipment_category_idx" ON "Equipment"("category");

-- CreateIndex
CREATE INDEX "Equipment_city_idx" ON "Equipment"("city");

-- CreateIndex
CREATE INDEX "Equipment_isActive_isArchived_idx" ON "Equipment"("isActive", "isArchived");

-- CreateIndex
CREATE INDEX "EquipmentRental_equipmentId_idx" ON "EquipmentRental"("equipmentId");

-- CreateIndex
CREATE INDEX "EquipmentRental_creatorId_idx" ON "EquipmentRental"("creatorId");

-- CreateIndex
CREATE INDEX "EquipmentRental_providerId_idx" ON "EquipmentRental"("providerId");

-- CreateIndex
CREATE INDEX "EquipmentRental_status_idx" ON "EquipmentRental"("status");

-- CreateIndex
CREATE INDEX "EquipmentRental_equipmentId_startTime_endTime_idx" ON "EquipmentRental"("equipmentId", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentRental" ADD CONSTRAINT "EquipmentRental_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentRental" ADD CONSTRAINT "EquipmentRental_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentRental" ADD CONSTRAINT "EquipmentRental_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
