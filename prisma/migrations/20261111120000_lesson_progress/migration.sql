-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED');

-- CreateTable
CREATE TABLE "surah_meta" (
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ayahCount" INTEGER NOT NULL,

    CONSTRAINT "surah_meta_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "LessonReport" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "attendance" "AttendanceStatus" NOT NULL,
    "fromSurah" INTEGER,
    "fromVerse" INTEGER,
    "toSurah" INTEGER,
    "toVerse" INTEGER,
    "revision" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "nextAssignment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemorizedRange" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reportId" TEXT,
    "startSurah" INTEGER NOT NULL,
    "startAyah" INTEGER NOT NULL,
    "endSurah" INTEGER NOT NULL,
    "endAyah" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemorizedRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonJoin" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonJoin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonReport_appointmentId_key" ON "LessonReport"("appointmentId");

-- CreateIndex
CREATE INDEX "LessonReport_submittedById_idx" ON "LessonReport"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "MemorizedRange_reportId_key" ON "MemorizedRange"("reportId");

-- CreateIndex
CREATE INDEX "MemorizedRange_studentId_idx" ON "MemorizedRange"("studentId");

-- CreateIndex
CREATE INDEX "LessonJoin_appointmentId_idx" ON "LessonJoin"("appointmentId");

-- CreateIndex
CREATE INDEX "LessonJoin_userId_idx" ON "LessonJoin"("userId");

-- AddForeignKey
ALTER TABLE "LessonReport" ADD CONSTRAINT "LessonReport_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonReport" ADD CONSTRAINT "LessonReport_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorizedRange" ADD CONSTRAINT "MemorizedRange_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorizedRange" ADD CONSTRAINT "MemorizedRange_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "LessonReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonJoin" ADD CONSTRAINT "LessonJoin_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonJoin" ADD CONSTRAINT "LessonJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- The 114 surahs, from the Tanzil metadata (CC-BY). Re-running the seed is
-- harmless: a row is refreshed rather than duplicated.
INSERT INTO "surah_meta" ("number", "name", "ayahCount") VALUES
(1, 'Al-Faatiha', 7),
(2, 'Al-Baqara', 286),
(3, 'Aal-i-Imraan', 200),
(4, 'An-Nisaa', 176),
(5, 'Al-Maaida', 120),
(6, 'Al-An''aam', 165),
(7, 'Al-A''raaf', 206),
(8, 'Al-Anfaal', 75),
(9, 'At-Tawba', 129),
(10, 'Yunus', 109),
(11, 'Hud', 123),
(12, 'Yusuf', 111),
(13, 'Ar-Ra''d', 43),
(14, 'Ibrahim', 52),
(15, 'Al-Hijr', 99),
(16, 'An-Nahl', 128),
(17, 'Al-Israa', 111),
(18, 'Al-Kahf', 110),
(19, 'Maryam', 98),
(20, 'Taa-Haa', 135),
(21, 'Al-Anbiyaa', 112),
(22, 'Al-Hajj', 78),
(23, 'Al-Muminoon', 118),
(24, 'An-Noor', 64),
(25, 'Al-Furqaan', 77),
(26, 'Ash-Shu''araa', 227),
(27, 'An-Naml', 93),
(28, 'Al-Qasas', 88),
(29, 'Al-Ankaboot', 69),
(30, 'Ar-Room', 60),
(31, 'Luqman', 34),
(32, 'As-Sajda', 30),
(33, 'Al-Ahzaab', 73),
(34, 'Saba', 54),
(35, 'Faatir', 45),
(36, 'Yaseen', 83),
(37, 'As-Saaffaat', 182),
(38, 'Saad', 88),
(39, 'Az-Zumar', 75),
(40, 'Al-Ghaafir', 85),
(41, 'Fussilat', 54),
(42, 'Ash-Shura', 53),
(43, 'Az-Zukhruf', 89),
(44, 'Ad-Dukhaan', 59),
(45, 'Al-Jaathiya', 37),
(46, 'Al-Ahqaf', 35),
(47, 'Muhammad', 38),
(48, 'Al-Fath', 29),
(49, 'Al-Hujuraat', 18),
(50, 'Qaaf', 45),
(51, 'Adh-Dhaariyat', 60),
(52, 'At-Tur', 49),
(53, 'An-Najm', 62),
(54, 'Al-Qamar', 55),
(55, 'Ar-Rahmaan', 78),
(56, 'Al-Waaqia', 96),
(57, 'Al-Hadid', 29),
(58, 'Al-Mujaadila', 22),
(59, 'Al-Hashr', 24),
(60, 'Al-Mumtahana', 13),
(61, 'As-Saff', 14),
(62, 'Al-Jumu''a', 11),
(63, 'Al-Munaafiqoon', 11),
(64, 'At-Taghaabun', 18),
(65, 'At-Talaaq', 12),
(66, 'At-Tahrim', 12),
(67, 'Al-Mulk', 30),
(68, 'Al-Qalam', 52),
(69, 'Al-Haaqqa', 52),
(70, 'Al-Ma''aarij', 44),
(71, 'Nooh', 28),
(72, 'Al-Jinn', 28),
(73, 'Al-Muzzammil', 20),
(74, 'Al-Muddaththir', 56),
(75, 'Al-Qiyaama', 40),
(76, 'Al-Insaan', 31),
(77, 'Al-Mursalaat', 50),
(78, 'An-Naba', 40),
(79, 'An-Naazi''aat', 46),
(80, 'Abasa', 42),
(81, 'At-Takwir', 29),
(82, 'Al-Infitaar', 19),
(83, 'Al-Mutaffifin', 36),
(84, 'Al-Inshiqaaq', 25),
(85, 'Al-Burooj', 22),
(86, 'At-Taariq', 17),
(87, 'Al-A''laa', 19),
(88, 'Al-Ghaashiya', 26),
(89, 'Al-Fajr', 30),
(90, 'Al-Balad', 20),
(91, 'Ash-Shams', 15),
(92, 'Al-Lail', 21),
(93, 'Ad-Dhuhaa', 11),
(94, 'Ash-Sharh', 8),
(95, 'At-Tin', 8),
(96, 'Al-Alaq', 19),
(97, 'Al-Qadr', 5),
(98, 'Al-Bayyina', 8),
(99, 'Az-Zalzala', 8),
(100, 'Al-Aadiyaat', 11),
(101, 'Al-Qaari''a', 11),
(102, 'At-Takaathur', 8),
(103, 'Al-Asr', 3),
(104, 'Al-Humaza', 9),
(105, 'Al-Fil', 5),
(106, 'Quraish', 4),
(107, 'Al-Maa''un', 7),
(108, 'Al-Kawthar', 3),
(109, 'Al-Kaafiroon', 6),
(110, 'An-Nasr', 3),
(111, 'Al-Masad', 5),
(112, 'Al-Ikhlaas', 4),
(113, 'Al-Falaq', 5),
(114, 'An-Naas', 6)
ON CONFLICT ("number") DO UPDATE SET "name" = EXCLUDED."name", "ayahCount" = EXCLUDED."ayahCount";
