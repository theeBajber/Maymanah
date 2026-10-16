-- CreateTable
CREATE TABLE "Ijazah" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "courseTitle" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "certificateUrl" TEXT,
    "certificatePdfUrl" TEXT,
    "verificationCode" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ijazah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ijazah_verificationCode_key" ON "Ijazah"("verificationCode");

-- CreateIndex
CREATE INDEX "Ijazah_userId_idx" ON "Ijazah"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ijazah_userId_courseId_key" ON "Ijazah"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "Ijazah" ADD CONSTRAINT "Ijazah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ijazah" ADD CONSTRAINT "Ijazah_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

