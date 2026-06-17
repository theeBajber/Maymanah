import 'dotenv/config';
import { PrismaClient, CourseCategory, UserRole, AssessmentType } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { hash } from 'bcryptjs';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_TEACHER_PASSWORD || !process.env.SEED_STUDENT_PASSWORD) {
    throw new Error('Missing SEED_*_PASSWORD env vars — check your .env file');
  }
  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPassword   = await hash(process.env.SEED_ADMIN_PASSWORD!,   12);
  const teacherPassword = await hash(process.env.SEED_TEACHER_PASSWORD!, 12);
  const studentPassword = await hash(process.env.SEED_STUDENT_PASSWORD!, 12);

  await prisma.user.upsert({
    where:  { email: 'admin@maymanah.com' },
    update: {},
    create: {
      email:         'admin@maymanah.com',
      name:          'Admin User',
      password:      adminPassword,
      role:          UserRole.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          bio:      'Platform administrator',
          timezone: 'Africa/Nairobi',
          country:  'KE',
          language: 'en',
        },
      },
    },
  });

  const teacher = await prisma.user.upsert({
    where:  { email: 'ustadh.ibrahim@maymanah.com' },
    update: {},
    create: {
      email:         'ustadh.ibrahim@maymanah.com',
      name:          'Ustadh Ibrahim Al-Farouq',
      password:      teacherPassword,
      role:          UserRole.TEACHER,
      emailVerified: new Date(),
      profile: {
        create: {
          bio:        'Hafiz with ijazah in Hafs an Asim. 10+ years teaching Tajweed and Hifdh.',
          timezone:   'Africa/Nairobi',
          country:    'KE',
          quranLevel: 'advanced',
          language:   'en',
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where:  { email: 'student@maymanah.com' },
    update: {},
    create: {
      email:         'student@maymanah.com',
      name:          'Aisha Mwangi',
      password:      studentPassword,
      role:          UserRole.STUDENT,
      emailVerified: new Date(),
      profile: {
        create: {
          bio:        'Beginner student, working through Tajweed foundations.',
          timezone:   'Africa/Nairobi',
          country:    'KE',
          quranLevel: 'beginner',
          language:   'en',
        },
      },
    },
  });

  console.log('✔ Users seeded');

  // ─── Courses + Lessons ────────────────────────────────────────────────────
  const coursesData = [
    {
      title:       'Tajweed Foundations',
      slug:        'tajweed-foundations',
      description: 'A self-paced introduction to the rules of Tajweed. Covers Makharij, Sifaat, Noon Sakinah, Meem Sakinah, and Madd rules — complete with audio examples and interactive exercises.',
      category:    CourseCategory.Quran,
      lessons: [
        { title: 'Introduction to Tajweed',         order: 1, duration: 20, content: 'Overview of Tajweed, its ruling, and why it matters.' },
        { title: 'Makharij al-Huruf — Part 1',      order: 2, duration: 30, content: 'The articulation points of the throat letters: ء ه ع ح غ خ' },
        { title: 'Makharij al-Huruf — Part 2',      order: 3, duration: 30, content: 'Articulation points of the tongue, lips, and nasal cavity.' },
        { title: 'Sifaat al-Huruf',                 order: 4, duration: 25, content: 'Characteristics of letters: Jahr, Hams, Shidda, Tawassut, Rakhawa.' },
        { title: 'Noon Sakinah & Tanween',          order: 5, duration: 35, content: 'The four rules: Idhaar, Idghaam, Iqlaab, and Ikhfaa.' },
        { title: 'Meem Sakinah',                    order: 6, duration: 25, content: 'Ikhfaa Shafawi, Idghaam Shafawi, and Idhaar Shafawi.' },
        { title: 'Madd Rules — Introduction',       order: 7, duration: 30, content: 'Natural Madd (Asli) and its length. Hamzah and Sukoon as causes of Madd.' },
        { title: 'Madd Rules — Far\'i (Extended)',  order: 8, duration: 40, content: 'Madd Wajib Muttasil, Madd Jaiz Munfasil, Madd Aarid lis-Sukoon, and others.' },
        { title: 'Qalqalah',                        order: 9, duration: 20, content: 'The echoing quality of ق ط ب ج د — minor and major Qalqalah.' },
        { title: 'Practical Review & Assessment',   order: 10, duration: 45, content: 'Recitation practice covering all rules learned. Self-assessment checklist.' },
      ],
    },
    {
      title:       'Fiqh of Salah',
      slug:        'fiqh-of-salah',
      description: 'Master the rulings, conditions, and etiquette of the five daily prayers. Covers purification, prayer times, pillars of Salah, common mistakes, and congregational prayer.',
      category:    CourseCategory.Fiqh,
      lessons: [
        { title: 'Importance & Ruling of Salah',       order: 1, duration: 20, content: 'Salah as the second pillar of Islam. Evidence from Quran and Sunnah.' },
        { title: 'Purification — Wudu',                order: 2, duration: 35, content: 'Obligatory and recommended acts of Wudu, nullifiers, and common mistakes.' },
        { title: 'Purification — Ghusl & Tayammum',    order: 3, duration: 30, content: 'When Ghusl is obligatory. How to perform Tayammum and its conditions.' },
        { title: 'Prayer Times',                       order: 4, duration: 25, content: 'The five prayer times, their windows, and how they are calculated.' },
        { title: 'Conditions & Pillars of Salah',      order: 5, duration: 40, content: 'The 9 conditions (Shurut) and 14 pillars (Arkan) of a valid prayer.' },
        { title: 'Wajibat and Sunnan of Salah',        order: 6, duration: 30, content: 'Obligatory acts (Wajibat) and recommended acts (Sunnan al-Ab\'aad).' },
        { title: 'Invalidators of Salah',              order: 7, duration: 25, content: 'Actions that nullify the prayer and require it to be restarted.' },
        { title: 'Congregational Prayer',              order: 8, duration: 35, content: 'Ruling on Jama\'ah, the role of the Imam, and following correctly.' },
        { title: 'Makeup Prayers (Qada)',              order: 9, duration: 20, content: 'When and how to make up missed prayers.' },
        { title: 'Sujud al-Sahw (Prostration of Forgetfulness)', order: 10, duration: 25, content: 'When it is required, how to perform it, and the two positions.' },
      ],
    },
    {
      title:       'Quran Hifdh',
      slug:        'hifdh-ul-quran',
      description: 'A mentor-led Quran memorization journey covering all 30 Juz. Students are paired with a qualified Hafiz for live sessions, revision plans, and progress tracking.',
      category:    CourseCategory.Quran,
      lessons: [
        { title: 'Program Overview & Goal Setting',  order: 1,  duration: 30, content: 'How the Hifdh program works, setting a daily target, and building consistency.' },
        { title: 'Memorization Methodology',         order: 2,  duration: 25, content: 'Proven techniques: repetition cycles, listening before memorizing, and chunking.' },
        { title: 'Juz Amma — Surahs 78–93',          order: 3,  duration: 60, content: 'Memorization and revision of An-Naba through Al-Inshiqaq.' },
        { title: 'Juz Amma — Surahs 94–114',         order: 4,  duration: 60, content: 'Memorization and revision of Ash-Sharh through An-Nas.' },
        { title: 'Revision Strategy',                order: 5,  duration: 20, content: 'How to maintain what you have memorized: daily, weekly, and monthly revision plans.' },
        { title: 'Juz 29 — Selected Surahs',         order: 6,  duration: 90, content: 'Memorization of Al-Mulk, Al-Qalam, Al-Haaqqah, and Al-Ma\'aarij.' },
        { title: 'Live Session: Recitation to Teacher', order: 7, duration: 45, content: 'One-on-one session with Ustadh. Student recites memorized portion for correction.' },
        { title: 'Common Mistakes in Hifdh',         order: 8,  duration: 20, content: 'Ayahs that are frequently confused. Strategies to distinguish similar passages.' },
        { title: 'Dua & Spiritual Preparation',      order: 9,  duration: 15, content: 'Recommended duas for memorization and the spiritual etiquette of a Hafiz.' },
        { title: 'Progress Assessment — Juz Amma',   order: 10, duration: 60, content: 'Full recitation of Juz Amma from memory to the teacher for sign-off.' },
      ],
    },
    {
      title:       'Seerah — Life of the Prophet ﷺ',
      slug:        'seerah-life-of-the-prophet',
      description: 'A chronological journey through the life of Prophet Muhammad ﷺ from birth to the farewell sermon, weaving historical context with lessons for modern life.',
      category:    CourseCategory.History,
      lessons: [
        { title: 'Arabia Before Islam',                   order: 1,  duration: 25, content: 'Political, social, and religious landscape of the Arabian Peninsula before the revelation.' },
        { title: 'Birth & Early Life',                    order: 2,  duration: 30, content: 'The Year of the Elephant, birth of the Prophet ﷺ, his childhood and upbringing.' },
        { title: 'The First Revelation',                  order: 3,  duration: 30, content: 'Events in the Cave of Hira, Surah Al-Alaq, and Khadijah\'s role.' },
        { title: 'The Makkan Period — Early Dawah',       order: 4,  duration: 35, content: 'Secret and public calling to Islam, early converts, and the reaction of Quraysh.' },
        { title: 'Persecution & Patience',                order: 5,  duration: 30, content: 'The torture of the companions, the boycott of Banu Hashim, and the Year of Grief.' },
        { title: 'The Night Journey & Ascension (Isra & Mi\'raj)', order: 6, duration: 35, content: 'The miraculous journey to Jerusalem and ascent through the heavens.' },
        { title: 'The Hijrah to Madinah',                 order: 7,  duration: 40, content: 'The migration, its planning, the journey, and arrival in Madinah.' },
        { title: 'Building the Islamic State in Madinah', order: 8,  duration: 35, content: 'The Constitution of Madinah, brotherhood (Muakhah), and the first Masjid.' },
        { title: 'The Major Battles',                     order: 9,  duration: 50, content: 'Badr, Uhud, Khandaq — causes, events, and lessons.' },
        { title: 'The Farewell Sermon & Legacy',          order: 10, duration: 40, content: 'Hajjat al-Wada, the final sermon, and the enduring message of the Prophet ﷺ.' },
      ],
    },
  ];

  for (const { lessons, ...courseData } of coursesData) {
    const course = await prisma.course.upsert({
      where:  { slug: courseData.slug },
      update: {},
      create: { ...courseData, isActive: true },
    });

    for (const lesson of lessons) {
  const existing = await prisma.lesson.findFirst({
    where: { courseId: course.id, order: lesson.order },
  });
  if (!existing) {
    await prisma.lesson.create({ data: { ...lesson, courseId: course.id } });
  }
}
  }

  console.log('✔ Courses & lessons seeded');

  // ─── Enrollments ──────────────────────────────────────────────────────────
  const tajweedCourse = await prisma.course.findUnique({ where: { slug: 'tajweed-foundations' } });
  const hifdhCourse   = await prisma.course.findUnique({ where: { slug: 'hifdh-ul-quran' } });

  if (tajweedCourse) {
    await prisma.enrollment.upsert({
      where:  { userId_courseId: { userId: student.id, courseId: tajweedCourse.id } },
      update: {},
      create: { userId: student.id, courseId: tajweedCourse.id, progress: 30 },
    });
  }

  if (hifdhCourse) {
    await prisma.enrollment.upsert({
      where:  { userId_courseId: { userId: student.id, courseId: hifdhCourse.id } },
      update: {},
      create: { userId: student.id, courseId: hifdhCourse.id, progress: 10 },
    });
  }

  console.log('✔ Enrollments seeded');
  // ─── Mentorship ───────────────────────────────────────────────────────────
  const mentorship = await prisma.mentorship.upsert({
    where:  { teacherId_studentId: { teacherId: teacher.id, studentId: student.id } },
    update: {},
    create: { teacherId: teacher.id, studentId: student.id },
  });

  console.log('✔ Mentorship seeded');

  // ─── Availability ─────────────────────────────────────────────────────────
  const slots = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }, // Monday
    { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' }, // Wednesday
    { dayOfWeek: 6, startTime: '14:00', endTime: '17:00' }, // Saturday
  ];

  for (const slot of slots) {
    await prisma.availability.create({
      data: { userId: teacher.id, ...slot, isRecurring: true },
    });
  }

  console.log('✔ Availability seeded');

  // ─── Appointment ──────────────────────────────────────────────────────────
  await prisma.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId:    teacher.id,
      title:        'Tajweed Review — Noon Sakinah',
      description:  'Review of Noon Sakinah and Tanween rules with recitation practice.',
      startTime:    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime:      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      meetingUrl:   'https://meet.google.com/placeholder',
    },
  });

  console.log('✔ Appointment seeded');

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  const bookmarks = [
    { surah: 2,  ayah: 255, note: 'Ayat al-Kursi — memorize this' },
    { surah: 18, ayah: 1,   note: 'Beginning of Surah Al-Kahf' },
    { surah: 36, ayah: 1,   note: 'Surah Yaseen — Friday recitation' },
  ];

  for (const bm of bookmarks) {
    await prisma.bookmark.upsert({
      where:  { userId_surah_ayah: { userId: student.id, surah: bm.surah, ayah: bm.ayah } },
      update: {},
      create: { userId: student.id, surah: bm.surah, ayah: bm.ayah, note: bm.note },
    });
  }

  console.log('✔ Bookmarks seeded');

  // ─── Messages ─────────────────────────────────────────────────────────────
  const messages = [
    { senderId: teacher.id, receiverId: student.id, content: 'Assalamu Alaykum Aisha, great progress this week! Make sure to review Madd rules before our next session.' },
    { senderId: student.id, receiverId: teacher.id, content: 'Wa Alaykum Assalam Ustadh, JazakAllah Khayr! I will review them tonight insha\'Allah.' },
    { senderId: teacher.id, receiverId: student.id, content: 'Also, try to listen to Sheikh Al-Husary\'s recitation of Al-Baqarah for reference.' },
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }

  console.log('✔ Messages seeded');

  // ─── UstadhProfile ────────────────────────────────────────────────────────
  await prisma.ustadhProfile.upsert({
    where:  { userId: teacher.id },
    update: {},
    create: {
      userId:         teacher.id,
      isApproved:     true,
      bio:            'Hafiz with ijazah in Hafs an Asim. 10+ years teaching Tajweed and Hifdh.',
      qualifications: 'Ijazah in Hafs an Asim from Al-Azhar University\nCertified Quran Teacher (CQT-2018)\nBA in Islamic Studies',
    },
  });

  console.log('✔ UstadhProfile seeded');

  // ─── QuranProgress ─────────────────────────────────────────────────────────
  await prisma.quranProgress.upsert({
    where:  { userId: student.id },
    update: {},
    create: {
      userId:    student.id,
      lastSurah: 2,
      lastVerse: 86,
    },
  });

  console.log('✔ QuranProgress seeded');

  // ─── Login Session History (for streak) ────────────────────────────────────
  const now = new Date();
  for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    // Two activities per day to simulate multiple logins
    const morning = new Date(day);
    morning.setHours(8, 30, 0, 0);
    const evening = new Date(day);
    evening.setHours(19, 15, 0, 0);

    await prisma.loginSession.create({
      data: {
        userId:      student.id,
        deviceName:  'Chrome on Linux',
        ipAddress:   '192.168.1.100',
        lastActivity: morning,
        isActive:    false,
      },
    });
    await prisma.loginSession.create({
      data: {
        userId:      teacher.id,
        deviceName:  'Chrome on Linux',
        ipAddress:   '192.168.1.101',
        lastActivity: morning,
        isActive:    false,
      },
    });

    if (daysAgo < 3) {
      await prisma.loginSession.create({
        data: {
          userId:      student.id,
          deviceName:  'Firefox on Linux',
          ipAddress:   '192.168.1.100',
          lastActivity: evening,
          isActive:    false,
        },
      });
    }
  }

  console.log('✔ LoginSessions seeded (8-day streak)');

  // ─── Assessments (for leaderboard + Strong Recitation achievement) ────────
  const assessments = [
    { type: AssessmentType.HIFDH_LISTENING, score: 85, feedback: 'Good flow, minor pause at verse 255.' },
    { type: AssessmentType.TAJWEED_EXAM,    score: 92, feedback: 'Excellent Makharij' },
    { type: AssessmentType.VERBAL_TEST,     score: 78, feedback: 'Needs work on Madd rules' },
    { type: AssessmentType.HIFDH_LISTENING, score: 88, feedback: 'Steady improvement' },
    { type: AssessmentType.HIFDH_LISTENING, score: 95, feedback: 'Outstanding recitation' },
  ];

  for (const a of assessments) {
    await prisma.assessment.create({
      data: { studentId: student.id, type: a.type, score: a.score, feedback: a.feedback, assessedBy: 'AI' },
    });
  }

  console.log('✔ Assessments seeded');

  // ─── RecitationJournal (for accuracy trend) ────────────────────────────────
  const journals = [
    { surahNumber: 1,  fromVerse: 1,  toVerse: 7,   accuracy: 95, duration: 120 },
    { surahNumber: 2,  fromVerse: 1,  toVerse: 5,   accuracy: 88, duration: 180 },
    { surahNumber: 2,  fromVerse: 1,  toVerse: 10,  accuracy: 82, duration: 240 },
    { surahNumber: 2,  fromVerse: 1,  toVerse: 15,  accuracy: 91, duration: 300 },
    { surahNumber: 78, fromVerse: 1,  toVerse: 10,  accuracy: 96, duration: 150 },
  ];

  for (const j of journals) {
    // Space timestamps backward from now so order is clear
    const ts = new Date(now);
    ts.setDate(ts.getDate() - journals.indexOf(j));
    ts.setHours(10, 0, 0, 0);

    await prisma.recitationJournal.create({
      data: { userId: student.id, ...j, createdAt: ts },
    });
  }

  console.log('✔ RecitationJournal seeded');

  // ─── Completed Appointments (session history) ──────────────────────────────
  const pastSessions = [
    { daysAgo: 6, title: 'Tajweed Review — Noon Sakinah', surahNumber: 2, verseNumber: 1 },
    { daysAgo: 4, title: 'Juz Amma Revision',              surahNumber: 78, verseNumber: 1 },
    { daysAgo: 2, title: 'Madd Rules Practice',            surahNumber: 2, verseNumber: 10 },
  ];

  for (const s of pastSessions) {
    const start = new Date(now);
    start.setDate(start.getDate() - s.daysAgo);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start);
    end.setHours(11, 0, 0, 0);

    await prisma.appointment.create({
      data: {
        mentorshipId: mentorship.id,
        teacherId:    teacher.id,
        title:        s.title,
        startTime:    start,
        endTime:      end,
        status:       'COMPLETED',
        startedAt:    start,
        endedAt:      end,
        surahNumber:  s.surahNumber,
        verseNumber:  s.verseNumber,
      },
    });
  }

  console.log('✔ Completed appointments seeded');

  // ─── StudentNotes (open + resolved) ────────────────────────────────────────
  // Fetch the most recent completed appointment for note linking
  const recentAppt = await prisma.appointment.findFirst({
    where:  { mentorshipId: mentorship.id, status: 'COMPLETED' },
    orderBy: { startTime: 'desc' },
  });

  const notesData = [
    { priority: 'HIGH',   content: 'Strong pronunciation of ض (Daud) — still confusing with ظ (Dha). Needs focused drill.', resolved: false },
    { priority: 'MEDIUM', content: 'Madd Munfasil timing is inconsistent; sometimes extends 4 counts instead of 2-4.', resolved: false },
    { priority: 'LOW',    content: 'Remember to review the rules of Ikhfaa before next session.', resolved: false },
    { priority: 'MEDIUM', content: 'Great improvement on Meem Sakinah rules this week.', resolved: true, resolvedAt: new Date(now.getTime() - 1 * 86400000) },
    { priority: 'LOW',    content: 'Reviewed Qalqalah — minor echo on ط could be stronger.', resolved: true, resolvedAt: new Date(now.getTime() - 2 * 86400000) },
  ];

  for (const n of notesData) {
    await prisma.studentNote.create({
      data: {
        studentId:  student.id,
        ustadhId:   teacher.id,
        content:    n.content,
        priority:   n.priority as 'LOW' | 'MEDIUM' | 'HIGH',
        resolved:   n.resolved,
        resolvedAt: n.resolved ? (n.resolvedAt ?? new Date()) : null,
        sessionId:  recentAppt?.id ?? null,
      },
    });
  }

  console.log('✔ StudentNotes seeded');

  // ─── Complete an enrollment for Course Finisher achievement ────────────────
  const completedCourse = await prisma.course.findUnique({ where: { slug: 'fiqh-of-salah' } });
  if (completedCourse) {
    await prisma.enrollment.upsert({
      where:  { userId_courseId: { userId: student.id, courseId: completedCourse.id } },
      update: { progress: 100, status: 'COMPLETED', completedAt: new Date(now.getTime() - 3 * 86400000) },
      create: { userId: student.id, courseId: completedCourse.id, progress: 100, status: 'COMPLETED', completedAt: new Date(now.getTime() - 3 * 86400000) },
    });
  }

  console.log('✔ Completed enrollment seeded');

  console.log('\n✅ Database seeded successfully');

}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });