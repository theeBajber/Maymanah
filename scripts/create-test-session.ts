import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [anwar, ibrahim] = await Promise.all([
    prisma.user.findFirst({ where: { name: "Anwar Ibrahim" } }),
    prisma.user.findFirst({ where: { name: "Ibrahim Al-Faruqi" } }),
  ]);

  if (!anwar) { console.log("Anwar not found"); process.exit(1); }
  if (!ibrahim) { console.log("Ibrahim not found"); process.exit(1); }

  const mentorship = await prisma.mentorship.findFirst({
    where: { studentId: anwar.id, status: "ACTIVE" },
  });
  if (!mentorship) { console.log("No active mentorship"); process.exit(1); }

  const now = new Date();
  const start = new Date(now);
  start.setMinutes(start.getMinutes() - 5);
  const end = new Date(start.getTime() + 60 * 60000);

  const appointment = await prisma.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId: mentorship.teacherId,
      title: "Test Session",
      startTime: start,
      endTime: end,
      sessionType: "DAILY_HIFDH",
      meetingUrl: `test-${mentorship.id}-${Date.now()}`,
      status: "SCHEDULED",
    },
  });

  console.log("Session created!");
  console.log(`Student URL (Anwar): http://localhost:3000/session/${appointment.id}?test=1`);
  console.log(`Teacher URL (Ibrahim): http://localhost:3000/session/${appointment.id}?test=1`);
  console.log(`Teacher ID: ${mentorship.teacherId}`);
  console.log(`Student ID: ${anwar.id}`);

  await prisma.$disconnect();
}

main();
