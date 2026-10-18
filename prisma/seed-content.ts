/**
 * The Quran Hifdh course, as published to an empty catalogue.
 *
 * Lesson bodies are markdown, matching the renderer used across the portal.
 * A question's `correctAnswer` is the index of the right option, stored as a
 * string because that is how a response records the learner's choice.
 */

export interface SeedQuestion {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
}

export interface SeedLesson {
  title: string;
  duration: number;
  content: string;
  questions: SeedQuestion[];
}

export const hifdhCourse: {
  title: string;
  slug: string;
  description: string;
  lessons: SeedLesson[];
} = {
  title: "Quran Hifdh",
  slug: "hifdh-ul-quran",
  description:
    "A mentor-led Quran memorization journey covering all 30 Juz. Students are paired with a qualified Hafiz for live sessions, revision plans, and progress tracking.",
  lessons: [
    {
      title: "Program Overview & Goal Setting",
      duration: 30,
      content: `## Welcome to Quran Hifdh

This program is designed to help you **memorize the Quran** systematically with the guidance of a qualified teacher. Whether you are starting from scratch or continuing your journey, this structured approach will help you build consistency and achieve your goals.

> The Prophet ﷺ said: **"The best among you are those who learn the Quran and teach it"** (Bukhari). You are now embarking on one of the most rewarding journeys a Muslim can undertake.

## How the Program Works

1. **Weekly live sessions** — one-on-one with your teacher via video call
2. **Daily memorization targets** — set realistic goals (3-5 ayahs per day for beginners)
3. **Revision cycles** — structured daily, weekly, and monthly review
4. **Progress tracking** — your teacher monitors accuracy, tajweed, and fluency
5. **Assessment milestones** — each Juz completed is formally assessed and signed off

## Setting Your First Goal

Use the SMART framework:

- **S**pecific — "I will memorize Surah Al-Mulk this month"
- **M**easurable — "3 ayahs per day, 6 days per week"
- **A**chievable — based on your current schedule
- **R**elevant — aligns with your Quran journey
- **T**ime-bound — review and adjust weekly with your teacher

## Daily Routine Recommendation

- **Before Fajr:** Review yesterday's memorization (15 min)
- **Morning:** New memorization session (30 min)
- **After Asr:** Weekly revision review (15 min)
- **Before sleep:** Listening to the target portion (10 min)`,
      questions: [
        {
          questionText: "What is the recommended new memorization time per day?",
          options: [
            { text: "30 minutes" },
            { text: "15 minutes" },
            { text: "60 minutes" },
            { text: "10 minutes" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "How many ayahs per day are recommended for beginners?",
          options: [
            { text: "3-5 ayahs" },
            { text: "10-15 ayahs" },
            { text: "1-2 ayahs" },
            { text: "A full page" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "When is the best time to review yesterday's memorization?",
          options: [
            { text: "Before Fajr" },
            { text: "After Isha" },
            { text: "During lunch break" },
            { text: "Right before bed" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Memorization Methodology",
      duration: 25,
      content: `## Proven Memorization Techniques

Memorizing the Quran is a skill that can be learned and improved with the right techniques. Here are the most effective methods used by Huffaz worldwide.

## 1. The Repetition Cycle

1. **Listen** — listen to the target ayahs 5-10 times from a qualified reciter
2. **Read** — follow along visually in the Mushaf while listening
3. **Repeat** — repeat each phrase 10-20 times until fluent
4. **Connect** — add the previous ayah and repeat the pair 5 times
5. **Consolidate** — recite the entire page/section 5 times without looking

## 2. Chunking

Break longer ayahs into smaller chunks at natural pause points. Memorize each chunk individually, then connect them.

## 3. The "Three-Column" Method

- **Column 1:** New memorization (today's target)
- **Column 2:** Yesterday's review (reinforce before new)
- **Column 3:** Weekly revision (previously memorized portions)

## 4. Audio Reinforcement

Listen to the portion you are memorizing during commutes, at bedtime (the brain consolidates memory during sleep), and in prayer.

> The Prophet ﷺ said: **"The one who is proficient in the Quran will be with the noble, righteous scribes, and the one who recites the Quran and stumbles over it, finding it difficult, will have a double reward"** (Bukhari & Muslim).`,
      questions: [
        {
          questionText: "How many times should you listen to target ayahs in the repetition cycle?",
          options: [
            { text: "5-10 times" },
            { text: "1-2 times" },
            { text: "20-30 times" },
            { text: "Until you get bored" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the benefit of listening to memorization at bedtime?",
          options: [
            { text: "The brain consolidates memory during sleep" },
            { text: "It helps you fall asleep faster" },
            { text: "It replaces the need for daytime study" },
            { text: "It improves dream recall" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is chunking in the context of Hifdh?",
          options: [
            { text: "Breaking longer ayahs into smaller chunks at natural pause points" },
            { text: "Memorizing multiple surahs at once" },
            { text: "Grouping similar ayahs together" },
            { text: "Writing ayahs on small cards" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Juz Amma — Surahs 78–93",
      duration: 60,
      content: `## Juz Amma: Surahs 78–93

Juz Amma (the 30th and final Juz of the Quran) contains 37 surahs, mostly short and powerful. We begin with the first half: Surahs 78 through 93.

## Memorization Plan

- Surah — Verses — Days — Key Theme
- 78 — An-Naba — 40 — 8 — The Great News (Resurrection)
- 79 — An-Naziat — 46 — 9 — The Angels Who Extract
- 80 — Abasa — 42 — 8 — He Frowned
- 81 — At-Takwir — 29 — 6 — The Folding Up
- 82 — Al-Infitar — 19 — 4 — The Cleaving
- 83 — Al-Mutaffifin — 36 — 7 — The Defrauders
- 84 — Al-Inshiqaq — 25 — 5 — The Sundering
- 85 — Al-Buruj — 22 — 5 — The Mansions of the Stars
- 86 — At-Tariq — 17 — 3 — The Nightcomer
- 87 — Al-Ala — 19 — 4 — The Most High
- 88 — Al-Ghashiyah — 26 — 5 — The Overwhelming
- 89 — Al-Fajr — 30 — 6 — The Dawn
- 90 — Al-Balad — 20 — 4 — The City
- 91 — Ash-Shams — 15 — 3 — The Sun
- 92 — Al-Layl — 21 — 4 — The Night
- 93 — Ad-Duhaa — 11 — 2 — The Morning Hours

## Tips for Memorizing Short Surahs

- Use the **musical rhythm** — each surah has a unique flow
- Focus on **similar ayahs** — many have repeating patterns
- Learn the **meaning** — understanding anchors the verses in memory
- Recite in **Fajr prayer** — confirm overnight memorization`,
      questions: [
        {
          questionText: "How many surahs are in Juz Amma?",
          options: [
            { text: "37" },
            { text: "27" },
            { text: "47" },
            { text: "20" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the theme of Surah An-Naba (78)?",
          options: [
            { text: "The Great News (Resurrection)" },
            { text: "The Night Journey" },
            { text: "The Creation of Man" },
            { text: "The Stories of the Prophets" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "How many days are recommended to memorize Surah Ad-Duhaa (93)?",
          options: [
            { text: "2 days" },
            { text: "5 days" },
            { text: "1 day" },
            { text: "7 days" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Juz Amma — Surahs 94–114",
      duration: 60,
      content: `## Juz Amma: Surahs 94–114

Continuing through Juz Amma, these shorter surahs are among the most frequently recited in daily prayers. Master them well — they will accompany you throughout your life.

## Memorization Plan

- Surah — Verses — Days — Key Theme
- 94 — Ash-Sharh — 8 — 1 — Comfort after hardship
- 95 — At-Tin — 8 — 1 — The Fig — creation and judgment
- 96 — Al-Alaq — 19 — 4 — The Clot — first revelation
- 97 — Al-Qadr — 5 — 1 — The Night of Power
- 98 — Al-Bayyinah — 8 — 2 — The Clear Evidence
- 99 — Az-Zalzalah — 8 — 2 — The Earthquake
- 100 — Al-Adiyat — 11 — 2 — The War Horses
- 101 — Al-Qariah — 11 — 2 — The Striking Calamity
- 102 — At-Takathur — 8 — 1 — The Competition for More
- 103 — Al-Asr — 3 — 1 — The Time — loss except for faith
- 104 — Al-Humazah — 9 — 2 — The Slanderer
- 105 — Al-Fil — 5 — 1 — The Elephant — Abraha's army
- 106 — Quraysh — 4 — 1 — The Tribe of Quraysh
- 107 — Al-Maun — 7 — 1 — Small kindnesses
- 108 — Al-Kawthar — 3 — 1 — Abundance
- 109 — Al-Kafirun — 6 — 1 — Freedom of religion
- 110 — An-Nasr — 3 — 1 — Divine help and victory
- 111 — Al-Masad — 5 — 1 — Abu Lahab
- 112 — Al-Ikhlas — 4 — 1 — Pure monotheism
- 113 — Al-Falaq — 5 — 1 — The Daybreak — seeking refuge
- 114 — An-Nas — 6 — 1 — Mankind — seeking refuge

> **Motivation:** Many of these surahs are recited in every prayer. Imagine the reward — every time you recite them in Salah for the rest of your life, each letter is multiplied 10 times in reward!`,
      questions: [
        {
          questionText: "How many verses does Surah Al-Ikhlas (112) contain?",
          options: [
            { text: "4" },
            { text: "3" },
            { text: "5" },
            { text: "6" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Which surah was the first revelation received by the Prophet?",
          options: [
            { text: "Surah Al-Alaq (96)" },
            { text: "Surah Al-Fatihah (1)" },
            { text: "Surah Al-Qadr (97)" },
            { text: "Surah Al-Muddaththir (74)" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the theme of Surah At-Takathur (102)?",
          options: [
            { text: "The Competition for More" },
            { text: "The Day of Judgment" },
            { text: "The Story of Prophet Musa" },
            { text: "The Creation of the Heavens" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Revision Strategy",
      duration: 20,
      content: `## The Key to Retention: Consistent Revision

Memorization without revision is like filling a leaky bucket. The most common reason students lose their Hifdh is the **lack of a structured revision system**.

## The 3-Tier Revision System

### Tier 1: Daily Revision (10-15 minutes)

- Review the **most recent 7 days** of memorization
- Recite each portion once from memory
- Mark any ayahs that need attention

### Tier 2: Weekly Revision (30 minutes)

- Review **all memorization from the current month**
- Recite to a partner or teacher if possible
- Focus on weak spots identified in daily revision

### Tier 3: Monthly/Comprehensive Revision (1-2 hours)

- Review **all previously memorized Juz**
- For those with 5+ Juz: review one Juz per day in a rotating cycle
- Use the **"One Juz per Day"** method for those who completed the full Quran

## Common Revision Mistakes

- **Only looking forward** — always pushing to new material without solidifying old material
- **Skipping the "hard pages"** — the ayahs you dislike reviewing are the ones you need most
- **Not reciting to someone** — self-reciting hides subtle mistakes
- **Inconsistent schedule** — 10 minutes daily beats 2 hours weekly`,
      questions: [
        {
          questionText: "How many tiers are in the revision system?",
          options: [
            { text: "3" },
            { text: "2" },
            { text: "4" },
            { text: "5" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is reviewed in Tier 1 (Daily Revision)?",
          options: [
            { text: "The most recent 7 days of memorization" },
            { text: "All memorization from the current month" },
            { text: "All previously memorized Juz" },
            { text: "Only the newest ayahs from today" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "How long should daily revision take?",
          options: [
            { text: "10-15 minutes" },
            { text: "30-45 minutes" },
            { text: "5 minutes" },
            { text: "1 hour" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Juz 29 — Selected Surahs",
      duration: 90,
      content: `## Juz 29: Tabarak

Juz 29 (also known as Tabarak, named after its first surah Al-Mulk) contains 11 surahs, many regularly recited in Salah, especially at night (Qiyam) and in Maghrib and Isha prayers.

## Focus Surahs

### 1. Surah Al-Mulk (67) — 30 verses

**The Sovereignty.** A powerful protector — it intercedes for its reciter and protects from the punishment of the grave. Memorize **3 verses per day** over 10 days.

### 2. Surah Al-Qalam (68) — 52 verses

**The Pen.** The second surah revealed in Makkah, focusing on the character of the Prophet ﷺ and the contrast between truth and falsehood.

### 3. Surah Al-Haaqqah (69) — 52 verses

**The Inevitable Reality.** Vivid descriptions of the Day of Judgment and the fate of past nations.

### 4. Surah Al-Ma'arij (70) — 44 verses

**The Ascending Stairways.** Discusses the angels' ascent and the qualities of those who will be saved.

> **Tip:** Surahs in Juz 29 are longer than Juz Amma. Increase your daily time allocation to 45-60 minutes for this Juz.`,
      questions: [
        {
          questionText: "Why is Juz 29 called \"Tabarak\"?",
          options: [
            { text: "It begins with Surah Al-Mulk, whose first word is Tabarak" },
            { text: "It is the most blessed Juz" },
            { text: "The Prophet named it Tabarak" },
            { text: "It contains 29 blessings" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is Surah Al-Mulk (67) known to protect from?",
          options: [
            { text: "The punishment of the grave" },
            { text: "Evil eye" },
            { text: "Poverty" },
            { text: "Illness" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "How many surahs are in Juz 29?",
          options: [
            { text: "11" },
            { text: "37" },
            { text: "7" },
            { text: "15" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Live Session: Recitation to Teacher",
      duration: 45,
      content: `## Preparing for Your Live Session

Your weekly one-on-one session with the teacher is the **most important component** of the Hifdh program. This is where mistakes are caught, Tajweed is refined, and memorization is solidified.

## Before the Session

- **Prepare your portion** — review what you will recite 3-5 times
- **Mark difficult spots** — note ayahs where you frequently stumble
- **Test yourself** — recite without looking, then check the Mushaf
- **Be on time** — join the session 2-3 minutes early
- **Prepare questions** — ask about Tajweed rules or similar ayahs

## During the Session

- **Recite clearly** — even with mistakes, the teacher needs to hear your actual recitation
- **Don't rush** — take your time, apply Tajweed rules consciously
- **Accept correction gracefully** — each correction is a step toward mastery
- **Repeat after correction** — recite the corrected portion 2-3 times
- **Record the session** (with permission) for later review

## After the Session

- **Review corrections** — practice corrected portions before your next session
- **Update your revision list** — move corrected ayahs to your "mastered" list
- **Note teacher feedback** — keep a running log of Tajweed points`,
      questions: [
        {
          questionText: "How many times should you review your portion before the live session?",
          options: [
            { text: "3-5 times" },
            { text: "1 time" },
            { text: "10 times" },
            { text: "As many times as possible" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What should you do after being corrected by the teacher?",
          options: [
            { text: "Repeat the corrected portion 2-3 times" },
            { text: "Move on to the next ayah" },
            { text: "Apologize and continue" },
            { text: "Note the correction for later" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "How early should you join the session?",
          options: [
            { text: "2-3 minutes early" },
            { text: "10 minutes early" },
            { text: "Exactly on time" },
            { text: "5 minutes early" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Common Mistakes in Hifdh",
      duration: 20,
      content: `## Frequently Confused Ayahs

The Quran contains many parallel passages, especially in stories repeated across different surahs. This lesson covers the most common confusions and strategies to overcome them.

## Types of Similar Ayahs

### 1. Repeated Stories (Full Parallels)

The story of **Musa (AS) and Pharaoh**, **Adam and Iblis**, and descriptions of **Paradise and Hell** appear in multiple surahs with slight variations.

**Strategy:** Create a chart showing details unique to each occurrence. Focus on the opening words — they are usually the key difference.

### 2. Identical Beginnings, Different Endings

Example: **"وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ"** appears 10 times in Surah Al-Mursalat (77), each followed by a different consequence.

**Strategy:** Memorize the **connecting word** after the repeated phrase. Create a mental "chain" of what comes next.

### 3. One-letter Differences

Some ayahs differ by just one letter. Physically underline the different letter in your Mushaf. Recite the pair side by side 5 times each.

## Top 5 Most Confused Ayahs

1. **"وَالسَّمَاءَ بَنَيْنَاهَا"** (51:47) vs **"وَبَنَيْنَا فَوْقَكُمْ سَبْعًا شِدَادًا"** (78:12)
2. **"إِنَّ الْأَبْرَارَ"** openings in 76:5, 83:18, 83:22 — different continuations
3. **"يَوْمَ يُنفَخُ فِي الصُّورِ"** in 10+ surahs — all with different continuations
4. **"الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَى"** in 6 surahs — each in a different context

> **Golden Rule:** When you encounter a familiar-sounding ayah, **pause** and consciously identify which surah you are in. The context is your strongest memory anchor.`,
      questions: [
        {
          questionText: "How many times does \"وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ\" appear in Surah Al-Mursalat?",
          options: [
            { text: "10 times" },
            { text: "5 times" },
            { text: "7 times" },
            { text: "3 times" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the best strategy for identical beginnings with different endings?",
          options: [
            { text: "Memorize the connecting word after the repeated phrase" },
            { text: "Skip those ayahs" },
            { text: "Memorize them last" },
            { text: "Only memorize one version" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the Golden Rule for handling similar ayahs?",
          options: [
            { text: "Pause and consciously identify which surah you are in" },
            { text: "Skip the ayah if it sounds familiar" },
            { text: "Always recite from the Mushaf" },
            { text: "Ask the teacher every time" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Dua & Spiritual Preparation",
      duration: 15,
      content: `## The Spiritual Dimension of Hifdh

Memorizing the Quran is not merely an intellectual exercise — it is a **spiritual journey** that requires sincerity, humility, and reliance on Allah.

> Allah says: **"And We have certainly made the Quran easy to remember, but is there any who will take heed?"** (Surah Al-Qamar 54:17). The key is in **sincerity** and **seeking Allah's help**.

## Recommended Duas for Memorization

### Before Memorizing

**"اللهم ارزقني حفظ كتابك واتباع سنّة نبيك عليه الصلاة والسلام"**

### When Facing Difficulty

**"رب زدني علما"** (Surah Ta-Ha 20:114) — My Lord, increase me in knowledge.

### After Memorizing

**"اللهم اجعل القرآن ربيع قلبي ونور صدري وجلاء حزني وذهاب همي"**

## Spiritual Etiquette (Aadaab) of a Hafiz

- **Guard your eyes and tongue** — sins weaken the memory
- **Act upon what you memorize** — the Quran becomes part of you through practice
- **Maintain Wudu** — recite in a state of purity whenever possible
- **Face the Qiblah** — even when memorizing, face the direction of prayer
- **Weep when appropriate** — the Quran was revealed to move hearts
- **Be humble** — knowledge of the Quran is a gift, not an achievement to boast about
- **Teach others** — teaching reinforces memorization and earns ongoing reward`,
      questions: [
        {
          questionText: "Which verse should you recite when facing difficulty in memorization?",
          options: [
            { text: "\"Rabbi zidni ilma\" (My Lord, increase me in knowledge)" },
            { text: "\"Bismillahir Rahmanir Rahim\"" },
            { text: "\"Alhamdulillahi Rabbil Alamin\"" },
            { text: "\"Inna lillahi wa inna ilayhi rajiun\"" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What happens to memory when one commits sins according to the lesson?",
          options: [
            { text: "Sins weaken the memory" },
            { text: "Sins have no effect" },
            { text: "Sins strengthen the memory" },
            { text: "Only major sins affect memory" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is one benefit of teaching others what you have memorized?",
          options: [
            { text: "It reinforces memorization and earns ongoing reward" },
            { text: "It makes you famous" },
            { text: "It is faster than memorizing alone" },
            { text: "It replaces the need for revision" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Progress Assessment — Juz Amma",
      duration: 60,
      content: `## Final Assessment: Juz Amma

This session is your **formal assessment** for Juz Amma. You will recite the entire Juz from memory to your teacher for sign-off. This is a significant milestone — celebrate it!

## Assessment Checklist

Before your assessment, ensure you can:

- Recite all 37 surahs of Juz Amma **in order** from memory
- Recite any surah **individually** when asked (random selection)
- Recite with **correct Tajweed** — Makharij, Sifaat, Noon/Meem Sakinah, Madd, Qalqalah
- Recite at a **moderate pace** (Tadweer) without rushing
- Identify and correct your own mistakes

## What to Expect

1. The teacher may ask you to start from a **random surah**
2. You may be stopped and asked to **continue from a different point**
3. The teacher will note **mistakes in Tajweed** and **accuracy of memorization**
4. After recitation, the teacher provides **feedback** and areas for improvement
5. Upon passing, the teacher will **sign off** on Juz Amma

> **Mabrook on reaching this milestone!** Completing Juz Amma is a tremendous achievement. Remember that the real journey begins now — maintaining what you have memorized through daily revision and continuing to the next Juz.`,
      questions: [
        {
          questionText: "How many surahs must you recite from memory in the Juz Amma assessment?",
          options: [
            { text: "All 37 surahs in order" },
            { text: "Any 10 surahs" },
            { text: "The 5 longest surahs" },
            { text: "Only Surah Al-Fatihah and the last 10" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What pace should you recite at during the assessment?",
          options: [
            { text: "Moderate pace (Tadweer)" },
            { text: "As fast as possible" },
            { text: "Very slow with stops after every word" },
            { text: "In a singing tone" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What does passing the assessment mean for your teacher?",
          options: [
            { text: "They sign off on Juz Amma" },
            { text: "You can stop memorizing" },
            { text: "You get a certificate immediately" },
            { text: "You move to a new teacher" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Juz 28 — Selected Surahs",
      duration: 35,
      content: `## Continuing the Journey

Having completed Juz Amma (Juz 30) and reviewed Juz 29, this stage of the program moves to **Juz 28**, covering Surah Al-Mujadila through the early portion of Surah At-Tahrim. These surahs are longer and address detailed social and legal guidance, making memorization slightly more demanding than the short surahs of Juz Amma.

## Approach for Longer Surahs

- Break each surah into small sections of **3–5 verses** rather than trying to memorize a full page at once
- Memorize a new section only after the previous one is **solid without looking**
- Link each new section to the one before it during your daily revision, not just to what you memorized that day

## Key Surahs in This Stage

- **Al-Mujadila** — guidance on family and social disputes
- **Al-Hashr** — lessons from historical events and the beautiful Names of Allah at its end
- **Al-Mumtahanah** — principles of loyalty and relations with non-Muslims
- **As-Saff, Al-Jumu'ah, Al-Munafiqun** — shorter surahs, useful for building momentum before tackling longer ones

> Progress may feel slower in this Juz compared to Juz Amma — this is normal. Longer verses require more repetition per line, not less commitment on your part.`,
      questions: [
        {
          questionText: "Which Juz does this stage of the program move to?",
          options: [
            { text: "Juz 28" },
            { text: "Juz 1" },
            { text: "Juz 15" },
            { text: "Juz 30" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the recommended section size when memorizing longer surahs?",
          options: [
            { text: "3–5 verses at a time" },
            { text: "A full page at once" },
            { text: "One word at a time" },
            { text: "An entire surah in one sitting" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Surah Al-Hashr is notable for containing:",
          options: [
            { text: "Beautiful Names of Allah at its end" },
            { text: "The longest verse in the Quran" },
            { text: "Rules of inheritance" },
            { text: "The story of Prophet Yusuf" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Why might progress feel slower in Juz 28 compared to Juz Amma?",
          options: [
            { text: "The verses are longer and require more repetition" },
            { text: "The student has lost motivation" },
            { text: "Juz 28 is not part of the Quran" },
            { text: "The teacher assigns less time" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Consolidation & Linking Surahs",
      duration: 25,
      content: `## The Skill of Linking (Rabt)

As you memorize more surahs, a critical skill becomes just as important as memorizing new material: **Rabt**, or linking — the ability to move smoothly from the end of one surah into the beginning of the next without hesitation.

## Why Linking Matters

- In a Hifdh assessment or recitation to a teacher, you are often asked to continue past the end of a surah into the next one
- Weak linking is one of the most common points where memorizers hesitate or make mistakes, even when each surah individually is well memorized

## How to Practice Linking

1. Recite the **last verse** of one surah, then immediately the **first verse** of the next, several times in a row
2. Gradually expand: last 2–3 verses of one surah into the first 2–3 verses of the next
3. During your daily revision cycle, always recite surahs **in sequence** rather than in isolation

## Consolidation Days

Set aside time — for example, one day a week — purely for consolidation: reciting everything memorized so far in order, without new memorization, just to strengthen the connections between surahs.

> A memorizer who can recite each surah perfectly in isolation, but freezes when moving between surahs, has not yet finished memorizing — only half of the task is complete.`,
      questions: [
        {
          questionText: "What does \"Rabt\" refer to?",
          options: [
            { text: "Linking the end of one surah to the beginning of the next" },
            { text: "Reciting quickly" },
            { text: "A type of Tajweed rule" },
            { text: "Writing the Quran from memory" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Why is linking between surahs important for assessments?",
          options: [
            { text: "Teachers often ask students to continue into the next surah" },
            { text: "It replaces the need for Tajweed" },
            { text: "It is only relevant for Juz Amma" },
            { text: "It is not actually tested" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is a \"consolidation day\" used for?",
          options: [
            { text: "Reviewing everything memorized so far in sequence, without new material" },
            { text: "Learning an entirely new Juz in one day" },
            { text: "Taking a break from the Quran entirely" },
            { text: "Testing Tajweed knowledge only" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "A common weak point for memorizers, even when each surah is well memorized individually, is:",
          options: [
            { text: "The transition between surahs" },
            { text: "The first verse of Al-Fatihah" },
            { text: "Reciting out loud" },
            { text: "Understanding Arabic grammar" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Dealing with Forgetting (Nisyan)",
      duration: 25,
      content: `## Forgetting is Natural, But Manageable

Every memorizer experiences **Nisyan** (forgetting) — it is a natural part of the human mind, not a sign of failure. The Prophet ﷺ taught practical ways to minimize and cope with it.

> The Prophet ﷺ said: **"The example of the one who memorizes the Quran is like the owner of a tied camel. If he keeps hold of it, he keeps it, but if he releases it, it goes away."** (Al-Bukhari)

## Common Causes of Forgetting

- **Lack of consistent revision** — the single biggest cause
- **Sins and heedlessness** — many scholars linked weak memory to distancing oneself from disobedience
- **Reciting too fast during memorization**, without truly securing each verse
- **Mental and physical exhaustion** — poor sleep and stress weaken retention

## Practical Strategies

1. Follow a **consistent daily revision schedule**, even if brief — consistency beats long, irregular sessions
2. Use **spaced repetition**: revise yesterday's portion, last week's portion, and last month's portion regularly, not only the newest material
3. Recite what you have memorized in your daily prayers
4. Teach a portion you have memorized to someone else — teaching reinforces retention

## A Word of Encouragement

Forgetting a verse and reviewing it again is not wasted effort — it is part of the natural strengthening process. What matters is returning to revision consistently, not achieving perfection without ever forgetting.`,
      questions: [
        {
          questionText: "What does the hadith of the \"tied camel\" illustrate?",
          options: [
            { text: "That the Quran can be lost from memory without consistent revision" },
            { text: "That memorizing the Quran is impossible without a teacher" },
            { text: "That camels are mentioned frequently in the Quran" },
            { text: "That memorization should happen quickly" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is considered the single biggest cause of forgetting memorized Quran?",
          options: [
            { text: "Lack of consistent revision" },
            { text: "Reciting too slowly" },
            { text: "Praying too often" },
            { text: "Reading translations" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Which strategy is recommended to strengthen retention through spaced repetition?",
          options: [
            { text: "Revising yesterday's, last week's, and last month's portions regularly" },
            { text: "Only revising the newest material" },
            { text: "Memorizing an entire Juz in one sitting" },
            { text: "Avoiding revision until the whole Quran is memorized" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "According to the lesson, teaching a memorized portion to someone else:",
          options: [
            { text: "Reinforces your own retention" },
            { text: "Has no effect on memory" },
            { text: "Weakens memorization" },
            { text: "Is discouraged in Hifdh programs" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Tahsin — Perfecting Recitation While Memorizing",
      duration: 30,
      content: `## Why Tahsin Matters During Hifdh

**Tahsin** means improving and correcting one's recitation. A common mistake among memorizers is treating Tajweed correction as a separate, later stage — "memorize first, fix pronunciation later." In practice, this allows incorrect pronunciation to become **memorized alongside the words themselves**, making it far harder to correct afterward.

## The Problem with "Silent Memorization"

Memorizing by only reading silently, or listening without actively reciting aloud to a teacher, can embed unnoticed Tajweed mistakes deep into memory — mistakes that later feel just as natural and correct as the accurate pronunciation, because they were repeated just as many times.

## Best Practices

- **Recite every new portion aloud** to a qualified teacher before repeating it many times on your own
- Have the teacher correct **Makharij, Sifaat, and rule application** from the very first repetition, not after memorization is complete
- If self-studying temporarily, cross-check new portions against a trusted audio recitation from a certified Qari
- Periodically have already-memorized portions re-checked by a teacher, since old undetected errors can persist for years

> A well-known principle among Hifdh teachers: **"What is memorized incorrectly is memorized twice as hard to fix."** Prevention through correction from the start is far more efficient than fixing ingrained habits later.

## Balancing Speed and Accuracy

It is tempting to prioritize memorizing more pages quickly, especially in group programs with pace targets. However, a slower pace with correct Tajweed from the start is always more valuable than fast memorization that must later be entirely re-corrected.`,
      questions: [
        {
          questionText: "What is the risk of \"memorize first, fix pronunciation later\"?",
          options: [
            { text: "Tajweed mistakes become embedded in memory alongside the words" },
            { text: "It has no risk and is the recommended method" },
            { text: "It makes memorization faster with no downside" },
            { text: "It is only a risk for beginners" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What does Tahsin mean?",
          options: [
            { text: "Improving and correcting recitation" },
            { text: "Memorizing quickly" },
            { text: "A type of Madd" },
            { text: "Reciting from a written copy only" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "According to the lesson, when should Tajweed correction ideally happen?",
          options: [
            { text: "From the very first repetition of a new portion" },
            { text: "Only after the entire Quran is memorized" },
            { text: "Only during formal exams" },
            { text: "It is not necessary if the words are correct" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is the recommended trade-off between speed and accuracy?",
          options: [
            { text: "A slower pace with correct Tajweed is more valuable than fast, incorrect memorization" },
            { text: "Speed should always be prioritized over accuracy" },
            { text: "Accuracy only matters for advanced students" },
            { text: "Neither speed nor accuracy matters once memorized" },
          ],
          correctAnswer: "0",
        },
      ],
    },
    {
      title: "Preparing for Ijazah — What Comes Next",
      duration: 30,
      content: `## What is an Ijazah?

An **Ijazah** is a formal certification granted by a qualified teacher, confirming that a student has recited the Quran (in full or in part) accurately, with correct Tajweed, and is authorized to pass that same certification on to others — preserving an **unbroken chain (Sanad)** of transmission that traces back to the Prophet ﷺ himself.

## Typical Requirements

- **Accurate memorization** of the portion being certified — ranging from a single Juz to the complete Quran, depending on the program
- **Correct application of Tajweed rules** throughout, not just accurate wording
- **Consistent recitation** across multiple sessions with the certifying teacher, not a single successful attempt
- Sometimes, familiarity with the **rules of Tajweed theory** in addition to practical application

## The Chain of Transmission (Sanad)

Every teacher qualified to give Ijazah has themselves received it from their own teacher, in a chain extending back through generations of scholars to the Companions and ultimately to the Prophet ﷺ. This is one of the most remarkable features of Quranic preservation — a living, verified chain of oral transmission alongside the written text.

> Receiving an Ijazah is not the end of the journey — it is a milestone that confirms a strong foundation, while daily revision and continuous learning remain lifelong responsibilities.

## What Comes After Hifdh

- **Continuous revision cycles (Khatm)** — regularly reciting through the entire memorized portion to maintain it
- **Teaching others** — one of the most effective ways to retain and deepen your own memorization
- **Deepening Tajweed knowledge** — moving from application to studying the theoretical texts in depth
- **Studying Tafsir** — understanding the meanings of what has been memorized`,
      questions: [
        {
          questionText: "What does an Ijazah certify?",
          options: [
            { text: "That a student has recited accurately with correct Tajweed and may pass on the certification" },
            { text: "That a student has read a translation of the Quran" },
            { text: "That a student has attended a certain number of classes" },
            { text: "That a student has passed a written exam only" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is a Sanad?",
          options: [
            { text: "An unbroken chain of transmission back to the Prophet ﷺ" },
            { text: "A written certificate with no verification" },
            { text: "A type of Quran recitation style" },
            { text: "A stopping sign in the Quran" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "Which of these is typically required for Ijazah?",
          options: [
            { text: "Consistent accurate recitation across multiple sessions with a teacher" },
            { text: "A single successful attempt at reciting" },
            { text: "Only written knowledge of Tajweed rules" },
            { text: "Completing a multiple-choice test only" },
          ],
          correctAnswer: "0",
        },
        {
          questionText: "What is recommended after completing a Hifdh program?",
          options: [
            { text: "Continuous revision cycles and teaching others" },
            { text: "Stopping regular recitation since memorization is complete" },
            { text: "Moving on to a different holy text" },
            { text: "No further study is needed" },
          ],
          correctAnswer: "0",
        },
      ],
    },
  ],
};
