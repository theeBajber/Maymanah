import "dotenv/config";
import {
  PrismaClient,
  CourseCategory,
  UserRole,
  AssessmentType,
} from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { hash } from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (
    !process.env.SEED_ADMIN_PASSWORD ||
    !process.env.SEED_TEACHER_PASSWORD ||
    !process.env.SEED_STUDENT_PASSWORD
  ) {
    throw new Error("Missing SEED_*_PASSWORD env vars — check your .env file");
  }
  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPassword = await hash(process.env.SEED_ADMIN_PASSWORD!, 12);
  const teacherPassword = await hash(process.env.SEED_TEACHER_PASSWORD!, 12);
  const studentPassword = await hash(process.env.SEED_STUDENT_PASSWORD!, 12);

  await prisma.user.upsert({
    where: { email: "admin@maymanah.com" },
    update: {},
    create: {
      email: "admin@maymanah.com",
      name: "Admin User",
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Platform administrator",
          timezone: "Africa/Nairobi",
          country: "KE",
          language: "en",
        },
      },
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "ustadh.ibrahim@maymanah.com" },
    update: {},
    create: {
      email: "ustadh@maymanah.com",
      name: "Ibrahim Al-Farouq",
      password: teacherPassword,
      role: UserRole.TEACHER,
      gender: "male",
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Hafiz with ijazah in Hafs an Asim. 10+ years teaching Tajweed and Hifdh.",
          timezone: "Africa/Nairobi",
          country: "KE",
          quranLevel: "advanced",
          language: "en",
        },
      },
      ustadhProfile: {
        create: {
          isApproved: true,
          availableForTeaching: true,
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@maymanah.com" },
    update: {},
    create: {
      email: "student@maymanah.com",
      name: "Anwar Faraj",
      password: studentPassword,
      role: UserRole.STUDENT,
      gender: "male",
      emailVerified: new Date(),
      profile: {
        create: {
          bio: "Beginner student, working through Tajweed foundations.",
          timezone: "Africa/Nairobi",
          country: "KE",
          quranLevel: "beginner",
          language: "en",
        },
      },
    },
  });

  console.log("✔ Users seeded");

  // ─── Courses + Lessons ────────────────────────────────────────────────────
  const coursesData = [
    {
      title: "Tajweed Foundations",
      slug: "tajweed-foundations",
      description:
        "A self-paced introduction to the rules of Tajweed. Covers Makharij, Sifaat, Noon Sakinah, Meem Sakinah, and Madd rules — complete with audio examples and interactive exercises.",
      category: CourseCategory.Quran,
      lessons: [
        {
          title: "Introduction to Tajweed",
          order: 1,
          duration: 20,
          content: `<h2>What is Tajweed?</h2>
<p><strong>Tajweed</strong> (تجويد) literally means <em>to make better</em> or <em>to improve</em>. In the context of Quranic recitation, it is the set of rules governing the correct pronunciation of the Arabic letters and the proper application of their characteristics.</p>
<blockquote>Allah commands in the Quran: <strong>"And recite the Quran with measured recitation"</strong> (Surah Al-Muzzammil 73:4). This verse is the primary foundation for the science of Tajweed.</blockquote>
<h2>Why is Tajweed Important?</h2>
<ul>
<li>It preserves the <strong>meaning</strong> of the Quran — incorrect pronunciation can change the meaning of words</li>
<li>It honors the <strong>sanctity</strong> of Allah's speech</li>
<li>It is a <strong>communal obligation</strong> (Fard Kifayah) to learn, and an individual obligation (Fard Ain) to apply during recitation</li>
<li>It beautifies the recitation, as the Prophet ﷺ said: <em>"Beautify the Quran with your voices"</em></li>
</ul>
<h2>The Three Levels of Recitation</h2>
<p>Tajweed applies to all levels of recitation:</p>
<ul>
<li><strong>Tahqeeq</strong> — Slow, precise recitation (used for teaching and learning)</li>
<li><strong>Tadweer</strong> — Moderate pace (the most common in daily prayer)</li>
<li><strong>Hadr</strong> — Fast recitation (for those who have mastered the rules)</li>
</ul>
<h2>What You Will Learn</h2>
<p>Throughout this course, you will master:</p>
<ul>
<li>The <strong>articulation points</strong> (Makharij) of each Arabic letter</li>
<li>The <strong>characteristics</strong> (Sifaat) that distinguish letters</li>
<li>The rules for <strong>Noon Sakinah</strong>, <strong>Meem Sakinah</strong>, and <strong>Madd</strong></li>
<li>The special rulings like <strong>Qalqalah</strong> and <strong>Stop/Start</strong> rules</li>
</ul>
<p>Each lesson includes practical examples from the Quran and audio demonstrations.</p>`,
        },
        {
          title: "Makharij al-Huruf — Part 1",
          order: 2,
          duration: 30,
          content: `<h2>The Articulation Points (Makharij)</h2>
<p>Every Arabic letter emerges from a specific <strong>point of articulation</strong> (Makhraj, plural: Makharij). Knowing these points is essential for correct recitation — it prevents letters from sounding alike when they should be distinct.</p>
<blockquote>The Prophet ﷺ said: <strong>"I am the most eloquent among you in Arabic"</strong> (Bukhari). The Sahabah took great care to pronounce every letter from its correct origin.</blockquote>
<h2>The Five Main Articulation Areas</h2>
<p>The Arabic letters originate from five primary areas:</p>
<ol>
<li><strong>Al-Jawf</strong> (The Empty Space) — the oral cavity</li>
<li><strong>Al-Halq</strong> (The Throat) — three distinct points</li>
<li><strong>Al-Lisaan</strong> (The Tongue) — ten distinct points</li>
<li><strong>Ash-Shafataan</strong> (The Two Lips) — two points</li>
<li><strong>Al-Khayshoom</strong> (The Nasal Cavity) — for Ghunnah</li>
</ol>
<h2>Throat Letters (Al-Huruf al-Halqiyyah)</h2>
<p>The throat contains <strong>three articulation points</strong> for <strong>six letters</strong>:</p>
<ul>
<li><strong>Lowest throat</strong> (near the chest): <strong>ء</strong> (Hamzah) and <strong>ه</strong> (Ha)</li>
<li><strong>Middle throat</strong>: <strong>ع</strong> (Ayn) and <strong>ح</strong> (Ha)</li>
<li><strong>Highest throat</strong> (near the mouth): <strong>غ</strong> (Ghayn) and <strong>خ</strong> (Kha)</li>
</ul>
<p>Practice these throat letters by isolating them: <strong>ء ه ع ح غ خ</strong>. Notice how each one feels distinctly different in your throat.</p>
<h2>Common Mistakes</h2>
<ul>
<li>Confusing <strong>ح</strong> (Ha) with <strong>ه</strong> (Ha) — the first is from the middle throat, the second from the lowest</li>
<li>Pronouncing <strong>خ</strong> (Kha) too softly — it should have a clear scraping sound from the highest throat</li>
<li>Dropping the <strong>ء</strong> (Hamzah) altogether in fluent speech</li>
</ul>`,
        },
        {
          title: "Makharij al-Huruf — Part 2",
          order: 3,
          duration: 30,
          content: `<h2>Tongue Letters (Al-Huruf al-Lisaniyyah)</h2>
<p>The tongue is the most complex articulation area, with <strong>ten distinct points</strong> producing <strong>eighteen letters</strong>. Mastering these is the key to clear Quranic recitation.</p>
<blockquote>A common saying among Tajweed teachers: <strong>"Tajweed begins and ends with the tongue."</strong> Most recitation errors originate from incorrect tongue placement.</blockquote>
<h2>The Ten Articulation Points of the Tongue</h2>
<ol>
<li><strong>Deepest part of the tongue</strong> (Aqsal Lisaan) — <strong>ق</strong> (Qaf) and <strong>ك</strong> (Kaf)</li>
<li><strong>Middle of the tongue</strong> (Wasat al-Lisaan) — <strong>ج</strong> (Jeem), <strong>ش</strong> (Sheen), <strong>ي</strong> (Ya)</li>
<li><strong>Side of the tongue</strong> (Haafat al-Lisaan) — <strong>ض</strong> (Daad)</li>
<li><strong>Edge of the tongue near the molars</strong> — <strong>ل</strong> (Laam)</li>
<li><strong>Tip of the tongue near the palate</strong> — <strong>ن</strong> (Noon)</li>
<li><strong>Tip of the tongue near the upper front teeth</strong> — <strong>ر</strong> (Ra)</li>
<li><strong>Tip of the tongue at the upper front teeth roots</strong> — <strong>ط</strong> (Ta), <strong>د</strong> (Dal), <strong>ت</strong> (Ta)</li>
<li><strong>Tip of the tongue between the upper and lower front teeth</strong> — <strong>ص</strong> (Saad), <strong>س</strong> (Seen), <strong>ز</strong> (Zay)</li>
<li><strong>Tip of the tongue at the edge of the upper front teeth</strong> — <strong>ظ</strong> (Dha), <strong>ذ</strong> (Dhal), <strong>ث</strong> (Tha)</li>
<li><strong>Front part of the tongue near the palate</strong> — <strong>ض</strong> (Daad, secondary)</li>
</ol>
<h2>Lip Letters (Al-Huruf ash-Shafawiyyah)</h2>
<p>The lips produce <strong>four letters</strong> from <strong>two points</strong>:</p>
<ul>
<li><strong>Between the upper and lower lips</strong> (pressed together): <strong>ب</strong> (Ba) and <strong>م</strong> (Meem)</li>
<li><strong>Between the lower lip and upper front teeth</strong>: <strong>ف</strong> (Fa)</li>
<li><strong>With rounded lips</strong>: <strong>و</strong> (Waw)</li>
</ul>
<h2>Practice Tip</h2>
<p>For each letter, say it with <strong>Fathah</strong> (a) while focusing on the articulation point. Repeat 5-10 times before moving to the next letter.</p>`,
        },
        {
          title: "Sifaat al-Huruf",
          order: 4,
          duration: 25,
          content: `<h2>Characteristics of Letters (Sifaat al-Huruf)</h2>
<p>While <strong>Makharij</strong> tells us <em>where</em> a letter comes from, <strong>Sifaat</strong> tells us <em>how</em> it is pronounced. Each letter has a unique set of characteristics that distinguish it from other letters sharing the same articulation point.</p>
<blockquote>There are <strong>17 characteristics</strong> (Sifaat) of Arabic letters. Some are <strong>essential</strong> (always present), and some are <strong>occasional</strong> (present in certain conditions).</blockquote>
<h2>Essential Characteristics (Lazimah) — Part 1</h2>
<ul>
<li><strong>Al-Hams (Whisper)</strong> — Airflow continues when pronouncing the letter. Letters: <strong>ف ح ث ه ش خ ص س ك ت</strong></li>
<li><strong>Al-Jahr (Apparent)</strong> — Airflow is blocked. All remaining letters not in Hams.</li>
<li><strong>Ash-Shiddah (Strength)</strong> — The letter's sound is completely stopped. Letters: <strong>أ ج د ق ط ب ك</strong></li>
<li><strong>At-Tawassut (In-Between)</strong> — The sound is partially stopped. Letters: <strong>ل ن ع م ر</strong></li>
<li><strong>Ar-Rakhawah (Softness)</strong> — The sound flows freely. All remaining letters.</li>
</ul>
<h2>Essential Characteristics — Part 2</h2>
<ul>
<li><strong>Al-Istifaal (Lowness)</strong> — The tongue is lowered. All letters except Isti'la letters.</li>
<li><strong>Al-Isti'laa (Elevation)</strong> — The tongue rises to the palate. Letters: <strong>خ ص ض غ ط ق ظ</strong></li>
<li><strong>Al-Itbaaq (Adhesion)</strong> — The tongue adheres to the palate. Letters: <strong>ص ض ط ظ</strong></li>
<li><strong>Al-Infitaah (Separation)</strong> — The tongue separates from the palate. All other letters.</li>
<li><strong>Al-Idhlaaq (Fluency)</strong> — Pronounced with ease. Letters: <strong>ف ر م ن ل ب</strong></li>
<li><strong>Al-Ismaat (Restraint)</strong> — Requires more effort. All remaining letters.</li>
</ul>
<h2>Why Sifaat Matter</h2>
<p>Consider the letter <strong>ض</strong> (Daad). Its unique combination of <strong>Jahr + Shiddah + Isti'laa + Itbaaq</strong> gives it the heavy, thick quality that Arabic is famous for. If any characteristic is missing, the letter sounds incorrect — this is what distinguishes Arabic from other languages.</p>`,
        },
        {
          title: "Noon Sakinah & Tanween",
          order: 5,
          duration: 35,
          content: `<h2>The Four Rules of Noon Sakinah & Tanween</h2>
<p>When a <strong>Noon Sakinah</strong> (ن with Sukoon) or a <strong>Tanween</strong> (double vowel mark) appears, its pronunciation depends on the letter that follows. There are <strong>four rules</strong>:</p>
<ol>
<li><strong>Al-I<span>dh</span>haar</strong> (Clarity)</li>
<li><strong>Al-I<span>dgh</span>aam</strong> (Merging)</li>
<li><strong>Al-Iqlaab</strong> (Conversion)</li>
<li><strong>Al-Ikhfaa</strong> (Concealment)</li>
</ol>
<blockquote>Memorise the phrase: <strong>"إظهار - إدغام - إقلاب - إخفاء"</strong> — these four rules govern one of the most common Tajweed patterns in the Quran.</blockquote>
<h2>1. Al-I<span>dh</span>haar (الإظهار)</h2>
<p>Pronounce the Noon or Tanween <strong>clearly</strong> without any change. Applies before the <strong>six throat letters</strong>: <strong>ء ه ع ح غ خ</strong></p>
<p>Example: <strong>مِنْ أَمْنٍ</strong> — the Noon is pronounced clearly before the Hamzah.</p>
<h2>2. Al-I<span>dgh</span>aam (الإدغام)</h2>
<p>The Noon or Tanween is <strong>merged</strong> into the following letter. Applies before <strong>ي ر م ل و ن</strong> (grouped as: يَرْمَلُونَ).</p>
<ul>
<li><strong>With Ghunnah</strong> (nasalization) — before <strong>ي ن م و</strong></li>
<li><strong>Without Ghunnah</strong> — before <strong>ل ر</strong></li>
</ul>
<p>Example: <strong>مِن رَّبِّهِمْ</strong> — the Noon merges into the Ra with emphasis.</p>
<h2>3. Al-Iqlaab (الإقلاب)</h2>
<p>When Noon Sakinah or Tanween is followed by <strong>ب</strong> (Ba), the Noon changes into a <strong>Meem</strong> with Ghunnah.</p>
<p>Example: <strong>مِنْ بَعْدِ</strong> is recited as <strong>مِمْ بَعْدِ</strong> (the Noon becomes a Meem).</p>
<h2>4. Al-Ikhfaa (الإخفاء)</h2>
<p>When the following letter is one of the remaining <strong>15 letters</strong> (not in the above categories), the Noon is <strong>concealed</strong> — kept between I<span>dh</span>haar and I<span>dgh</span>aam with Ghunnah.</p>
<p>The 15 letters: <strong>ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك</strong></p>
<p>Example: <strong>مِنْ تَحْتِهَا</strong> — the Noon is concealed with a nasal sound before the Ta.</p>`,
        },
        {
          title: "Meem Sakinah",
          order: 6,
          duration: 25,
          content: `<h2>The Three Rules of Meem Sakinah</h2>
<p>When a <strong>Meem Sakinah</strong> (م with Sukoon) appears at the end of a word or in the middle, its pronunciation depends on the following letter. There are <strong>three rules</strong>:</p>
<ol>
<li><strong>Al-Ikhfaa ash-Shafawi</strong> — Concealment with the lips</li>
<li><strong>Al-I<span>dgh</span>aam ash-Shafawi</strong> — Merging with the lips</li>
<li><strong>Al-I<span>dh</span>haar ash-Shafawi</strong> — Clarity with the lips</li>
</ol>
<h2>1. Al-Ikhfaa ash-Shafawi (الإخفاء الشفوي)</h2>
<p>When Meem Sakinah is followed by <strong>ب</strong> (Ba), the Meem is <strong>concealed with Ghunnah</strong>. The lips close but do not press firmly, allowing the nasal sound to resonate.</p>
<p>Example: <strong>تَرْمِيهِم بِحِجَارَةٍ</strong> — the Meem before Ba is pronounced with Ghunnah.</p>
<h2>2. Al-I<span>dgh</span>aam ash-Shafawi (الإدغام الشفوي)</h2>
<p>When Meem Sakinah is followed by another <strong>م</strong> (Meem), the two Meems <strong>merge</strong> into one emphasized Meem with Ghunnah.</p>
<p>Example: <strong>فِي قُلُوبِهِم مَّرَضٌ</strong> — the two Meems merge into one with emphasis.</p>
<h2>3. Al-I<span>dh</span>haar ash-Shafawi (الإظهار الشفوي)</h2>
<p>When Meem Sakinah is followed by <strong>any other letter</strong> (except ب and م), the Meem is pronounced <strong>clearly</strong> without Ghunnah.</p>
<p>Example: <strong>عَلَيْهِمْ وَلَا</strong> — the Meem is pronounced clearly before the Waw.</p>
<blockquote><strong>Important distinction:</strong> Ikhfaa ash-Shafawi (before Ba) is a unique sound that takes practice. Beginners often either drop the Ghunnah completely or over-emphasize it. Listen to a qualified reciter to get the balance right.</blockquote>`,
        },
        {
          title: "Madd Rules — Introduction",
          order: 7,
          duration: 30,
          content: `<h2>What is Madd?</h2>
<p><strong>Madd</strong> (مد) literally means <em>to extend</em> or <em>to lengthen</em>. In Tajweed, it refers to <strong>prolonging the sound</strong> of a vowel letter (Alif, Waw, or Ya) when specific conditions are present.</p>
<blockquote>Madd is one of the most beautifying aspects of Quranic recitation. A skilled reciter uses Madd to create rhythm, emphasis, and emotional impact in the recitation.</blockquote>
<h2>Natural Madd (Madd al-Asli)</h2>
<p>This is the <strong>basic, inherent Madd</strong> that exists in every word containing a long vowel. It is extended for <strong>2 counts</strong> (one second approximately).</p>
<ul>
<li><strong>Alif Sakinah</strong> preceded by Fathah: <strong>قَالَ</strong> (the Alif extends the Fathah)</li>
<li><strong>Waw Sakinah</strong> preceded by Dhammah: <strong>يَقُولُ</strong> (the Waw extends the Dhammah)</li>
<li><strong>Ya Sakinah</strong> preceded by Kasrah: <strong>قِيلَ</strong> (the Ya extends the Kasrah)</li>
</ul>
<h2>Causes of Extended Madd</h2>
<p>Two things can cause a Madd to be extended beyond 2 counts:</p>
<ol>
<li><strong>Hamzah</strong> (ء) — appears before or after the Madd letter</li>
<li><strong>Sukoon</strong> (ْ) — appears after the Madd letter, either in the same word or at a stop</li>
</ol>
<h2>Madd Letters Table</h2>
<table>
<tr><th>Madd Letter</th><th>Preceding Vowel</th><th>Example</th><th>Duration</th></tr>
<tr><td>ا (Alif)</td><td>Fathah (ـَ)</td><td>قَالَ</td><td>2 counts</td></tr>
<tr><td>و (Waw)</td><td>Dhammah (ـُ)</td><td>يَقُولُ</td><td>2 counts</td></tr>
<tr><td>ي (Ya)</td><td>Kasrah (ـِ)</td><td>قِيلَ</td><td>2 counts</td></tr>
</table>
<p>In the next lesson, we will cover the <strong>extended Madd</strong> types that go beyond 2 counts.</p>`,
        },
        {
          title: "Madd Rules — Far'i (Extended)",
          order: 8,
          duration: 40,
          content: `<h2>Extended Madd (Madd al-Far'i)</h2>
<p>When a <strong>Hamzah</strong> or <strong>Sukoon</strong> appears near a Madd letter, the elongation extends beyond the natural 2 counts. There are several types:</p>
<h2>1. Madd Wajib Muttasil (مد واجب متصل)</h2>
<p><strong>Compulsory connected Madd.</strong> The Hamzah appears <strong>after</strong> the Madd letter in the <strong>same word</strong>.</p>
<ul>
<li><strong>Length:</strong> 4-5 counts</li>
<li><strong>Example:</strong> <strong>جَاءَ</strong> (the Alif is followed by Hamzah in the same word)</li>
<li><strong>Rule:</strong> This Madd is wajib (compulsory) — it must be extended</li>
</ul>
<h2>2. Madd Jaiz Munfasil (مد جائز منفصل)</h2>
<p><strong>Permissible separate Madd.</strong> The Hamzah appears <strong>after</strong> the Madd letter but in the <strong>next word</strong>.</p>
<ul>
<li><strong>Length:</strong> 2, 4, or 5 counts (depending on recitation style)</li>
<li><strong>Example:</strong> <strong>يَا أَيُّهَا</strong> (the Madd Ya is in the first word, Hamzah in the second)</li>
<li><strong>Rule:</strong> This Madd is jaiz (permissible) — the reciter may choose the length</li>
</ul>
<h2>3. Madd Aarid lis-Sukoon (مد عارض للسكون)</h2>
<p>This Madd occurs when <strong>stopping</strong> at the end of a word that ends with a Madd letter followed by a letter that would have a vowel when continuing.</p>
<ul>
<li><strong>Length:</strong> 2, 4, or 6 counts (at the stop)</li>
<li><strong>Example:</strong> <strong>رَبِّ الْعَالَمِينَ</strong> — when stopping on <strong>الْعَالَمِينَ</strong>, the Ya is extended</li>
<li><strong>Rule:</strong> The reciter chooses the length</li>
</ul>
<blockquote><strong>Key distinction:</strong> Madd Wajib Muttasil is <strong>always</strong> extended (at least 4 counts), while Madd Jaiz Munfasil can be shortened. This is a common area of error for students — do not shorten the Muttasil!</blockquote>`,
        },
        {
          title: "Qalqalah",
          order: 9,
          duration: 20,
          content: `<h2>What is Qalqalah?</h2>
<p><strong>Qalqalah</strong> (قلقلة) literally means <em>echoing</em> or <em>disturbance</em>. In Tajweed, it is the <strong>vibrating/echoing sound</strong> produced when pronouncing certain letters that have Sukoon on them.</p>
<blockquote>The Qalqalah letters are grouped in the phrase: <strong>قُطْبُ جَدٍ</strong> — the five letters: <strong>ق ط ب ج د</strong></blockquote>
<h2>The Five Qalqalah Letters</h2>
<table>
<tr><th>Letter</th><th>Pronunciation</th><th>Degree</th></tr>
<tr><td>ق (Qaf)</td><td>Echo from the back of the tongue</td><td>Major</td></tr>
<tr><td>ط (Ta)</td><td>Echo from the tip of the tongue</td><td>Major</td></tr>
<tr><td>ب (Ba)</td><td>Echo from the lips</td><td>Minor</td></tr>
<tr><td>ج (Jeem)</td><td>Echo from the middle of the tongue</td><td>Minor</td></tr>
<tr><td>د (Dal)</td><td>Echo from the tip of the tongue</td><td>Minor</td></tr>
</table>
<h2>Degrees of Qalqalah</h2>
<ul>
<li><strong>Minor Qalqalah</strong> — when the letter appears with Sukoon in the <strong>middle</strong> of a word</li>
<li><strong>Major Qalqalah</strong> — when the letter appears with Sukoon at the <strong>end</strong> of a word (especially when stopping)</li>
<li><strong>Strongest Qalqalah</strong> — when stopping on the letter and it has Shaddah (emphasis), e.g. <strong>الْحَقَّ</strong></li>
</ul>
<h2>Common Mistakes</h2>
<ul>
<li><strong>Over-echoing</strong> — Qalqalah should be a subtle echo, not a full vowel sound</li>
<li><strong>Adding a vowel</strong> — Do not say "bak" for ب — it should be a clean echo without a following Kasrah or vowel</li>
<li><strong>Missing Qalqalah on ق and ط</strong> — these two have the strongest echo; if they are weak, they sound like ك and ت respectively</li>
</ul>`,
        },
        {
          title: "Practical Review & Assessment",
          order: 10,
          duration: 45,
          content: `<h2>Review & Self-Assessment</h2>
<p>This final module brings together everything you have learned. Work through each section and use the checklist to track your progress.</p>
<h2>Section 1: Articulation Points Review</h2>
<p>Recite the following letters, focusing on their correct Makhraj:</p>
<ul>
<li>Throat letters: <strong>ء ه ع ح غ خ</strong></li>
<li>Tongue letters: <strong>ق ك ج ش ي ض ل ن ر ط د ت ص س ز ظ ذ ث</strong></li>
<li>Lip letters: <strong>ب م ف و</strong></li>
</ul>
<h2>Section 2: Sifaat Review</h2>
<p>For each letter below, identify all its characteristics:</p>
<ul>
<li><strong>ص</strong> — (Answer: Jahr, Rakhawah, Isti'laa, Itbaaq, Ismaat)</li>
<li><strong>ف</strong> — (Answer: Hams, Rakhawah, Istifaal, Infitaah, Idhlaaq)</li>
<li><strong>ق</strong> — (Answer: Jahr, Shiddah, Isti'laa, Infitaah, Ismaat — plus Qalqalah)</li>
</ul>
<h2>Section 3: Noon & Meem Sakinah</h2>
<p>Identify the rule applied in each example:</p>
<ol>
<li><strong>مِنْ خَوْفٍ</strong> — (I<span>dh</span>haar — before خ)</li>
<li><strong>مِن مَّسَدٍ</strong> — (I<span>dgh</span>aam with Ghunnah — before م)</li>
<li><strong>سَمِيعٌ بَصِيرٌ</strong> — (Iqlaab on the first Tanween — before ب)</li>
<li><strong>عَلَيْهِمْ وَلَا</strong> — (I<span>dh</span>haar ash-Shafawi — before و)</li>
</ol>
<h2>Section 4: Madd Rules Quick Reference</h2>
<table>
<tr><th>Type</th><th>Cause</th><th>Length</th><th>Ruling</th></tr>
<tr><td>Madd Asli</td><td>Natural long vowel</td><td>2 counts</td><td>Always</td></tr>
<tr><td>Madd Muttasil</td><td>Hamzah in same word</td><td>4-5 counts</td><td>Wajib</td></tr>
<tr><td>Madd Munfasil</td><td>Hamzah in next word</td><td>2-5 counts</td><td>Jaiz</td></tr>
<tr><td>Madd Aarid</td><td>Sukoon at stop</td><td>2-6 counts</td><td>Jaiz</td></tr>
</table>
<h2>Self-Assessment Checklist</h2>
<ul>
<li>I can identify the Makhraj of all 29 Arabic letters</li>
<li>I can explain the four rules of Noon Sakinah</li>
<li>I can apply the three rules of Meem Sakinah</li>
<li>I can distinguish Madd Asli from the extended Madd types</li>
<li>I can apply Qalqalah correctly on ق ط ب ج د</li>
<li>I can recite a short passage applying all rules</li>
</ul>
<blockquote><strong>Congratulations on completing Tajweed Foundations!</strong> Continue practicing daily, and consider reciting to a qualified teacher for final correction and Ijazah.</blockquote>`,
        },
      ],
    },
    {
      title: "Fiqh of Salah",
      slug: "fiqh-of-salah",
      description:
        "Master the rulings, conditions, and etiquette of the five daily prayers. Covers purification, prayer times, pillars of Salah, common mistakes, and congregational prayer.",
      category: CourseCategory.Fiqh,
      lessons: [
        {
          title: "Importance & Ruling of Salah",
          order: 1,
          duration: 20,
          content: `<h2>The Status of Salah in Islam</h2>
<p><strong>Salah</strong> (prayer) is the <strong>second pillar of Islam</strong> and the most important act of worship after the declaration of faith (Shahadah). It was ordained directly by Allah to the Prophet ﷺ during the Night Journey (Isra wa Mi'raj) without any intermediary.</p>
<blockquote>The Prophet ﷺ said: <strong>"The covenant between us and them is prayer; whoever abandons it has committed disbelief."</strong> (Tirmidhi)</blockquote>
<h2>Evidence from the Quran</h2>
<ul>
<li>Allah says: <strong>"Indeed, prayer has been decreed upon the believers at fixed times"</strong> (Surah An-Nisa 4:103)</li>
<li>Allah commands: <strong>"And establish prayer and give Zakat and bow with those who bow"</strong> (Surah Al-Baqarah 2:43)</li>
<li>More than <strong>80 verses</strong> in the Quran mention prayer, often linking it to success and righteousness</li>
</ul>
<h2>Evidence from the Sunnah</h2>
<ul>
<li>The Prophet ﷺ said: <strong>"The first matter that the servant will be accountable for on the Day of Judgment is prayer. If it is sound, the rest of his deeds will be sound."</strong></li>
<li>He ﷺ also said: <strong>"Between a man and disbelief is abandoning prayer."</strong> (Muslim)</li>
</ul>
<h2>The Ruling of Salah</h2>
<ul>
<li><strong>Five daily prayers</strong> — Fajr, Dhuhr, Asr, Maghrib, Isha — are individually obligatory (Fard Ain) upon every sane, adult Muslim</li>
<li><strong>Friday prayer (Jumu'ah)</strong> — obligatory upon men in congregation</li>
<li><strong>Funeral prayer (Janazah)</strong> — a communal obligation (Fard Kifayah)</li>
<li><strong>Voluntary prayers (Nafl/Sunnah)</strong> — highly encouraged for additional reward</li>
</ul>
<h2>Who is Exempt?</h2>
<ul>
<li><strong>Children</strong> — not obligated until they reach puberty</li>
<li><strong>Women during menstruation/postpartum bleeding</strong> — not required to pray, and no makeup is required</li>
<li><strong>Those with valid excuses</strong> — such as severe illness where one cannot maintain consciousness or purity</li>
</ul>`,
        },
        {
          title: "Purification — Wudu",
          order: 2,
          duration: 35,
          content: `<h2>Wudu: The Key to Prayer</h2>
<p>Allah says: <strong>"O you who believe! When you rise for prayer, wash your faces and your hands to the elbows, and wipe your heads and your feet to the ankles"</strong> (Surah Al-Maidah 5:6). Wudu is both a physical purification and a spiritual preparation for standing before Allah.</p>
<h2>Obligatory Acts of Wudu (Faraid)</h2>
<ol>
<li><strong>Intention</strong> (Niyyah) — the silent intention in the heart to perform Wudu for prayer</li>
<li><strong>Washing the face</strong> — from the hairline to the chin, and from ear to ear</li>
<li><strong>Washing both hands to the elbows</strong> — including the elbows</li>
<li><strong>Wiping the head</strong> — at least a portion of the head</li>
<li><strong>Washing both feet to the ankles</strong> — including the ankles</li>
<li><strong>Order</strong> (Tarteeb) — performing the above in the sequence mentioned in the verse</li>
</ol>
<h2>Recommended Acts (Sunnan)</h2>
<ul>
<li>Starting with <strong>Bismillah</strong></li>
<li>Washing the <strong>hands three times</strong> at the beginning</li>
<li><strong>Rinsing the mouth</strong> (Madmadah)</li>
<li><strong>Inhaling water into the nose</strong> (Istinshaq) and exhaling it (Istinthar)</li>
<li>Wiping the <strong>entire ears</strong> (inside and out) with fresh water</li>
<li><strong>Khilal</strong> — running fingers through the beard and between the fingers/toes</li>
<li>Washing each limb <strong>three times</strong></li>
<li>Performing the actions in <strong>continuous succession</strong> (Muwalat)</li>
</ul>
<h2>Nullifiers of Wudu</h2>
<ul>
<li>Anything exiting from the <strong>private parts</strong> (urine, stool, gas)</li>
<li><strong>Deep sleep</strong> in which one loses awareness</li>
<li>Loss of <strong>consciousness</strong> (fainting, intoxication)</li>
<li><strong>Touching the private parts</strong> directly with the hand without a barrier</li>
<li>Eating <strong>camel meat</strong> (according to the Hanbali position)</li>
</ul>
<h2>Common Mistakes</h2>
<ul>
<li><strong>Splashing water without actual washing</strong> — each limb must be thoroughly washed</li>
<li><strong>Wasting water</strong> — the Prophet ﷺ performed Wudu with as little as one mudd (approximately 0.5 liters)</li>
<li><strong>Talking during Wudu</strong> — while not invalidating, it contradicts the spirit of mindfulness</li>
<li><strong>Not wiping the ears correctly</strong> — the index fingers wipe the inside, the thumbs wipe the outside</li>
</ul>`,
        },
        {
          title: "Purification — Ghusl & Tayammum",
          order: 3,
          duration: 30,
          content: `<h2>Ghusl: Full Body Purification</h2>
<p><strong>Ghusl</strong> is the act of washing the entire body with water to remove a state of major ritual impurity (Janabah). It is required after:</p>
<ul>
<li><strong>Sexual intercourse</strong> (with or without emission)</li>
<li><strong>Ejaculation</strong> (whether awake or asleep, from sexual stimulation or otherwise)</li>
<li><strong>Completion of menstruation or postpartum bleeding</strong></li>
<li><strong>Embracing Islam</strong> (recommended in most schools)</li>
</ul>
<blockquote>Allah says: <strong>"And if you are in a state of janabah, then purify yourselves"</strong> (Surah Al-Maidah 5:6). This establishes Ghusl as a requirement for prayer, fasting, and other acts of worship.</blockquote>
<h2>How to Perform Ghusl</h2>
<ol>
<li><strong>Intention</strong> (Niyyah) — silently intend to remove the state of Janabah</li>
<li>Wash the <strong>private parts</strong></li>
<li>Perform a <strong>complete Wudu</strong> (as described in the previous lesson)</li>
<li>Pour water over the <strong>head three times</strong>, ensuring it reaches the scalp</li>
<li>Pour water over the <strong>right shoulder three times</strong>, then the <strong>left shoulder</strong></li>
<li>Ensure <strong>every part of the body</strong> is washed, including skin folds and the navel</li>
</ol>
<h2>Tayammum: Dry Ablution</h2>
<p>Tayammum is a <strong>substitute for Wudu or Ghusl</strong> using clean earth when water is unavailable or harmful. Allah says:</p>
<blockquote><strong>"...and you find no water, then seek clean earth and wipe your faces and your hands with it"</strong> (Surah Al-Maidah 5:6)</blockquote>
<h2>When Tayammum is Permitted</h2>
<ul>
<li><strong>No water available</strong> — after genuinely searching for it</li>
<li><strong>Water is harmful</strong> — due to illness, extreme cold, or a medical condition</li>
<li><strong>Water is needed for drinking</strong> — only a limited amount is available and needed for survival</li>
<li><strong>Injury or wound</strong> — if water would harm the affected area</li>
</ul>
<h2>How to Perform Tayammum</h2>
<ol>
<li><strong>Intention</strong> — intend to permit the act of worship</li>
<li>Strike the <strong>clean earth</strong> with both hands</li>
<li>Wipe the <strong>face</strong> once with the hands</li>
<li>Strike the earth <strong>again</strong></li>
<li>Wipe the <strong>hands to the wrists</strong></li>
</ol>
<p>Tayammum becomes invalid when water is found or the excuse no longer exists.</p>`,
        },
        {
          title: "Prayer Times",
          order: 4,
          duration: 25,
          content: `<h2>The Five Prescribed Prayer Times</h2>
<p>Allah has prescribed specific windows for each of the five daily prayers. Praying within these times is an essential condition for the prayer's validity.</p>
<blockquote>Allah says: <strong>"Indeed, prayer has been decreed upon the believers at fixed times"</strong> (Surah An-Nisa 4:103). The Angel Jibril (AS) taught the Prophet ﷺ the prayer times by leading him at the beginning and end of each time window.</blockquote>
<h2>1. Fajr (Dawn)</h2>
<ul>
<li><strong>Begins:</strong> True dawn (the horizontal light spreading across the horizon)</li>
<li><strong>Ends:</strong> Sunrise</li>
<li><strong>Characteristic:</strong> 2 rak'ahs Fard, 2 rak'ahs Sunnah</li>
<li><strong>Quran recitation:</strong> Should be recited aloud (Jahr)</li>
</ul>
<h2>2. Dhuhr (Noon)</h2>
<ul>
<li><strong>Begins:</strong> When the sun passes its zenith and begins to decline</li>
<li><strong>Ends:</strong> When the shadow of an object equals its length (Asr time)</li>
<li><strong>Characteristic:</strong> 4 rak'ahs Fard, 4 raka'hs Sunnah before, 2 after</li>
<li><strong>Quran recitation:</strong> Silent (Sirr)</li>
</ul>
<h2>3. Asr (Afternoon)</h2>
<ul>
<li><strong>Begins:</strong> When the shadow equals the object's height</li>
<li><strong>Ends:</strong> Sunset</li>
<li><strong>Warning time:</strong> When the sun turns yellow, it is makruh (disliked) to delay</li>
<li><strong>Characteristic:</strong> 4 rak'ahs Fard</li>
</ul>
<h2>4. Maghrib (Sunset)</h2>
<ul>
<li><strong>Begins:</strong> Immediately after sunset</li>
<li><strong>Ends:</strong> When the red twilight disappears</li>
<li><strong>Characteristic:</strong> 3 rak'ahs Fard, 2 rak'ahs Sunnah after</li>
<li><strong>Note:</strong> Has the shortest time window — pray it promptly</li>
</ul>
<h2>5. Isha (Night)</h2>
<ul>
<li><strong>Begins:</strong> When the red twilight has faded</li>
<li><strong>Ends:</strong> Midnight (middle of the night) — or dawn according to some scholars</li>
<li><strong>Characteristic:</strong> 4 rak'ahs Fard, 2 rak'ahs Sunnah after, 3 Witr</li>
<li><strong>Best time:</strong> The last third of the night for Tahajjud, but Isha itself should not be delayed beyond midnight</li>
</ul>`,
        },
        {
          title: "Conditions & Pillars of Salah",
          order: 5,
          duration: 40,
          content: `<h2>Prerequisites of Prayer</h2>
<p>Before a Muslim can begin their prayer, <strong>nine conditions</strong> must be fulfilled. These are prerequisites, not part of the prayer itself, but without them the prayer is invalid.</p>
<h2>The 9 Conditions (Shurut) of Salah</h2>
<ol>
<li><strong>Islam</strong> — the person must be Muslim</li>
<li><strong>Sanity</strong> — the person must be of sound mind</li>
<li><strong>Puberty</strong> — the person must have reached the age of accountability</li>
<li><strong>Purity from Hadath</strong> — free from minor and major impurities (Wudu/Ghusl)</li>
<li><strong>Purity from Najasah</strong> — the body, clothes, and place of prayer must be clean</li>
<li><strong>Covering the Awrah</strong> — appropriate dress (men: navel to knees; women: all except face and hands)</li>
<li><strong>Facing the Qiblah</strong> — towards the Kaaba in Makkah</li>
<li><strong>Correct Time</strong> — the prayer must be offered in its designated time window</li>
<li><strong>Intention</strong> (Niyyah) — the silent intention in the heart to perform a specific prayer</li>
</ol>
<h2>The 14 Pillars (Arkan) of Salah</h2>
<p>Unlike the conditions, the <strong>pillars</strong> are actions and words <em>within</em> the prayer. If any pillar is missed intentionally or unintentionally, the prayer must be repeated.</p>
<ol>
<li><strong>Standing</strong> (Qiyam) — if able</li>
<li><strong>Opening Takbir</strong> (Allahu Akbar) — the first takbir</li>
<li><strong>Reciting Surah Al-Fatihah</strong> — in every rak'ah</li>
<li><strong>Bowing</strong> (Ruku)</li>
<li><strong>Rising from Ruku</strong></li>
<li><strong>Standing straight after Ruku</strong></li>
<li><strong>Prostration</strong> (Sujud) — on seven body parts</li>
<li><strong>Rising from Sujud</strong></li>
<li><strong>Sitting between the two prostrations</strong></li>
<li><strong>Tranquility</strong> (Tumaninah) — pausing briefly in each physical position</li>
<li><strong>Final Tashahhud</strong></li>
<li><strong>Sitting for the final Tashahhud</strong></li>
<li><strong>Sending blessings on the Prophet ﷺ</strong> in the final Tashahhud</li>
<li><strong>The final Salam</strong> (turning right and left saying "Assalamu Alaykum wa Rahmatullah")</li>
</ol>
<blockquote><strong>Memorization tip:</strong> Group the pillars into physical actions (standing, bowing, prostrating, sitting) and verbal elements (Takbir, Fatihah, Tashahhud, Salam). This makes them easier to remember and apply in every prayer.</blockquote>`,
        },
        {
          title: "Wajibat and Sunnan of Salah",
          order: 6,
          duration: 30,
          content: `<h2>Obligatory Acts (Wajibat) of Salah</h2>
<p><strong>Wajibat</strong> are acts that are required in the prayer but are <strong>not pillars</strong> — if forgotten, they can be compensated for by Sujud al-Sahw (prostration of forgetfulness). Deliberate omission without excuse invalidates the prayer.</p>
<h2>The 7 Wajibat of Salah</h2>
<ol>
<li>All <strong>Takbirs</strong> except the opening Takbir (which is a pillar)</li>
<li>Saying <strong>"Sami Allahu liman hamidah"</strong> for the Imam and the one praying alone</li>
<li>Saying <strong>"Rabbana wa lakal hamd"</strong> (or "Rabbana lakal hamd") upon rising from Ruku</li>
<li>Saying <strong>"Subhana Rabbiyal Azeem"</strong> once in Ruku</li>
<li>Saying <strong>"Subhana Rabbiyal A'la"</strong> once in Sujud</li>
<li>The <strong>first Tashahhud</strong> (in prayers of 3 or 4 rak'ahs)</li>
<li>Sitting for the <strong>first Tashahhud</strong></li>
</ol>
<h2>Recommended Acts (Sunnan) of Salah</h2>
<p>Sunnan are actions that the Prophet ﷺ consistently performed. Performing them brings additional reward, but omitting them does not require Sujud al-Sahw.</p>
<h3>Verbal Sunnan</h3>
<ul>
<li>The <strong>opening supplication</strong> (Du'a al-Istiftah) after the Takbir</li>
<li>Reciting <strong>Ta'awwudh</strong> (A'udhu billahi min ash-Shaytan ir-Rajeem)</li>
<li>Saying <strong>Bismillah</strong> before Surah Al-Fatihah</li>
<li>Saying <strong>Ameen</strong> after Al-Fatihah</li>
<li>Reciting additional Quranic verses after Al-Fatihah</li>
<li>The <strong>supplications in Ruku and Sujud</strong> beyond the obligatory ones</li>
<li>The <strong>supplication between the two prostrations</strong></li>
<li>The <strong>supplication after the Tashahhud</strong> before the Salam</li>
</ul>
<h3>Physical Sunnan</h3>
<ul>
<li>Raising the <strong>hands to the shoulders or ears</strong> at the Takbir</li>
<li>Raising the hands when saying <strong>"Allahu Akbar" for Ruku</strong></li>
<li>Raising the hands when <strong>rising from Ruku</strong></li>
<li>Placing the right hand over the left on the <strong>chest</strong></li>
<li>Looking at the <strong>place of Sujud</strong></li>
<li>Keeping the <strong>feet apart</strong> in standing and Ruku</li>
<li>Sitting on the <strong>left foot</strong> with the right foot upright (iftaarash) in Tashahhud</li>
</ul>`,
        },
        {
          title: "Invalidators of Salah",
          order: 7,
          duration: 25,
          content: `<h2>What Invalidates the Prayer?</h2>
<p>Certain actions, if done knowingly or forgetfully, <strong>nullify the prayer</strong> and require it to be restarted. If done forgetfully in some cases, Sujud al-Sahw may suffice.</p>
<blockquote>The Prophet ﷺ said: <strong>"The prayer of a person who does not have tranquility in his bowing and prostration is not sufficient"</strong> — highlighting the importance of performing each action properly.</blockquote>
<h2>Major Invalidators</h2>
<ul>
<li><strong>Speaking intentionally</strong> — words not related to the prayer, even one letter with meaning</li>
<li><strong>Eating or drinking</strong> — deliberately consuming anything during the prayer</li>
<li><strong>Laughing aloud</strong> — audible laughter (smiling does not invalidate)</li>
<li><strong>Uncovering the Awrah</strong> — intentionally or accidentally without immediately covering</li>
<li><strong>Turning the chest away from the Qiblah</strong> — without a valid excuse</li>
<li><strong>Breaking Wudu</strong> — passing wind, urine, etc.</li>
<li><strong>Performing an excessive extra action</strong> — adding an entire rak'ah intentionally</li>
<li><strong>Changing the intention</strong> — deciding to leave the prayer mid-prayer</li>
<li><strong>Deliberately omitting a pillar</strong> — such as not reciting Al-Fatihah</li>
<li><strong>Doubting the intention</strong> — being uncertain whether one is in the prayer or not</li>
</ul>
<h2>Actions that are Disliked (Makruh)</h2>
<ul>
<li><strong>Playing with clothes or body</strong> — adjusting clothes, cracking knuckles, fidgeting</li>
<li><strong>Looking around</strong> — turning the head unnecessarily</li>
<li><strong>Holding back urine or stool</strong> — even if the prayer would be valid, it is disliked</li>
<li><strong>Praying when food is ready</strong> — and one is distracted by it</li>
<li><strong>Yawning without covering the mouth</strong></li>
<li><strong>Reciting in a rushed manner</strong> — without proper Tajweed or contemplation</li>
</ul>`,
        },
        {
          title: "Congregational Prayer",
          order: 8,
          duration: 35,
          content: `<h2>The Ruling on Congregational Prayer</h2>
<p>Prayer in congregation (Salat al-Jama'ah) is highly emphasized in Islam. According to the majority of scholars, it is a <strong>highly recommended Sunnah</strong> for men; the Hanbali school considers it <strong>obligatory</strong> for the five daily prayers for men who are able.</p>
<blockquote>The Prophet ﷺ said: <strong>"Prayer in congregation is twenty-seven times superior to prayer offered individually"</strong> (Bukhari & Muslim). This immense reward shows the importance Allah places on unity in worship.</blockquote>
<h2>Rewards of Congregational Prayer</h2>
<ul>
<li><strong>27 times</strong> more reward than praying alone</li>
<li><strong>Forgiveness of sins</strong> — as the Prophet ﷺ said, moving from row to row erases sins</li>
<li><strong>Community bonding</strong> — meeting fellow Muslims five times daily builds strong community ties</li>
<li><strong>Learning</strong> — observing others corrects one's own mistakes in prayer</li>
<li><strong>The Angels pray for you</strong> — as long as you remain in your place of prayer</li>
</ul>
<h2>Role of the Imam</h2>
<p>The Imam leads the congregation and should:</p>
<ul>
<li>Be the <strong>most knowledgeable</strong> in Quran recitation and Fiqh of prayer</li>
<li><strong>Recite moderately</strong> — not too fast (making it hard to follow) nor too slow (burdening the congregation)</li>
<li><strong>Shorten the prayer</strong> when people are present who may have pressing needs</li>
<li><strong>Lead from the front</strong> — standing slightly ahead of the first row</li>
</ul>
<h2>Following the Imam</h2>
<ul>
<li>The followers <strong>do not recite Al-Fatihah</strong> aloud in audible prayers; according to some schools they still recite silently</li>
<li>Followers should <strong>not precede the Imam</strong> in any action (bowing, rising, prostrating)</li>
<li>There should be a <strong>gap of approximately one action</strong> — e.g., say "Allahu Akbar" for Ruku just after the Imam begins his Ruku</li>
<li><strong>Latecomers</strong> — if you miss one or more rak'ahs, complete them after the Imam says Salam</li>
</ul>`,
        },
        {
          title: "Makeup Prayers (Qada)",
          order: 9,
          duration: 20,
          content: `<h2>Making Up Missed Prayers</h2>
<p>If a Muslim misses a prayer for a valid reason (sleep, forgetfulness, unavoidable circumstances), they must make it up (<strong>Qada</strong>) as soon as they remember or are able. Missing a prayer without excuse is a major sin requiring repentance and makeup according to the majority of scholars.</p>
<blockquote>The Prophet ﷺ said: <strong>"Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it"</strong> (Bukhari & Muslim). There is no other expiation except to pray it.</blockquote>
<h2>When Qada is Required</h2>
<ul>
<li><strong>Sleeping through</strong> the prayer time — pray as soon as you wake</li>
<li><strong>Forgetting</strong> to pray — pray as soon as you remember</li>
<li><strong>Unconsciousness/coma</strong> — makeup is required in most schools</li>
<li><strong>Intoxication</strong> — makeup is required after repentance</li>
</ul>
<h2>When Qada is NOT Required</h2>
<ul>
<li><strong>Menstruation/postpartum bleeding</strong> — the prayer is not required and no makeup is needed</li>
<li><strong>Mental illness or loss of sanity</strong> — no obligation during the period of insanity</li>
<li><strong>Before puberty</strong> — children are not obligated</li>
</ul>
<h2>How to Make Up Missed Prayers</h2>
<ul>
<li>Pray the missed prayer <strong>exactly as you would have prayed it</strong> — same number of rak'ahs and recitation</li>
<li><strong>Intend Qada</strong> in your heart (e.g., "I intend to make up the missed Fajr prayer")</li>
<li>You can make up <strong>multiple missed prayers</strong> in sequence — there is no harm in praying several Qada prayers consecutively</li>
<li><strong>Qada can be offered at any time</strong> except during the three forbidden times (sunrise, zenith, sunset) — according to most scholars</li>
<li>It is <strong>recommended to pray Qada as soon as possible</strong> and not to delay without reason</li>
</ul>`,
        },
        {
          title: "Sujud al-Sahw (Prostration of Forgetfulness)",
          order: 10,
          duration: 25,
          content: `<h2>Sujud al-Sahw: Correcting Forgetfulness in Prayer</h2>
<p>As human beings, we sometimes forget or make mistakes during prayer. Allah, in His mercy, prescribed <strong>Sujud al-Sahw</strong> (prostration of forgetfulness) as a way to rectify these errors.</p>
<h2>When is Sujud al-Sahw Required?</h2>
<p>Sujud al-Sahw is performed in three scenarios:</p>
<ol>
<li><strong>Addition</strong> (Ziyadah) — adding an extra action (e.g., praying 5 rak'ahs instead of 4)</li>
<li><strong>Omission</strong> (Naqs) — omitting a Wajib (obligatory) act (e.g., forgetting the first Tashahhud)</li>
<li><strong>Doubt</strong> (Shakk) — being uncertain about the number of rak'ahs completed</li>
</ol>
<h2>How to Perform Sujud al-Sahw</h2>
<p>The method depends on the situation:</p>
<h3>Case 1: You remember while still in the same position</h3>
<p>Perform the missed action immediately, then continue.</p>
<h3>Case 2: You remember after moving to the next position</h3>
<p>Continue the prayer. In most cases, you should perform <strong>two extra prostrations</strong> before the Salam.</p>
<h3>Case 3: You add an extra rak'ah</h3>
<p>After realizing the addition, sit down, recite the Tashahhud, perform two prostrations of forgetfulness, and then say Salam.</p>
<h3>Case 4: You are uncertain about the number of rak'ahs</h3>
<p><strong>Act upon what you are certain of</strong> (the lesser number). Complete the prayer based on that certainty, then perform Sujud al-Sahw.</p>
<blockquote><strong>Important principle:</strong> If you are consistently doubtful in prayer (Waswas), ignore the doubt and act upon the majority. This prevents Shaytan from disrupting your worship.</blockquote>
<h2>The Two Positions</h2>
<ul>
<li><strong>Before Salam</strong> — if you omitted a Wajib (e.g., first Tashahhud), perform Sujud al-Sahw before Salam</li>
<li><strong>After Salam</strong> — if you added something to the prayer (e.g., prayed 5 rak'ahs), perform Sujud al-Sahw after Salam</li>
<li>If in <strong>doubt</strong>, it is better to perform it <strong>before Salam</strong></li>
</ul>`,
        },
      ],
    },
    {
      title: "Quran Hifdh",
      slug: "hifdh-ul-quran",
      description:
        "A mentor-led Quran memorization journey covering all 30 Juz. Students are paired with a qualified Hafiz for live sessions, revision plans, and progress tracking.",
      category: CourseCategory.Quran,
      lessons: [
        {
          title: "Program Overview & Goal Setting",
          order: 1,
          duration: 30,
          content: `<h2>Welcome to Quran Hifdh</h2>
<p>This program is designed to help you <strong>memorize the Quran</strong> systematically with the guidance of a qualified teacher. Whether you are starting from scratch or continuing your journey, this structured approach will help you build consistency and achieve your goals.</p>
<blockquote>The Prophet ﷺ said: <strong>"The best among you are those who learn the Quran and teach it"</strong> (Bukhari). You are now embarking on one of the most rewarding journeys a Muslim can undertake.</blockquote>
<h2>How the Program Works</h2>
<ol>
<li><strong>Weekly live sessions</strong> — one-on-one with your appointed Ustadh/Ustadha via video call</li>
<li><strong>Daily memorization targets</strong> — set realistic goals (3-5 ayahs per day for beginners, 5-10 for intermediate)</li>
<li><strong>Revision cycles</strong> — structured daily, weekly, and monthly review of previously memorized portions</li>
<li><strong>Progress tracking</strong> — your teacher monitors your accuracy, tajweed, and fluency</li>
<li><strong>Assessment milestones</strong> — each Juz completed is formally assessed and signed off</li>
</ol>
<h2>Setting Your First Goal</h2>
<p>Use the SMART framework:</p>
<ul>
<li><strong>S</strong>pecific — "I will memorize Surah Al-Mulk this month"</li>
<li><strong>M</strong>easurable — "3 ayahs per day, 6 days per week"</li>
<li><strong>A</strong>chievable — based on your current schedule and memorization speed</li>
<li><strong>R</strong>elevant — aligns with your overall Quran journey</li>
<li><strong>T</strong>ime-bound — review and adjust weekly with your teacher</li>
</ul>
<h2>Daily Routine Recommendation</h2>
<ul>
<li><strong>Before Fajr:</strong> Review yesterday's memorization (15 min)</li>
<li><strong>Morning:</strong> New memorization session (30 min) — repetition is key</li>
<li><strong>After Asr:</strong> Weekly revision review (15 min)</li>
<li><strong>Before sleep:</strong> Listening to the target portion (10 min)</li>
</ul>`,
        },
        {
          title: "Memorization Methodology",
          order: 2,
          duration: 25,
          content: `<h2>Proven Memorization Techniques</h2>
<p>Memorizing the Quran is a skill that can be learned and improved with the right techniques. Here are the most effective methods used by Huffaz worldwide.</p>
<h2>1. The Repetition Cycle</h2>
<p>The most proven method for long-term retention:</p>
<ol>
<li><strong>Listen</strong> — listen to the target ayahs 5-10 times from a qualified reciter</li>
<li><strong>Read</strong> — follow along visually in the Mushaf while listening</li>
<li><strong>Repeat</strong> — repeat each phrase 10-20 times until fluent</li>
<li><strong>Connect</strong> — add the previous ayah and repeat the pair 5 times</li>
<li><strong>Consolidate</strong> — recite the entire page/section 5 times without looking</li>
</ol>
<h2>2. Chunking</h2>
<p>Break down longer ayahs into smaller chunks:</p>
<ul>
<li>Chunk by <strong>natural pause points</strong> (stop marks in the Mushaf)</li>
<li>Memorize each chunk individually, then connect them</li>
<li>Ayahs longer than one line should be split into 2-3 chunks</li>
</ul>
<h2>3. The "Three-Column" Method</h2>
<p>Write your daily plan:</p>
<ul>
<li><strong>Column 1:</strong> New memorization (today's target)</li>
<li><strong>Column 2:</strong> Yesterday's review (reinforce before new)</li>
<li><strong>Column 3:</strong> Weekly revision (previously memorized portions)</li>
</ul>
<h2>4. Audio Reinforcement</h2>
<p>Listen to the portion you are memorizing:</p>
<ul>
<li>During <strong>commute</strong> or household chores</li>
<li>At <strong>bedtime</strong> (the brain consolidates memory during sleep)</li>
<li>In <strong>prayer</strong> (recite your current memorization in Nafl prayers)</li>
</ul>
<blockquote>The Prophet ﷺ said: <strong>"The one who is proficient in the Quran will be with the noble, righteous scribes (angels), and the one who recites the Quran and stumbles over it, finding it difficult, will have a double reward"</strong> (Bukhari & Muslim).</blockquote>`,
        },
        {
          title: "Juz Amma — Surahs 78–93",
          order: 3,
          duration: 60,
          content: `<h2>Juz Amma: Surahs 78–93</h2>
<p>Juz Amma (the 30th and final Juz of the Quran) contains 37 surahs, mostly short and powerful. We will begin with the first half: Surahs 78 through 93.</p>
<blockquote><strong>Surah An-Naba (78):</strong> "About what are they asking one another? About the great news..." — This surah focuses on the Day of Resurrection and is one of the most powerful openers of Juz Amma.</blockquote>
<h2>Memorization Plan for These Surahs</h2>
<table>
<tr><th>Surah</th><th>Verses</th><th>Days to Memorize</th><th>Key Theme</th></tr>
<tr><td>78 — An-Naba</td><td>40</td><td>8</td><td>The Great News (Resurrection)</td></tr>
<tr><td>79 — An-Naziat</td><td>46</td><td>9</td><td>The Angels Who Extract</td></tr>
<tr><td>80 — Abasa</td><td>42</td><td>8</td><td>He Frowned</td></tr>
<tr><td>81 — At-Takwir</td><td>29</td><td>6</td><td>The Folding Up</td></tr>
<tr><td>82 — Al-Infitar</td><td>19</td><td>4</td><td>The Cleaving</td></tr>
<tr><td>83 — Al-Mutaffifin</td><td>36</td><td>7</td><td>The Defrauders</td></tr>
<tr><td>84 — Al-Inshiqaq</td><td>25</td><td>5</td><td>The Sundering</td></tr>
<tr><td>85 — Al-Buruj</td><td>22</td><td>5</td><td>The Mansions of the Stars</td></tr>
<tr><td>86 — At-Tariq</td><td>17</td><td>3</td><td>The Nightcomer</td></tr>
<tr><td>87 — Al-Ala</td><td>19</td><td>4</td><td>The Most High</td></tr>
<tr><td>88 — Al-Ghashiyah</td><td>26</td><td>5</td><td>The Overwhelming</td></tr>
<tr><td>89 — Al-Fajr</td><td>30</td><td>6</td><td>The Dawn</td></tr>
<tr><td>90 — Al-Balad</td><td>20</td><td>4</td><td>The City</td></tr>
<tr><td>91 — Ash-Shams</td><td>15</td><td>3</td><td>The Sun</td></tr>
<tr><td>92 — Al-Layl</td><td>21</td><td>4</td><td>The Night</td></tr>
<tr><td>93 — Ad-Duhaa</td><td>11</td><td>2</td><td>The Morning Hours</td></tr>
</table>
<h2>Tips for Memorizing Short Surahs</h2>
<ul>
<li>Use the <strong>musical rhythm</strong> — each surah has a unique flow that helps retention</li>
<li>Focus on <strong>similar ayahs</strong> — many surahs in Juz Amma have repeating patterns</li>
<li>Learn the <strong>meaning</strong> — understanding the theme helps anchor the verses in memory</li>
<li>Recite in <strong>Fajr prayer</strong> — what you memorize at night, confirm in the morning prayer</li>
</ul>`,
        },
        {
          title: "Juz Amma — Surahs 94–114",
          order: 4,
          duration: 60,
          content: `<h2>Juz Amma: Surahs 94–114</h2>
<p>Continuing through Juz Amma, these shorter surahs are some of the most frequently recited in daily prayers. Master them well — they will accompany you throughout your life.</p>
<h2>Memorization Plan</h2>
<table>
<tr><th>Surah</th><th>Verses</th><th>Days</th><th>Key Theme</th></tr>
<tr><td>94 — Ash-Sharh</td><td>8</td><td>1</td><td>Comfort after hardship</td></tr>
<tr><td>95 — At-Tin</td><td>8</td><td>1</td><td>The Fig — creation and judgment</td></tr>
<tr><td>96 — Al-Alaq</td><td>19</td><td>4</td><td>The Clot — first revelation</td></tr>
<tr><td>97 — Al-Qadr</td><td>5</td><td>1</td><td>The Night of Power</td></tr>
<tr><td>98 — Al-Bayyinah</td><td>8</td><td>2</td><td>The Clear Evidence</td></tr>
<tr><td>99 — Az-Zalzalah</td><td>8</td><td>2</td><td>The Earthquake</td></tr>
<tr><td>100 — Al-Adiyat</td><td>11</td><td>2</td><td>The War Horses</td></tr>
<tr><td>101 — Al-Qariah</td><td>11</td><td>2</td><td>The Striking Calamity</td></tr>
<tr><td>102 — At-Takathur</td><td>8</td><td>1</td><td>The Competition for More</td></tr>
<tr><td>103 — Al-Asr</td><td>3</td><td>1</td><td>The Time — loss except for faith</td></tr>
<tr><td>104 — Al-Humazah</td><td>9</td><td>2</td><td>The Slanderer</td></tr>
<tr><td>105 — Al-Fil</td><td>5</td><td>1</td><td>The Elephant — Abraha's army</td></tr>
<tr><td>106 — Quraysh</td><td>4</td><td>1</td><td>The Tribe of Quraysh</td></tr>
<tr><td>107 — Al-Maun</td><td>7</td><td>1</td><td>Small kindnesses</td></tr>
<tr><td>108 — Al-Kawthar</td><td>3</td><td>1</td><td>Abundance</td></tr>
<tr><td>109 — Al-Kafirun</td><td>6</td><td>1</td><td>Freedom of religion</td></tr>
<tr><td>110 — An-Nasr</td><td>3</td><td>1</td><td>Divine help and victory</td></tr>
<tr><td>111 — Al-Masad</td><td>5</td><td>1</td><td>Abu Lahab</td></tr>
<tr><td>112 — Al-Ikhlas</td><td>4</td><td>1</td><td>Pure monotheism</td></tr>
<tr><td>113 — Al-Falaq</td><td>5</td><td>1</td><td>The Daybreak — seeking refuge</td></tr>
<tr><td>114 — An-Nas</td><td>6</td><td>1</td><td>Mankind — seeking refuge</td></tr>
</table>
<blockquote><strong>Motivation:</strong> Many of these surahs are recited in every prayer. Imagine the reward — every time you recite them in Salah for the rest of your life, each letter is multiplied 10 times in reward!</blockquote>`,
        },
        {
          title: "Revision Strategy",
          order: 5,
          duration: 20,
          content: `<h2>The Key to Retention: Consistent Revision</h2>
<p>Memorization without revision is like filling a leaky bucket. The most common reason students lose their Hifdh is the <strong>lack of a structured revision system</strong>. This lesson provides a sustainable framework.</p>
<h2>The 3-Tier Revision System</h2>
<h3>Tier 1: Daily Revision (10-15 minutes)</h3>
<ul>
<li>Review the <strong>most recent 7 days</strong> of memorization</li>
<li>Recite each portion once from memory</li>
<li>Mark any ayahs that need attention</li>
</ul>
<h3>Tier 2: Weekly Revision (30 minutes)</h3>
<ul>
<li>Review <strong>all memorization from the current month</strong></li>
<li>Recite to a partner or teacher if possible</li>
<li>Focus on weak spots identified in daily revision</li>
</ul>
<h3>Tier 3: Monthly/Comprehensive Revision (1-2 hours)</h3>
<ul>
<li>Review <strong>all previously memorized Juz</strong></li>
<li>For those with 5+ Juz: review one Juz per day in a rotating cycle</li>
<li>Use the <strong>"One Juz per Day"</strong> method for those who have completed the full Quran</li>
</ul>
<h2>Practical Schedule Example</h2>
<table>
<tr><th>Time</th><th>Activity</th><th>Duration</th></tr>
<tr><td>After Fajr</td><td>Daily revision (last 7 days)</td><td>15 min</td></tr>
<tr><td>Morning</td><td>New memorization session</td><td>30 min</td></tr>
<tr><td>After Maghrib</td><td>Weekly revision (Saturday)</td><td>30 min</td></tr>
<tr><td>End of month</td><td>Monthly comprehensive review</td><td>60-120 min</td></tr>
</table>
<h2>Common Revision Mistakes</h2>
<ul>
<li><strong>Only looking forward</strong> — always pushing to new material without solidifying old material</li>
<li><strong>Skipping the "hard pages"</strong> — the ayahs you dislike reviewing are the ones you need most</li>
<li><strong>Not reciting to someone</strong> — self-reciting hides subtle mistakes that only a listener catches</li>
<li><strong>Inconsistent schedule</strong> — a 10-minute daily habit beats a 2-hour weekly session</li>
</ul>`,
        },
        {
          title: "Juz 29 — Selected Surahs",
          order: 6,
          duration: 90,
          content: `<h2>Juz 29: Tabarak</h2>
<p>Juz 29 (also known as Tabarak, named after its first surah Al-Mulk) contains 11 surahs, many of which are regularly recited in Salah, especially at night (Qiyam) and in Maghrib and Isha prayers.</p>
<h2>Focus Surahs for This Session</h2>
<h3>1. Surah Al-Mulk (67) — 30 verses</h3>
<p><strong>The Sovereignty.</strong> A powerful protector — it is reported that this surah intercedes for its reciter and protects from the punishment of the grave.</p>
<ul>
<li>Memorize <strong>3 verses per day</strong> over 10 days</li>
<li>Focus on the rhythmic pattern in verses 1-10</li>
<li>Key phrase: <strong>"تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ"</strong></li>
</ul>
<h3>2. Surah Al-Qalam (68) — 52 verses</h3>
<p><strong>The Pen.</strong> The second surah revealed in Makkah, focusing on the character of the Prophet ﷺ and the contrast between truth and falsehood.</p>
<h3>3. Surah Al-Haaqqah (69) — 52 verses</h3>
<p><strong>The Inevitable Reality.</strong> Vivid descriptions of the Day of Judgment and the fate of past nations.</p>
<h3>4. Surah Al-Ma'arij (70) — 44 verses</h3>
<p><strong>The Ascending Stairways.</strong> Discusses the angels' ascent and the qualities of those who will be saved.</p>
<blockquote><strong>Tip:</strong> Surahs in Juz 29 are longer and more detailed than Juz Amma. Increase your daily time allocation to 45-60 minutes for this Juz.</blockquote>`,
        },
        {
          title: "Live Session: Recitation to Teacher",
          order: 7,
          duration: 45,
          content: `<h2>Preparing for Your Live Session</h2>
<p>Your weekly one-on-one session with the teacher is the <strong>most important component</strong> of the Hifdh program. This is where mistakes are caught, Tajweed is refined, and your memorization is solidified.</p>
<h2>Before the Session</h2>
<ul>
<li><strong>Prepare your portion</strong> — review what you will recite 3-5 times</li>
<li><strong>Mark difficult spots</strong> — note ayahs where you frequently stumble</li>
<li><strong>Test yourself</strong> — recite without looking, then check the Mushaf for errors</li>
<li><strong>Be on time</strong> — join the session 2-3 minutes early</li>
<li><strong>Prepare questions</strong> — ask about Tajweed rules or similar ayahs you find confusing</li>
</ul>
<h2>During the Session</h2>
<ul>
<li><strong>Recite clearly</strong> — even if you make mistakes, the teacher needs to hear the actual recitation</li>
<li><strong>Don't rush</strong> — take your time, apply Tajweed rules consciously</li>
<li><strong>Accept correction gracefully</strong> — each correction is a step toward mastery</li>
<li><strong>Repeat after correction</strong> — recite the corrected portion 2-3 times</li>
<li><strong>Record the session</strong> (with permission) for later review</li>
</ul>
<h2>After the Session</h2>
<ul>
<li><strong>Review corrections</strong> — practice the corrected portions before your next session</li>
<li><strong>Update your revision list</strong> — move corrected ayahs to your "mastered" list</li>
<li><strong>Note teacher feedback</strong> — keep a running log of Tajweed points to focus on</li>
</ul>`,
        },
        {
          title: "Common Mistakes in Hifdh",
          order: 8,
          duration: 20,
          content: `<h2>Frequently Confused Ayahs</h2>
<p>Every student of Hifdh encounters ayat that look or sound similar. The Quran contains many parallel passages, especially in stories that are repeated across different surahs. This lesson covers the most common ones and strategies to distinguish them.</p>
<h2>Types of Similar Ayahs</h2>
<h3>1. Repeated Stories (Full Parallels)</h3>
<p>The story of <strong>Musa (AS) and Pharoah</strong>, the story of <strong>Adam and Iblis</strong>, and descriptions of <strong>Paradise and Hell</strong> appear in multiple surahs with slight variations.</p>
<p><strong>Strategy:</strong> Create a chart showing which details are unique to each occurrence. Focus on the opening words — they are usually the key difference.</p>
<h3>2. Identical Beginnings, Different Endings</h3>
<p>Example: <strong>"وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ"</strong> appears 10 times in Surah Al-Mursalat (77), each followed by a different consequence.</p>
<p><strong>Strategy:</strong> Memorize the <strong>connecting word</strong> after the repeated phrase. Create a mental "chain" of what comes next in each case.</p>
<h3>3. One-letter Differences</h3>
<p>Some ayahs differ by just one letter or word. Example: <strong>"فَادْعُوَا اللَّهَ"</strong> vs <strong>"فَادْعُ اللَّهَ"</strong></p>
<p><strong>Strategy:</strong> Physically underline the different letter/word in your Mushaf. Recite the pair side by side 5 times each.</p>
<h2>Top 5 Most Confused Ayahs</h2>
<ol>
<li><strong>"وَالسَّمَاءَ بَنَيْنَاهَا"</strong> (51:47) vs <strong>"وَبَنَيْنَا فَوْقَكُمْ سَبْعًا شِدَادًا"</strong> (78:12)</li>
<li><strong>"إِنَّ الْأَبْرَارَ"</strong> openings in 76:5 vs 83:18 vs 83:22 — each has a different continuation</li>
<li><strong>"يَوْمَ يُنفَخُ فِي الصُّورِ"</strong> appears in 6:73, 18:99, 20:102, 23:101, 27:87, 36:51, 39:68, 50:20, 69:13, 78:18 — all with different continuations</li>
<li><strong>"الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَى"</strong> appears in 7:54, 10:3, 13:2, 20:5, 25:59, 32:4, 57:4 — each in a different context</li>
</ol>
<blockquote><strong>Golden Rule:</strong> When you encounter a familiar-sounding ayah, <strong>pause</strong> and consciously identify which surah you are in. The context is your strongest memory anchor.</blockquote>`,
        },
        {
          title: "Dua & Spiritual Preparation",
          order: 9,
          duration: 15,
          content: `<h2>The Spiritual Dimension of Hifdh</h2>
<p>Memorizing the Quran is not merely an intellectual exercise — it is a <strong>spiritual journey</strong> that requires sincerity, humility, and reliance on Allah. Without the spiritual dimension, the memorization becomes dry and difficult to retain.</p>
<blockquote>Allah says: <strong>"And We have certainly made the Quran easy to remember, but is there any who will take heed?"</strong> (Surah Al-Qamar 54:17). The key is in <strong>sincerity</strong> and <strong>seeking Allah's help</strong>.</blockquote>
<h2>Recommended Duas for Memorization</h2>
<h3>Before Memorizing</h3>
<p><strong>"اللهم ارزقني حفظ كتابك واتباع سنّة نبيك عليه الصلاة والسلام"</strong><br>
<em>O Allah, grant me the memorization of Your Book and the following of the Sunnah of Your Prophet.</em></p>
<h3>When Facing Difficulty</h3>
<p><strong>"رب زدني علما"</strong> (Surah Ta-Ha 20:114)<br>
<em>My Lord, increase me in knowledge.</em></p>
<h3>After Memorizing</h3>
<p><strong>"اللهم اجعل القرآن ربيع قلبي ونور صدري وجلاء حزني وذهاب همي"</strong><br>
<em>O Allah, make the Quran the spring of my heart, the light of my chest, the remover of my sadness, and the dispeller of my anxiety.</em></p>
<h2>Spiritual Etiquette (Aadaab) of a Hafiz</h2>
<ul>
<li><strong>Guard your eyes and tongue</strong> — sins weaken the memory and create barriers to retaining knowledge</li>
<li><strong>Act upon what you memorize</strong> — the Quran becomes part of you through practice</li>
<li><strong>Maintain Wudu</strong> — recite in a state of purity whenever possible</li>
<li><strong>Face the Qiblah</strong> — even when memorizing, face the direction of prayer</li>
<li><strong>Weep when appropriate</strong> — the Quran was revealed to move hearts, not just minds</li>
<li><strong>Be humble</strong> — knowledge of the Quran is a gift, not an achievement to boast about</li>
<li><strong>Teach others</strong> — teaching reinforces memorization and earns ongoing reward</li>
</ul>`,
        },
        {
          title: "Progress Assessment — Juz Amma",
          order: 10,
          duration: 60,
          content: `<h2>Final Assessment: Juz Amma</h2>
<p>This session is your <strong>formal assessment</strong> for Juz Amma. You will recite the entire Juz from memory to your teacher for sign-off. This is a significant milestone — celebrate it!</p>
<h2>Assessment Checklist</h2>
<p>Before your assessment, ensure you can:</p>
<ul>
<li>Recite all 37 surahs of Juz Amma <strong>in order</strong> from memory</li>
<li>Recite any surah <strong>individually</strong> when asked (random selection)</li>
<li>Recite with <strong>correct Tajweed</strong> — Makharij, Sifaat, Noon/Meem Sakinah, Madd, Qalqalah</li>
<li>Recite at a <strong>moderate pace</strong> (Tadweer) without rushing</li>
<li>Identify and correct your own mistakes</li>
</ul>
<h2>What to Expect</h2>
<ol>
<li>The teacher may ask you to start from a <strong>random surah</strong></li>
<li>You may be stopped and asked to <strong>continue from a different point</strong></li>
<li>The teacher will note <strong>mistakes in Tajweed</strong> and <strong>accuracy of memorization</strong></li>
<li>After the recitation, the teacher will provide <strong>feedback</strong> and areas for improvement</li>
<li>Upon passing, the teacher will <strong>sign off</strong> on Juz Amma</li>
</ol>
<blockquote><strong>Mabrook on reaching this milestone!</strong> Completing Juz Amma is a tremendous achievement. Remember that the real journey begins now — maintaining what you have memorized through daily revision and continuing to the next Juz.</blockquote>`,
        },
      ],
    },
    {
      title: "Seerah — Life of the Prophet ﷺ",
      slug: "seerah-life-of-the-prophet",
      description:
        "A chronological journey through the life of Prophet Muhammad ﷺ from birth to the farewell sermon, weaving historical context with lessons for modern life.",
      category: CourseCategory.History,
      lessons: [
        {
          title: "Arabia Before Islam",
          order: 1,
          duration: 25,
          content: `<h2>The World Before the Revelation</h2>
<p>To understand the impact of Islam, we must first understand the world into which it was revealed. The Arabian Peninsula before Prophet Muhammad ﷺ was a land of stark contrasts — known for <strong>poetry</strong> and <strong>generosity</strong>, yet plagued by <strong>tribal warfare</strong> and <strong>moral decay</strong>.</p>
<h2>Political Landscape</h2>
<ul>
<li>No <strong>central government</strong> — Arabia was divided into warring tribes</li>
<li>Makkah was an <strong>independent city-state</strong> governed by the Quraysh tribe</li>
<li>The <strong>Byzantine and Persian empires</strong> dominated the north, but Arabia remained unconquered</li>
<li>Justice was based on <strong>tribal custom</strong> and <strong>retaliation</strong> — there was no written law</li>
</ul>
<h2>Religious Landscape</h2>
<ul>
<li><strong>Idol worship</strong> was the dominant religion. The Kaaba housed 360 idols</li>
<li>Small communities of <strong>Jews</strong> (in Yathrib/Madinah and Khaybar) and <strong>Christians</strong> (in Najran)</li>
<li><strong>Hanifs</strong> — a small group of monotheists who rejected idol worship and followed the pure religion of Ibrahim (AS)</li>
<li><strong>Zoroastrianism</strong> influenced by the nearby Persian empire</li>
</ul>
<h2>Social and Moral Conditions</h2>
<ul>
<li><strong>Female infanticide</strong> — burying newborn girls alive was common among some tribes</li>
<li><strong>Alcohol, gambling, and usury</strong> were widespread and socially accepted</li>
<li><strong>Slavery</strong> was a normal part of society, with slaves having few rights</li>
<li><strong>Tribal loyalty</strong> (Asabiyyah) superseded any concept of universal justice</li>
<li>Yet they had <strong>noble qualities</strong>: unmatched hospitality, courage, eloquence, and keeping promises</li>
</ul>
<blockquote>Allah describes this period: <strong>"And you were on the brink of a pit of fire, and He saved you from it"</strong> (Surah Aal-e-Imran 3:103). The Arabs themselves recognized their degradation and called it the <strong>Jahiliyyah</strong> — the Age of Ignorance.</blockquote>`,
        },
        {
          title: "Birth & Early Life",
          order: 2,
          duration: 30,
          content: `<h2>The Birth of the Prophet ﷺ</h2>
<p>Prophet Muhammad ﷺ was born in <strong>Makkah</strong> in the <strong>Year of the Elephant</strong> (approximately 570 CE) — the same year Abraha's army attacked the Kaaba with elephants and was destroyed by Allah's command.</p>
<blockquote>His birth was accompanied by miraculous signs. His mother Aminah reported that she felt no pain during delivery and saw a light emanating from her that illuminated the palaces of Syria.</blockquote>
<h2>Early Childhood</h2>
<ul>
<li><strong>Abdullah</strong> (his father) died before he was born</li>
<li>Sent to the desert to be nursed by <strong>Halimah as-Sa'diyah</strong> of the Banu Sa'd tribe — a custom for strengthening children</li>
<li>Two angels <strong>cleansed his heart</strong> during this period — an event that perplexed Halimah</li>
<li>Returned to his mother <strong>Aminah</strong> at age 5</li>
<li>Aminah passed away when he was <strong>6 years old</strong></li>
<li>Cared for by his grandfather <strong>Abdul-Muttalib</strong>, who loved him dearly</li>
<li>Abdul-Muttalib passed away when Muhammad was <strong>8</strong>, leaving him in the care of his uncle <strong>Abu Talib</strong></li>
</ul>
<h2>Youth and Adulthood</h2>
<ul>
<li>Grew up known as <strong>"Al-Amin"</strong> (the Trustworthy) and <strong>"As-Sadiq"</strong> (the Truthful)</li>
<li>Worked as a <strong>shepherd</strong> — a common profession of prophets</li>
<li>At age 25, he entered the service of <strong>Khadijah bint Khuwaylid</strong>, a wealthy merchant widow</li>
<li>Impressed by his honesty and good character, Khadijah proposed marriage</li>
<li>They married and had <strong>six children</strong> — two sons (who died in infancy) and four daughters</li>
</ul>`,
        },
        {
          title: "The First Revelation",
          order: 3,
          duration: 30,
          content: `<h2>The Cave of Hira</h2>
<p>At age 40, the Prophet ﷺ began to retreat to <strong>Cave Hira</strong> on the mountain of Light (Jabal an-Noor) outside Makkah, where he would meditate and contemplate the Creator. It was here that the most significant event in human history unfolded.</p>
<blockquote><strong>Narrated Aisha (RA):</strong> "The first revelation began with true visions in sleep. The Prophet would not see a vision except it came like the break of dawn. Then he came to love seclusion and would stay in the Cave of Hira for many nights..."</blockquote>
<h2>The Descent of Jibril (AS)</h2>
<p>One night, the Angel <strong>Jibril (AS)</strong> appeared and commanded: <strong>"Iqra!"</strong> (Read!).</p>
<ul>
<li>The Prophet ﷺ replied: <strong>"I am not one who reads"</strong> (he was unlettered)</li>
<li>Jibril <strong>embraced him tightly</strong> three times, each time commanding him to read</li>
<li>Finally, Jibril revealed the first verses of <strong>Surah Al-Alaq (96:1-5)</strong>:</li>
</ul>
<blockquote><strong>"Recite in the name of your Lord who created — Created man from a clot. Recite, and your Lord is the Most Generous — Who taught by the pen — Taught man that which he knew not."</strong></blockquote>
<h2>The Return to Khadijah</h2>
<p>Trembling and overwhelmed, the Prophet ﷺ returned to Khadijah saying: <strong>"Cover me! Cover me!"</strong> He told her what had happened, and she became the <strong>first person to believe in his prophethood</strong>.</p>
<p>She took him to her cousin <strong>Waraqah ibn Nawfal</strong>, a Christian scholar who confirmed: <strong>"This is the same angel that Allah sent to Moses. I wish I could be alive when your people drive you out"</strong> — foreseeing the persecution to come.</p>`,
        },
        {
          title: "The Makkan Period — Early Dawah",
          order: 4,
          duration: 35,
          content: `<h2>The Early Call to Islam</h2>
<p>The Prophet ﷺ began his mission with <strong>secret calls</strong> to those he trusted most. For three years, Islam spread quietly among close friends and family.</p>
<h2>The First Believers</h2>
<ul>
<li><strong>Khadijah bint Khuwaylid</strong> — first believer, first wife, unwavering supporter</li>
<li><strong>Ali ibn Abi Talib</strong> — first child to accept Islam (age 10)</li>
<li><strong>Abu Bakr as-Siddiq</strong> — first adult male outside the family to accept Islam</li>
<li><strong>Zayd ibn Harithah</strong> — freed slave and adopted son</li>
<li><strong>Bilal ibn Rabah</strong>, <strong>Ammar ibn Yasir</strong>, <strong>Sumayyah bint Khabbab</strong> — early converts from marginalized backgrounds</li>
</ul>
<h2>The Open Call</h2>
<p>After three years, Allah commanded the Prophet ﷺ to <strong>call openly</strong>. He ascended Mount Safa and addressed the Quraysh: <strong>"If I told you that an army was behind this mountain, would you believe me?"</strong> They replied: <strong>"We have never known you to lie."</strong></p>
<p>He then declared: <strong>"I am a warner to you of a severe punishment before you."</strong> His uncle <strong>Abu Lahab</strong> cursed him publicly, and the Quraysh began their campaign of opposition.</p>
<blockquote>Allah revealed in response: <strong>"Perish the hands of Abu Lahab and perish he!"</strong> (Surah Al-Masad 111) — a powerful confirmation that the Prophet's message was from Allah.</blockquote>
<h2>The Quraysh's Response</h2>
<ul>
<li><strong>Mockery and ridicule</strong> — calling him a poet, magician, or madman</li>
<li><strong>Offers of wealth and power</strong> — they offered him kingship, wealth, and marriage to the most beautiful women if he would stop</li>
<li><strong>Prophet's reply:</strong> "By Allah, if they put the sun in my right hand and the moon in my left, I would not abandon this mission until Allah makes it prevail or I perish trying."</li>
</ul>`,
        },
        {
          title: "Persecution & Patience",
          order: 5,
          duration: 30,
          content: `<h2>The Trials of the Early Muslims</h2>
<p>As the Quraysh realized that offers and mockery would not stop the Prophet ﷺ, they escalated to <strong>systematic persecution</strong> of the believers — especially the weak and unprotected.</p>
<h2>Forms of Persecution</h2>
<ul>
<li><strong>Physical torture</strong> — Bilal was made to lie on burning sand with rocks on his chest. Ammar's parents were tortured to death before his eyes</li>
<li><strong>Social boycott</strong> — the Banu Hashim were confined to a valley for three years, unable to trade or marry</li>
<li><strong>Economic pressure</strong> — Muslims were boycotted, their goods confiscated</li>
<li><strong>Psychological warfare</strong> — constant ridicule, threats, and intimidation</li>
</ul>
<h2>The Year of Grief (Aam al-Huzn)</h2>
<p>In the 10th year of prophethood, the Prophet ﷺ suffered two devastating losses:</p>
<ol>
<li><strong>Khadijah (RA)</strong> — his beloved wife of 25 years, his confidante and first supporter — passed away</li>
<li><strong>Abu Talib</strong> — his protective uncle who shielded him from the Quraysh — also died</li>
</ol>
<p>With the loss of his two main protectors, the persecution intensified. The Prophet ﷺ called this <strong>"the Year of Grief."</strong></p>
<h2>The Journey to Ta'if</h2>
<p>Seeking a new base for Islam, the Prophet ﷺ traveled to <strong>Ta'if</strong>. The people rejected him cruelly, <strong>stoning him</strong> until his feet bled. As he retreated to a garden, the angel of the mountains offered to crush the people between two mountains — but the Prophet ﷺ refused, saying:</p>
<blockquote><strong>"I hope that Allah will bring from their descendants people who will worship Allah alone."</strong> — This profound mercy is a lesson for all time.</blockquote>`,
        },
        {
          title: "The Night Journey & Ascension (Isra & Mi'raj)",
          order: 6,
          duration: 35,
          content: `<h2>The Journey of Journeys</h2>
<p>In the midst of the grief and hardship, Allah honored the Prophet ﷺ with the greatest miracle — the <strong>Night Journey</strong> (Isra) and <strong>Heavenly Ascension</strong> (Mi'raj). This event is described in the Quran and Hadith in remarkable detail.</p>
<blockquote>Allah says: <strong>"Exalted is He who took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings We have blessed, to show him of Our signs. Indeed, He is the Hearing, the Seeing."</strong> (Surah Al-Isra 17:1)</blockquote>
<h2>The Isra (Night Journey)</h2>
<ul>
<li>The Prophet ﷺ was transported from the <strong>Kaaba in Makkah</strong> to <strong>Masjid al-Aqsa in Jerusalem</strong> on the winged steed <strong>Al-Buraq</strong></li>
<li>In Jerusalem, he <strong>led all the previous prophets in prayer</strong> — a symbol of his leadership of all humanity</li>
<li>He was offered two vessels: <strong>wine and milk</strong>. He chose milk, and Jibril said: "You have chosen the natural disposition (Fitrah)."</li>
</ul>
<h2>The Mi'raj (Ascension)</h2>
<p>From Jerusalem, the Prophet ﷺ ascended through the seven heavens:</p>
<ul>
<li><strong>First heaven:</strong> Met Prophet Adam (AS)</li>
<li><strong>Second heaven:</strong> Met Prophets Yahya (John) and Isa (Jesus) (AS)</li>
<li><strong>Third heaven:</strong> Met Prophet Yusuf (Joseph) (AS)</li>
<li><strong>Fourth heaven:</strong> Met Prophet Idris (AS)</li>
<li><strong>Fifth heaven:</strong> Met Prophet Harun (Aaron) (AS)</li>
<li><strong>Sixth heaven:</strong> Met Prophet Musa (Moses) (AS)</li>
<li><strong>Seventh heaven:</strong> Met Prophet Ibrahim (Abraham) (AS)</li>
<li><strong>Sidrat al-Muntaha:</strong> The Lote Tree of the Utmost Boundary — where he received the command for <strong>50 daily prayers</strong>, later reduced to <strong>5</strong> after Musa's advice</li>
</ul>
<h2>Lessons from Isra and Mi'raj</h2>
<ul>
<li><strong>Hardship is followed by ease</strong> — the greatest spiritual gift came after the worst worldly trial</li>
<li><strong>The five daily prayers</strong> were gifted directly by Allah — their importance is unmatched</li>
<li><strong>Faith transcends time and space</strong> — all prophets are united in the message of Tawheed</li>
</ul>`,
        },
        {
          title: "The Hijrah to Madinah",
          order: 7,
          duration: 40,
          content: `<h2>The Migration to Madinah</h2>
<p>As persecution intensified and the Quraysh plotted to assassinate the Prophet ﷺ, Allah gave permission for the Muslims to <strong>migrate</strong> to the city of <strong>Yathrib</strong> (later renamed Madinah al-Munawwarah). This migration (Hijrah) marks the beginning of the Islamic calendar.</p>
<h2>The Planning</h2>
<ul>
<li>The Prophet ﷺ and <strong>Abu Bakr (RA)</strong> hid in the <strong>Cave of Thawr</strong> for three days</li>
<li>Allah caused a <strong>spider to weave a web</strong> and a <strong>bird to nest</strong> at the cave entrance, convincing the pursuers it was empty</li>
<li>They hired a guide from a different tribe for secrecy</li>
<li>The journey took <strong>8-10 days</strong> on camelback through desert terrain</li>
</ul>
<h2>The Arrival in Madinah</h2>
<p>The entire city welcomed the Prophet ﷺ with joy. People sang:</p>
<blockquote><strong>"The full moon has risen over us — from the passes of Thaniyat al-Wada — gratitude is due to Allah — as long as any caller calls to Allah."</strong></blockquote>
<p>Every family wanted the Prophet ﷺ to stay with them. He let his camel, <strong>Qaswa</strong>, decide — wherever it knelt, that would be his home. It knelt at the site where the <strong>Prophet's Mosque (Masjid an-Nabawi)</strong> now stands.</p>
<h2>Key Actions in Madinah</h2>
<ul>
<li><strong>Built the first mosque</strong> — Masjid an-Nabawi, the center of the new community</li>
<li><strong>Established brotherhood</strong> (Muakhah) — pairing each Muhajir (immigrant from Makkah) with an Ansar (helper from Madinah) as brothers</li>
<li><strong>Drafted the Constitution of Madinah</strong> — the first written constitution in history, guaranteeing rights for Muslims, Jews, and other communities</li>
<li><strong>Built a market</strong> — economic independence from the Quraysh</li>
</ul>`,
        },
        {
          title: "Building the Islamic State in Madinah",
          order: 8,
          duration: 35,
          content: `<h2>The Foundations of Islamic Civilization</h2>
<p>In Madinah, the Prophet ﷺ established the <strong>first Islamic state</strong> — a model of governance, social justice, and community organization that would transform the world.</p>
<h2>The Constitution of Madinah</h2>
<p>This remarkable document, written by the Prophet ﷺ himself, established:</p>
<ul>
<li><strong>Unity of the community</strong> — Muslims, Jews, and polytheists formed one nation (Ummah)</li>
<li><strong>Freedom of religion</strong> — "The Jews have their religion, and the Muslims have theirs"</li>
<li><strong>Mutual defense</strong> — all parties would defend the city against attack</li>
<li><strong>Justice for all</strong> — the Prophet ﷺ was the final authority in disputes</li>
<li><strong>Blood money and ransom</strong> — a system of compensation to prevent endless tribal feuds</li>
</ul>
<blockquote>This constitution is considered the <strong>first written constitution in human history</strong>, predating the Magna Carta by nearly 600 years.</blockquote>
<h2>The Brotherhood (Muakhah)</h2>
<p>Each immigrant from Makkah was paired with a resident of Madinah as a <strong>brother in faith</strong>. This created an unprecedented social bond:</p>
<ul>
<li>The Ansar shared their <strong>homes, businesses, and farms</strong> with their Muhajir brothers</li>
<li>When property was divided, the Ansar insisted on giving half to their brothers</li>
<li>This brotherhood was so strong that they even <strong>inherited from each other</strong> (a temporary ruling later abrogated)</li>
</ul>
<h2>The Role of the Masjid</h2>
<p>Masjid an-Nabawi was not just a place of prayer — it was:</p>
<ul>
<li>A <strong>school</strong> — where the Sahabah learned Quran and Islam</li>
<li>A <strong>court</strong> — where disputes were resolved</li>
<li>A <strong>community center</strong> — where social gatherings and events took place</li>
<li>A <strong>guest house</strong> — where visitors and delegations were hosted</li>
<li>A <strong>hospital</strong> — where the wounded were treated after battles</li>
</ul>`,
        },
        {
          title: "The Major Battles",
          order: 9,
          duration: 50,
          content: `<h2>Defending the New State</h2>
<p>The Quraysh of Makkah could not tolerate the existence of an independent Muslim state in Madinah. They launched several military campaigns to destroy it. The Prophet ﷺ, under divine guidance, responded with strategic defensive battles.</p>
<h2>Battle of Badr (2 AH / 624 CE)</h2>
<p>The first and most significant battle.</p>
<ul>
<li><strong>Muslims:</strong> 313 poorly equipped men, 2 horses, 70 camels</li>
<li><strong>Quraysh:</strong> 1,000 well-armed men, 200 horses</li>
<li><strong>Outcome:</strong> Decisive Muslim victory — 70 Quraysh killed, 70 captured</li>
<li><strong>Significance:</strong> Established the Muslims as a military force. Allah sent angels to fight alongside them</li>
</ul>
<blockquote>Allah says: <strong>"And Allah had certainly helped you at Badr when you were weak. So fear Allah that you may be grateful."</strong> (Surah Aal-e-Imran 3:123)</blockquote>
<h2>Battle of Uhud (3 AH / 625 CE)</h2>
<ul>
<li><strong>Muslims:</strong> 700 men</li>
<li><strong>Quraysh:</strong> 3,000 men, including 200 cavalry led by Khalid ibn al-Walid</li>
<li><strong>Outcome:</strong> Initial Muslim advantage turned to defeat when <strong>archers disobeyed</strong> the Prophet's order to hold their position</li>
<li><strong>Losses:</strong> 70 Muslims martyred, including the Prophet's beloved uncle <strong>Hamzah (RA)</strong></li>
<li><strong>Lesson:</strong> Obedience to the leader is paramount; even partial disobedience can reverse victory</li>
</ul>
<h2>Battle of the Trench (Khandaq) — 5 AH / 627 CE</h2>
<ul>
<li>A coalition of 10,000 enemy forces besieged Madinah</li>
<li>The Prophet ﷺ acted on the advice of <strong>Salman al-Farsi (RA)</strong> to dig a trench around the city</li>
<li>After a month-long siege, a <strong>windstorm</strong> sent by Allah scattered the coalition</li>
<li><strong>Significance:</strong> The last major military campaign against Madinah; after this, Islam spread rapidly</li>
</ul>`,
        },
        {
          title: "The Farewell Sermon & Legacy",
          order: 10,
          duration: 40,
          content: `<h2>The Final Year</h2>
<p>In the 10th year after Hijrah (632 CE), the Prophet ﷺ performed his <strong>only Hajj</strong> — known as <strong>Hajjat al-Wada</strong> (the Farewell Pilgrimage). During this pilgrimage, he delivered the most comprehensive sermon ever given, addressing the core principles of Islam.</p>
<h2>The Farewell Sermon (Khutbat al-Wada)</h2>
<p>Standing at <strong>Mount Arafat</strong>, addressing over 100,000 companions, the Prophet ﷺ said:</p>
<blockquote>"O people, listen to me carefully. I do not know whether I will ever meet you here again after this year.<br><br>
<strong>Your lives and property are sacred</strong> — as sacred as this day, this month, and this city.<br><br>
<strong>All usury (riba) is abolished</strong> — your capital is yours, do not wrong and you will not be wronged.<br><br>
<strong>O people, indeed your Lord is One</strong>, and your father is one. All of you are from Adam, and Adam was from dust. <strong>An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab, nor white over black, nor black over white — except through piety.</strong><br><br>
<strong>I leave among you two weighty things:</strong> the Book of Allah and my Sunnah. If you hold to them, you will never go astray."</blockquote>
<h2>The Prophet's Legacy</h2>
<ul>
<li>He transformed a <strong>backward tribal society</strong> into the <strong>greatest civilization</strong> the world had ever seen</li>
<li>In just 23 years, he established a <strong>complete way of life</strong> — spiritual, social, political, and economic</li>
<li>He left behind a <strong>perfect example</strong> (Uswah Hasanah) for all humanity until the end of time</li>
<li>His teachings now guide over <strong>1.8 billion people</strong> across the globe</li>
</ul>
<blockquote>Allah says: <strong>"There has certainly been for you in the Messenger of Allah an excellent example for anyone whose hope is in Allah and the Last Day and who remembers Allah often."</strong> (Surah Al-Ahzab 33:21)</blockquote>
<h2>The Prophet's Passing</h2>
<p>On <strong>12 Rabi' al-Awwal, 11 AH</strong> (632 CE), the Prophet Muhammad ﷺ passed away in the home of his beloved wife Aisha (RA), at the age of 63. His last words were:</p>
<blockquote><strong>"O Allah, with the Highest Companion"</strong> (Ar-Rafiq al-A'la) — choosing the company of Allah and the prophets over this world.</blockquote>
<p>He was buried in the exact spot where he died, in the room of Aisha (RA), which is now part of Masjid an-Nabawi in Madinah.</p>`,
        },
      ],
    },
  ];

  for (const { lessons, ...courseData } of coursesData) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: { ...courseData, isActive: true },
    });

    for (const lesson of lessons) {
      const existing = await prisma.lesson.findFirst({
        where: { courseId: course.id, order: lesson.order },
      });
      if (!existing) {
        await prisma.lesson.create({
          data: { ...lesson, courseId: course.id },
        });
      }
    }
  }

  console.log("✔ Courses & lessons seeded");

  // ─── Enrollments ──────────────────────────────────────────────────────────
  const tajweedCourse = await prisma.course.findUnique({
    where: { slug: "tajweed-foundations" },
  });
  const hifdhCourse = await prisma.course.findUnique({
    where: { slug: "hifdh-ul-quran" },
  });

  if (tajweedCourse) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId: tajweedCourse.id },
      },
      update: {},
      create: { userId: student.id, courseId: tajweedCourse.id, progress: 30 },
    });
  }

  if (hifdhCourse) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId: hifdhCourse.id },
      },
      update: {},
      create: { userId: student.id, courseId: hifdhCourse.id, progress: 10 },
    });
  }

  console.log("✔ Enrollments seeded");
  // ─── Mentorship ───────────────────────────────────────────────────────────
  const mentorship = await prisma.mentorship.upsert({
    where: {
      teacherId_studentId: { teacherId: teacher.id, studentId: student.id },
    },
    update: {},
    create: { teacherId: teacher.id, studentId: student.id },
  });

  console.log("✔ Mentorship seeded");

  // ─── Availability ─────────────────────────────────────────────────────────
  const slots = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }, // Monday
    { dayOfWeek: 3, startTime: "09:00", endTime: "12:00" }, // Wednesday
    { dayOfWeek: 6, startTime: "14:00", endTime: "17:00" }, // Saturday
  ];

  for (const slot of slots) {
    await prisma.availability.create({
      data: { userId: teacher.id, ...slot, isRecurring: true },
    });
  }

  console.log("✔ Availability seeded");

  // ─── Appointment ──────────────────────────────────────────────────────────
  await prisma.appointment.create({
    data: {
      mentorshipId: mentorship.id,
      teacherId: teacher.id,
      title: "Tajweed Review — Noon Sakinah",
      description:
        "Review of Noon Sakinah and Tanween rules with recitation practice.",
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      meetingUrl: "https://meet.google.com/placeholder",
    },
  });

  console.log("✔ Appointment seeded");

  // ─── Bookmarks ────────────────────────────────────────────────────────────
  const bookmarks = [
    { surah: 2, ayah: 255, note: "Ayat al-Kursi — memorize this" },
    { surah: 18, ayah: 1, note: "Beginning of Surah Al-Kahf" },
    { surah: 36, ayah: 1, note: "Surah Yaseen — Friday recitation" },
  ];

  for (const bm of bookmarks) {
    await prisma.bookmark.upsert({
      where: {
        userId_surah_ayah: {
          userId: student.id,
          surah: bm.surah,
          ayah: bm.ayah,
        },
      },
      update: {},
      create: {
        userId: student.id,
        surah: bm.surah,
        ayah: bm.ayah,
        note: bm.note,
      },
    });
  }

  console.log("✔ Bookmarks seeded");

  // ─── Messages ─────────────────────────────────────────────────────────────
  const messages = [
    {
      senderId: teacher.id,
      receiverId: student.id,
      content:
        "Assalamu Alaykum Aisha, great progress this week! Make sure to review Madd rules before our next session.",
    },
    {
      senderId: student.id,
      receiverId: teacher.id,
      content:
        "Wa Alaykum Assalam Ustadh, JazakAllah Khayr! I will review them tonight insha'Allah.",
    },
    {
      senderId: teacher.id,
      receiverId: student.id,
      content:
        "Also, try to listen to Sheikh Al-Husary's recitation of Al-Baqarah for reference.",
    },
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }

  console.log("✔ Messages seeded");

  // ─── UstadhProfile ────────────────────────────────────────────────────────
  await prisma.ustadhProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      isApproved: true,
      bio: "Hafiz with ijazah in Hafs an Asim. 10+ years teaching Tajweed and Hifdh.",
      qualifications:
        "Ijazah in Hafs an Asim from Al-Azhar University\nCertified Quran Teacher (CQT-2018)\nBA in Islamic Studies",
    },
  });

  console.log("✔ UstadhProfile seeded");

  // ─── QuranProgress ─────────────────────────────────────────────────────────
  await prisma.quranProgress.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      lastSurah: 2,
      lastVerse: 86,
    },
  });

  console.log("✔ QuranProgress seeded");

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
        userId: student.id,
        deviceName: "Chrome on Linux",
        ipAddress: "192.168.1.100",
        lastActivity: morning,
        isActive: false,
      },
    });
    await prisma.loginSession.create({
      data: {
        userId: teacher.id,
        deviceName: "Chrome on Linux",
        ipAddress: "192.168.1.101",
        lastActivity: morning,
        isActive: false,
      },
    });

    if (daysAgo < 3) {
      await prisma.loginSession.create({
        data: {
          userId: student.id,
          deviceName: "Firefox on Linux",
          ipAddress: "192.168.1.100",
          lastActivity: evening,
          isActive: false,
        },
      });
    }
  }

  console.log("✔ LoginSessions seeded (8-day streak)");

  // ─── Assessments (for leaderboard + Strong Recitation achievement) ────────
  const assessments = [
    {
      type: AssessmentType.HIFDH_LISTENING,
      score: 85,
      feedback: "Good flow, minor pause at verse 255.",
    },
    {
      type: AssessmentType.TAJWEED_EXAM,
      score: 92,
      feedback: "Excellent Makharij",
    },
    {
      type: AssessmentType.VERBAL_TEST,
      score: 78,
      feedback: "Needs work on Madd rules",
    },
    {
      type: AssessmentType.HIFDH_LISTENING,
      score: 88,
      feedback: "Steady improvement",
    },
    {
      type: AssessmentType.HIFDH_LISTENING,
      score: 95,
      feedback: "Outstanding recitation",
    },
  ];

  for (const a of assessments) {
    await prisma.assessment.create({
      data: {
        studentId: student.id,
        type: a.type,
        score: a.score,
        feedback: a.feedback,
        assessedBy: "AI",
      },
    });
  }

  console.log("✔ Assessments seeded");

  // ─── RecitationJournal (for accuracy trend) ────────────────────────────────
  const journals = [
    { surahNumber: 1, fromVerse: 1, toVerse: 7, accuracy: 95, duration: 120 },
    { surahNumber: 2, fromVerse: 1, toVerse: 5, accuracy: 88, duration: 180 },
    { surahNumber: 2, fromVerse: 1, toVerse: 10, accuracy: 82, duration: 240 },
    { surahNumber: 2, fromVerse: 1, toVerse: 15, accuracy: 91, duration: 300 },
    { surahNumber: 78, fromVerse: 1, toVerse: 10, accuracy: 96, duration: 150 },
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

  console.log("✔ RecitationJournal seeded");

  // ─── Completed Appointments (session history) ──────────────────────────────
  const pastSessions = [
    {
      daysAgo: 6,
      title: "Tajweed Review — Noon Sakinah",
      surahNumber: 2,
      verseNumber: 1,
    },
    { daysAgo: 4, title: "Juz Amma Revision", surahNumber: 78, verseNumber: 1 },
    {
      daysAgo: 2,
      title: "Madd Rules Practice",
      surahNumber: 2,
      verseNumber: 10,
    },
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
        teacherId: teacher.id,
        title: s.title,
        startTime: start,
        endTime: end,
        status: "COMPLETED",
        startedAt: start,
        endedAt: end,
        surahNumber: s.surahNumber,
        verseNumber: s.verseNumber,
      },
    });
  }

  console.log("✔ Completed appointments seeded");

  // ─── StudentNotes (open + resolved) ────────────────────────────────────────
  // Fetch the most recent completed appointment for note linking
  const recentAppt = await prisma.appointment.findFirst({
    where: { mentorshipId: mentorship.id, status: "COMPLETED" },
    orderBy: { startTime: "desc" },
  });

  const notesData = [
    {
      priority: "HIGH",
      content:
        "Strong pronunciation of ض (Daud) — still confusing with ظ (Dha). Needs focused drill.",
      resolved: false,
    },
    {
      priority: "MEDIUM",
      content:
        "Madd Munfasil timing is inconsistent; sometimes extends 4 counts instead of 2-4.",
      resolved: false,
    },
    {
      priority: "LOW",
      content: "Remember to review the rules of Ikhfaa before next session.",
      resolved: false,
    },
    {
      priority: "MEDIUM",
      content: "Great improvement on Meem Sakinah rules this week.",
      resolved: true,
      resolvedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      priority: "LOW",
      content: "Reviewed Qalqalah — minor echo on ط could be stronger.",
      resolved: true,
      resolvedAt: new Date(now.getTime() - 2 * 86400000),
    },
  ];

  for (const n of notesData) {
    await prisma.studentNote.create({
      data: {
        studentId: student.id,
        ustadhId: teacher.id,
        content: n.content,
        priority: n.priority as "LOW" | "MEDIUM" | "HIGH",
        resolved: n.resolved,
        resolvedAt: n.resolved ? (n.resolvedAt ?? new Date()) : null,
        sessionId: recentAppt?.id ?? null,
      },
    });
  }

  console.log("✔ StudentNotes seeded");

  // ─── Complete an enrollment for Course Finisher achievement ────────────────
  const completedCourse = await prisma.course.findUnique({
    where: { slug: "fiqh-of-salah" },
  });
  if (completedCourse) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId: completedCourse.id },
      },
      update: {
        progress: 100,
        status: "COMPLETED",
        completedAt: new Date(now.getTime() - 3 * 86400000),
      },
      create: {
        userId: student.id,
        courseId: completedCourse.id,
        progress: 100,
        status: "COMPLETED",
        completedAt: new Date(now.getTime() - 3 * 86400000),
      },
    });
  }

  console.log("✔ Completed enrollment seeded");

  // ─── Backfill XP for existing students ──────────────────────────────────────
  console.log("\n🎯 Backfilling XP for existing students...");
  const xpStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      _count: {
        select: {
          enrollments: true,
          lessonProgress: { where: { completed: true } },
        },
      },
      enrollments: {
        where: { progress: 100 },
        select: { id: true },
      },
      assessments: {
        where: { score: { not: null } },
        select: { score: true },
      },
      submissions: {
        where: { totalScore: { not: null }, status: "GRADED" },
        select: { totalScore: true, examId: true },
      },
    },
  });

  const allExamIds = [...new Set(xpStudents.flatMap((s) => s.submissions.map((sub) => sub.examId)))];
  const exams = await prisma.exam.findMany({
    where: { id: { in: allExamIds } },
    select: { id: true, totalMarks: true },
  });
  const examMap = new Map(exams.map((e) => [e.id, e.totalMarks]));

  for (const student of xpStudents) {
    let xp = 1;

    xp += student._count.enrollments * 5;
    xp += student._count.lessonProgress * 5;
    xp += student.enrollments.length * 20;

    for (const a of student.assessments) {
      xp += Math.round((a.score ?? 0) / 10);
    }

    for (const s of student.submissions) {
      const totalMarks = examMap.get(s.examId) ?? 1;
      xp += Math.round(((s.totalScore ?? 0) / totalMarks) * 10);
    }

    await prisma.user.update({
      where: { id: student.id },
      data: { xp },
    });
  }
  console.log(`✔ XP backfilled for ${xpStudents.length} students`);

  console.log("\n✅ Database seeded successfully");

  // ─── Seed rich content & quizzes ─────────────────────────────────────────
  const lessonsContent: Record<
    string,
    Array<{
      title: string;
      content: string;
      videoUrl?: string;
      quiz: Array<{
        question: string;
        options: Array<{ text: string; correct: boolean }>;
      }>;
    }>
  > = (await import("./seed-content-data.js")).lessonsContent;

  console.log("\n📝 Updating lesson content with enriched materials...");

  const contentCourses = await prisma.course.findMany({
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  for (const course of contentCourses) {
    const courseContent = lessonsContent[course.slug];
    if (!courseContent) continue;

    console.log(`\n📘 Processing: ${course.title}`);

    for (const lessonDef of courseContent) {
      const lesson = course.lessons.find((l) => l.title === lessonDef.title);
      if (!lesson) {
        console.log(`  ⚠ Lesson not found: "${lessonDef.title}" — skipping`);
        continue;
      }

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          content: lessonDef.content,
          videoUrl: lessonDef.videoUrl ?? lesson.videoUrl,
        },
      });
      console.log(`  ✓ Content updated: "${lesson.title}"`);

      if (lessonDef.quiz.length > 0) {
        const totalMarks = lessonDef.quiz.length;
        const exam = await prisma.exam.upsert({
          where: { lessonId: lesson.id },
          update: {
            title: `${lesson.title} Quiz`,
            description: `Test your knowledge of "${lesson.title}"`,
            totalMarks,
            passMark: Math.ceil(totalMarks * 0.6),
            isPublished: true,
          },
          create: {
            courseId: course.id,
            lessonId: lesson.id,
            title: `${lesson.title} Quiz`,
            description: `Test your knowledge of "${lesson.title}"`,
            totalMarks,
            passMark: Math.ceil(totalMarks * 0.6),
            durationMinutes: 15,
            isPublished: true,
            shuffleQuestions: true,
            examType: "QUIZ",
          },
        });

        for (let qi = 0; qi < lessonDef.quiz.length; qi++) {
          const q = lessonDef.quiz[qi];
          const existingQ = await prisma.question.findFirst({
            where: { examId: exam.id, orderIndex: qi },
          });

          const questionData = {
            questionText: q.question,
            questionType: "MCQ" as const,
            options: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.correct,
            })),
            correctAnswer: q.options.find((o) => o.correct)?.text ?? "",
            marks: 1,
            difficulty: "UNDERSTAND" as const,
            orderIndex: qi,
          };

          if (existingQ) {
            await prisma.question.update({
              where: { id: existingQ.id },
              data: questionData,
            });
          } else {
            await prisma.question.create({
              data: { examId: exam.id, ...questionData },
            });
          }
        }
        console.log(`  ✓ Quiz created: ${lessonDef.quiz.length} questions`);
      }
    }
  }

  console.log("\n✅ Content seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
