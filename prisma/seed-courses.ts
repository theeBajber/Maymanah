/**
 * The wider course catalogue, published alongside the Hifdh programme.
 *
 * Lesson bodies are markdown, matching the renderer used across the portal.
 * A question's `correctAnswer` is the index of the right option, stored as a
 * string because that is how a response records the learner's choice.
 */

import type { SeedLesson } from "./seed-content";

export interface SeedCourse {
  title: string;
  slug: string;
  description: string;
  image: string;
  category: "Quran" | "Fiqh" | "History" | "Arabic" | "Aqeedah";
  lessons: SeedLesson[];
}

export const catalogueCourses: SeedCourse[] = [
  {
    title: "Seerah — Life of the Prophet ﷺ",
    slug: "seerah-life-of-the-prophet",
    description: "A chronological journey through the life of Prophet Muhammad ﷺ from birth to the farewell sermon, weaving historical context with lessons for modern life.",
    image: "/seerah.jpg",
    category: "History",
    lessons: [
      {
        title: "Arabia Before Islam",
        duration: 25,
        content: `## The Arabian Peninsula Before Islam

To understand the impact of the Prophet ﷺ, we must first understand the world into which he was born.

### Political Landscape

Arabia was not a unified nation. It consisted of:

- **Independent tribes** with their own chiefs and customs
- **Two major powers** nearby: The Byzantine Empire (Christian) and the Sassanid Persian Empire (Zoroastrian)
- **Yemen** — under Persian influence, agriculture-based civilization
- **Hejaz** (where Makkah and Madinah are) — tribal, trade-based economy

### Religious Landscape

- **Idol worship** — dominant practice. The Ka'bah housed 360 idols
- **Hanif** — a few individuals who rejected idolatry and followed the pure monotheism of Ibrahim (Abraham)
- **Jewish communities** in Yathrib (Madinah), Khaybar, and Yemen
- **Christians** in Najran and some northern tribes
- **Zoroastrians** in areas under Persian influence

### Social Conditions

- Tribal loyalty was paramount — "My tribe, right or wrong"
- Blood feuds and tribal wars were common (e.g., the war of Basus lasted 40 years)
- Women had very limited rights — female infanticide was practiced
- Slavery was widespread
- Alcohol, gambling, and exploitative trade practices were rampant
- Poetry and oratory were the highest art forms — annual fairs at Ukaz

### The Economic System

Makkah was a major trade hub, with caravans traveling to Syria (summer) and Yemen (winter), as mentioned in Surah Quraysh. Wealth was concentrated in the hands of a few powerful tribes, especially the Quraysh.

### Why Was Revelation Needed?

Humanity had reached a state where divine guidance was urgently needed. The existing scriptures had been altered, and the original message of monotheism was lost among most people. The world was ready for the final revelation.`,
        questions: [
          {
            questionText: "How many idols were housed in the Ka'bah before Islam?",
            options: [
              { text: "360" },
              { text: "100" },
              { text: "500" },
              { text: "200" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What were the two major empires bordering Arabia?",
            options: [
              { text: "Byzantine and Persian" },
              { text: "Roman and Egyptian" },
              { text: "Ottoman and Mongol" },
              { text: "Greek and Indian" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What was the dominant religion in Arabia before Islam?",
            options: [
              { text: "Idol worship" },
              { text: "Christianity" },
              { text: "Judaism" },
              { text: "Zoroastrianism" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Who were the Hanif?",
            options: [
              { text: "Individuals who rejected idolatry and followed pure monotheism" },
              { text: "Jewish tribes in Madinah" },
              { text: "Christian monks" },
              { text: "Idol worshippers" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Birth & Early Life",
        duration: 30,
        videoUrl: "https://www.youtube.com/embed/FEaqNoFNTdA",
        content: `## The Birth and Early Life of Prophet Muhammad ﷺ

### The Year of the Elephant (عام الفيل)

The Prophet ﷺ was born in the **Year of the Elephant** (approximately 570 CE), named after the event when Abraha al-Ashram, the Christian ruler of Yemen, marched toward Makkah with an army that included elephants, intending to destroy the Ka'bah. Allah protected His House by sending flocks of birds that pelted the army with stones of baked clay (Surah Al-Fil).

### Birth

Prophet Muhammad ﷺ was born on Monday, the 12th of Rabi' al-Awwal, in Makkah. His father, **Abdullah ibn Abd al-Muttalib**, had died before his birth. His mother was **Aminah bint Wahb**.

### Early Childhood

- As was the custom, he was sent to a wet nurse, **Halimah as-Sa'diyah**, from the tribe of Banu Sa'd, to grow up in the desert — healthy environment, pure Arabic
- At age 6, his mother Aminah died, leaving him orphaned
- He was then cared for by his grandfather, **Abd al-Muttalib**, who loved him dearly
- At age 8, his grandfather also passed away
- He then came under the care of his uncle, **Abu Talib**, who protected him throughout his life

### Youth and Early Adulthood

- As a young man, he worked as a shepherd, then as a trader
- He became known as **Al-Amin** (the Trustworthy) and **As-Sadiq** (the Truthful) among his people
- He never participated in idol worship or immoral practices common among the youth
- At age 25, he married **Khadijah bint Khuwaylid**, a wealthy businesswoman who proposed to him after witnessing his character

### The Rebuilding of the Ka'bah

When the Prophet ﷺ was 35, the Quraysh rebuilt the Ka'bah after a flood damaged it. A dispute arose over who would place the Black Stone (Hajar al-Aswad). They agreed to let the first person to enter the gate be the arbitrator — it was Muhammad ﷺ. He placed the stone on a cloth and asked each tribal chief to hold a corner, then he himself placed it in position, avoiding bloodshed.`,
        questions: [
          {
            questionText: "Who cared for the Prophet ﷺ after the death of his grandfather?",
            options: [
              { text: "His uncle Abu Talib" },
              { text: "His uncle Hamzah" },
              { text: "His cousin Ali" },
              { text: "His wet nurse Halimah" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What title did the Prophet ﷺ earn because of his trustworthiness?",
            options: [
              { text: "Al-Amin (the Trustworthy)" },
              { text: "Al-Hafiz (the Preserver)" },
              { text: "Al-Karim (the Generous)" },
              { text: "Al-Aziz (the Mighty)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The Prophet ﷺ was born in which year?",
            options: [
              { text: "The Year of the Elephant (~570 CE)" },
              { text: "The Year of the Flood" },
              { text: "The Year of the Covenant" },
              { text: "The Year of the Migration" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How did the Prophet ﷺ resolve the dispute over the Black Stone?",
            options: [
              { text: "He placed the stone on a cloth and had each tribe lift a corner" },
              { text: "He personally placed it, asserting tribal authority" },
              { text: "He let the eldest chief place it" },
              { text: "He drew lots among the tribes" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "At what age did the Prophet ﷺ marry Khadijah?",
            options: [
              { text: "25" },
              { text: "30" },
              { text: "20" },
              { text: "35" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The First Revelation",
        duration: 30,
        content: `## The Cave of Hira

At age 40, the Prophet ﷺ began retreating to **Cave Hira** on Jabal an-Noor (Mountain of Light) outside Makkah. He would meditate and contemplate the Creator. It was here that the most significant event in human history unfolded.

The first revelation began with **true visions in sleep** — they would come like the break of dawn. Then he came to love seclusion and would stay in the Cave of Hira for many nights.

## The Descent of Jibril (AS)

One night, the Angel **Jibril (AS)** appeared and commanded: **"Iqra!"** (Read!).

- The Prophet ﷺ replied: "I am not one who reads" — he was unlettered
- Jibril **embraced him tightly** three times, each time commanding him to read
- Finally, Jibril revealed the first verses of **Surah Al-Alaq (96:1-5)**

> **"Recite in the name of your Lord who created — Created man from a clot. Recite, and your Lord is the Most Generous — Who taught by the pen — Taught man that which he knew not."**

## The Return to Khadijah

Trembling and overwhelmed, the Prophet ﷺ returned to Khadijah saying: **"Cover me! Cover me!"** He told her what had happened, and she became the **first person to believe in his prophethood**.

She took him to her cousin **Waraqah ibn Nawfal**, a Christian scholar who confirmed: **"This is the same angel that Allah sent to Moses. I wish I could be alive when your people drive you out"** — foreseeing the persecution to come.`,
        questions: [
          {
            questionText: "Where was the Prophet ﷺ when he received the first revelation?",
            options: [
              { text: "Cave of Hira on Jabal an-Noor" },
              { text: "Cave of Thawr" },
              { text: "In his home with Khadijah" },
              { text: "At the Kaaba" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which angel delivered the first revelation?",
            options: [
              { text: "Jibril (AS)" },
              { text: "Mikail (AS)" },
              { text: "Israfil (AS)" },
              { text: "Malik (AS)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which surah was first revealed?",
            options: [
              { text: "Surah Al-Alaq (96)" },
              { text: "Surah Al-Fatihah (1)" },
              { text: "Surah Al-Qalam (68)" },
              { text: "Surah Al-Muddaththir (74)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Who confirmed to the Prophet that the revelation was from Allah?",
            options: [
              { text: "Waraqah ibn Nawfal" },
              { text: "Abu Bakr as-Siddiq" },
              { text: "Ali ibn Abi Talib" },
              { text: "Hamzah ibn Abd al-Muttalib" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The Makkan Period — Early Dawah",
        duration: 35,
        content: `## The Early Call to Islam

The Prophet ﷺ began his mission with **secret calls** to those he trusted most. For three years, Islam spread quietly among close friends and family.

## The First Believers

- **Khadijah bint Khuwaylid** — first believer, unwavering supporter
- **Ali ibn Abi Talib** — first child to accept Islam (age 10)
- **Abu Bakr as-Siddiq** — first adult male outside the family
- **Zayd ibn Harithah** — freed slave and adopted son
- **Bilal ibn Rabah**, **Ammar ibn Yasir**, **Sumayyah bint Khabbab** — early converts from marginalized backgrounds

## The Open Call

After three years, Allah commanded the Prophet ﷺ to **call openly**. He ascended Mount Safa and addressed the Quraysh: **"If I told you that an army was behind this mountain, would you believe me?"** They replied: **"We have never known you to lie."**

He then declared: **"I am a warner to you of a severe punishment before you."** His uncle **Abu Lahab** cursed him publicly, and the Quraysh began their campaign of opposition.

> Allah revealed: **"Perish the hands of Abu Lahab and perish he!"** (Surah Al-Masad 111) — a powerful confirmation that the Prophet's message was from Allah.

## The Quraysh's Response

- **Mockery and ridicule** — calling him a poet, magician, or madman
- **Offers of wealth and power** — kingship, wealth, and marriage if he would stop
- **Prophet's reply:** "By Allah, if they put the sun in my right hand and the moon in my left, I would not abandon this mission until Allah makes it prevail or I perish trying."`,
        questions: [
          {
            questionText: "How long did the Prophet ﷺ call to Islam secretly before the open call?",
            options: [
              { text: "Three years" },
              { text: "One year" },
              { text: "Five years" },
              { text: "Seven years" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Who was the first adult male outside the family to accept Islam?",
            options: [
              { text: "Abu Bakr as-Siddiq" },
              { text: "Umar ibn al-Khattab" },
              { text: "Uthman ibn Affan" },
              { text: "Hamzah ibn Abd al-Muttalib" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which surah was revealed in response to Abu Lahab's cursing of the Prophet?",
            options: [
              { text: "Surah Al-Masad (111)" },
              { text: "Surah Al-Kawthar (108)" },
              { text: "Surah An-Nasr (110)" },
              { text: "Surah Al-Ikhlas (112)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "From which mountain did the Prophet ﷺ make the first open call?",
            options: [
              { text: "Mount Safa" },
              { text: "Mount Marwah" },
              { text: "Mount Uhud" },
              { text: "Mount Hira" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Persecution & Patience",
        duration: 30,
        content: `## The Trials of the Early Muslims

As the Quraysh realized that offers and mockery would not stop the Prophet ﷺ, they escalated to **systematic persecution** of the believers — especially the weak and unprotected.

## Forms of Persecution

- **Physical torture** — Bilal was made to lie on burning sand with rocks on his chest. Ammar's parents were tortured to death before his eyes
- **Social boycott** — the Banu Hashim were confined to a valley for three years, unable to trade or marry
- **Economic pressure** — Muslims were boycotted, their goods confiscated
- **Psychological warfare** — constant ridicule, threats, and intimidation

## The Year of Grief (Aam al-Huzn)

In the 10th year of prophethood, the Prophet ﷺ suffered two devastating losses:

1. **Khadijah (RA)** — his beloved wife, confidante and first supporter — passed away
2. **Abu Talib** — his protective uncle who shielded him from the Quraysh — also died

With the loss of his two main protectors, the persecution intensified. The Prophet ﷺ called this **"the Year of Grief."**

## The Journey to Ta'if

Seeking a new base for Islam, the Prophet ﷺ traveled to **Ta'if**. The people rejected him cruelly, **stoning him** until his feet bled. As he retreated to a garden, the angel of the mountains offered to crush the people between two mountains — but the Prophet ﷺ refused, saying:

> **"I hope that Allah will bring from their descendants people who will worship Allah alone."**`,
        questions: [
          {
            questionText: "What was the Year of Grief (Aam al-Huzn)?",
            options: [
              { text: "The year Khadijah and Abu Talib both died" },
              { text: "The year of the Battle of Badr" },
              { text: "The year of the Hijrah" },
              { text: "The year of the boycott of Banu Hashim" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How did the people of Ta'if respond to the Prophet's call?",
            options: [
              { text: "They stoned him until his feet bled" },
              { text: "They accepted Islam" },
              { text: "They ignored him" },
              { text: "They offered him wealth" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "When the angel offered to destroy the people of Ta'if, what did the Prophet do?",
            options: [
              { text: "He refused and prayed for their descendants to believe" },
              { text: "He accepted the offer" },
              { text: "He asked for a delay" },
              { text: "He consulted his companions first" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How long was the Banu Hashim social boycott?",
            options: [
              { text: "Three years" },
              { text: "One year" },
              { text: "Five years" },
              { text: "Six months" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The Night Journey & Ascension (Isra & Mi'raj)",
        duration: 35,
        content: `## The Journey of Journeys

In the midst of grief and hardship, Allah honored the Prophet ﷺ with the greatest miracle — the **Night Journey** (Isra) and **Heavenly Ascension** (Mi'raj).

> Allah says: **"Exalted is He who took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings We have blessed, to show him of Our signs. Indeed, He is the Hearing, the Seeing."** (Surah Al-Isra 17:1)

## The Isra (Night Journey)

- The Prophet ﷺ was transported from the **Kaaba in Makkah** to **Masjid al-Aqsa in Jerusalem** on the winged steed **Al-Buraq**
- In Jerusalem, he **led all previous prophets in prayer** — a symbol of his leadership of all humanity
- He was offered two vessels: **wine and milk**. He chose milk, and Jibril said: "You have chosen the natural disposition (Fitrah)."

## The Mi'raj (Ascension)

From Jerusalem, the Prophet ﷺ ascended through the seven heavens, meeting various prophets:

- **First heaven:** Prophet Adam (AS)
- **Second heaven:** Prophets Yahya and Isa (AS)
- **Third heaven:** Prophet Yusuf (AS)
- **Fourth heaven:** Prophet Idris (AS)
- **Fifth heaven:** Prophet Harun (AS)
- **Sixth heaven:** Prophet Musa (AS)
- **Seventh heaven:** Prophet Ibrahim (AS)
- **Sidrat al-Muntaha:** The Lote Tree of the Utmost Boundary — where he received the command for **50 daily prayers**, later reduced to **5** after Musa's advice

## Lessons from Isra and Mi'raj

- **Hardship is followed by ease** — the greatest spiritual gift came after the worst worldly trial
- **The five daily prayers** were gifted directly by Allah — their importance is unmatched
- **Faith transcends time and space** — all prophets are united in Tawheed`,
        questions: [
          {
            questionText: "On which animal did the Prophet ﷺ travel during the Night Journey?",
            options: [
              { text: "Al-Buraq" },
              { text: "A flying carpet" },
              { text: "A horse named Qaswa" },
              { text: "A camel" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Where did the Prophet ﷺ lead the other prophets in prayer?",
            options: [
              { text: "Masjid al-Aqsa in Jerusalem" },
              { text: "Masjid an-Nabawi in Madinah" },
              { text: "The Kaaba in Makkah" },
              { text: "The Cave of Hira" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many daily prayers were originally commanded?",
            options: [
              { text: "50" },
              { text: "5" },
              { text: "10" },
              { text: "30" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which prophet advised the Prophet ﷺ to ask for a reduction in prayers?",
            options: [
              { text: "Musa (AS)" },
              { text: "Ibrahim (AS)" },
              { text: "Isa (AS)" },
              { text: "Adam (AS)" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The Hijrah to Madinah",
        duration: 40,
        content: `## The Migration to Madinah

As persecution intensified and the Quraysh plotted to assassinate the Prophet ﷺ, Allah gave permission for the Muslims to **migrate** to **Yathrib** (later renamed Madinah al-Munawwarah). This migration (Hijrah) marks the beginning of the Islamic calendar.

## The Planning

- The Prophet ﷺ and **Abu Bakr (RA)** hid in the **Cave of Thawr** for three days
- Allah caused a **spider to weave a web** and a **bird to nest** at the cave entrance, convincing pursuers it was empty
- They hired a guide from a different tribe for secrecy
- The journey took **8-10 days** on camelback through desert terrain

## The Arrival in Madinah

The entire city welcomed the Prophet ﷺ with joy. People sang:

> **"The full moon has risen over us — from the passes of Thaniyat al-Wada — gratitude is due to Allah — as long as any caller calls to Allah."**

Every family wanted the Prophet ﷺ to stay with them. He let his camel, **Qaswa**, decide — wherever it knelt, that would be his home. It knelt at the site where **Masjid an-Nabawi** now stands.

## Key Actions in Madinah

- **Built the first mosque** — Masjid an-Nabawi, the center of the new community
- **Established brotherhood** (Muakhah) — pairing each Muhajir with an Ansar as brothers
- **Drafted the Constitution of Madinah** — the first written constitution in history
- **Built a market** — economic independence from the Quraysh`,
        questions: [
          {
            questionText: "In which cave did the Prophet and Abu Bakr hide during the Hijrah?",
            options: [
              { text: "Cave of Thawr" },
              { text: "Cave of Hira" },
              { text: "Cave of Saur" },
              { text: "Cave of the Seven Sleepers" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What did Allah use to conceal the cave entrance?",
            options: [
              { text: "A spider web and a bird's nest" },
              { text: "A sandstorm" },
              { text: "A rock that rolled in front" },
              { text: "A tree that grew overnight" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What was the name of the Prophet's camel?",
            options: [
              { text: "Qaswa" },
              { text: "Al-Buraq" },
              { text: "Al-Mahdi" },
              { text: "Al-Kawthar" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The Hijrah marks the beginning of which calendar?",
            options: [
              { text: "The Islamic calendar" },
              { text: "The Gregorian calendar" },
              { text: "The Jewish calendar" },
              { text: "The Persian calendar" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Building the Islamic State in Madinah",
        duration: 35,
        content: `## The Foundations of Islamic Civilization

In Madinah, the Prophet ﷺ established the **first Islamic state** — a model of governance, social justice, and community organization that would transform the world.

## The Constitution of Madinah

This remarkable document, written by the Prophet ﷺ himself, established:

- **Unity of the community** — Muslims, Jews, and polytheists formed one nation (Ummah)
- **Freedom of religion** — "The Jews have their religion, and the Muslims have theirs"
- **Mutual defense** — all parties would defend the city against attack
- **Justice for all** — the Prophet ﷺ was the final authority in disputes
- **Blood money and ransom** — a system to prevent endless tribal feuds

> This constitution is considered the **first written constitution in human history**, predating the Magna Carta by nearly 600 years.

## The Brotherhood (Muakhah)

Each immigrant from Makkah was paired with a resident of Madinah as a **brother in faith**. The Ansar shared homes, businesses, and farms with their Muhajir brothers. This bond was so strong they even inherited from each other (a temporary ruling later abrogated).

## The Role of the Masjid

Masjid an-Nabawi was not just a place of prayer — it was:

- A **school** — where the Sahabah learned Quran and Islam
- A **court** — where disputes were resolved
- A **community center** — for social gatherings and events
- A **guest house** — where visitors and delegations were hosted
- A **hospital** — where the wounded were treated`,
        questions: [
          {
            questionText: "What is the Constitution of Madinah considered to be?",
            options: [
              { text: "The first written constitution in human history" },
              { text: "The first international treaty" },
              { text: "A commercial trade agreement" },
              { text: "A military alliance only" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What was Muakhah (brotherhood)?",
            options: [
              { text: "Pairing each Muhajir with an Ansar as brothers in faith" },
              { text: "A military training program" },
              { text: "A treaty with the Quraysh" },
              { text: "A system of trade agreements" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which of these was NOT a function of Masjid an-Nabawi?",
            options: [
              { text: "A marketplace for buying and selling" },
              { text: "A school for learning Quran" },
              { text: "A court for resolving disputes" },
              { text: "A community center for gatherings" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The Constitution of Madinah predates the Magna Carta by how many years?",
            options: [
              { text: "Nearly 600 years" },
              { text: "Nearly 200 years" },
              { text: "Nearly 1000 years" },
              { text: "Nearly 100 years" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The Major Battles",
        duration: 50,
        content: `## Defending the New State

The Quraysh could not tolerate an independent Muslim state in Madinah. They launched several military campaigns. The Prophet ﷺ, under divine guidance, responded with strategic defensive battles.

## Battle of Badr (2 AH / 624 CE)

The first and most significant battle.

- **Muslims:** 313 poorly equipped men, 2 horses, 70 camels
- **Quraysh:** 1,000 well-armed men, 200 horses
- **Outcome:** Decisive Muslim victory — 70 Quraysh killed, 70 captured
- **Significance:** Established the Muslims as a military force. Angels fought alongside them

> Allah says: **"And Allah had certainly helped you at Badr when you were weak."** (Surah Aal-e-Imran 3:123)

## Battle of Uhud (3 AH / 625 CE)

- **Muslims:** 700 men
- **Quraysh:** 3,000 men, including 200 cavalry led by Khalid ibn al-Walid
- **Outcome:** Initial Muslim advantage turned to defeat when **archers disobeyed** the Prophet's order
- **Losses:** 70 Muslims martyred, including the Prophet's uncle **Hamzah (RA)**
- **Lesson:** Obedience to the leader is paramount

## Battle of the Trench (Khandaq) — 5 AH / 627 CE

- A coalition of 10,000 enemy forces besieged Madinah
- The Prophet ﷺ acted on the advice of **Salman al-Farsi (RA)** to dig a trench
- After a month-long siege, a **windstorm** sent by Allah scattered the coalition
- **Significance:** The last major campaign against Madinah; Islam spread rapidly afterward`,
        questions: [
          {
            questionText: "How many Muslims fought at the Battle of Badr?",
            options: [
              { text: "313" },
              { text: "700" },
              { text: "1,000" },
              { text: "10,000" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What caused the Muslim defeat at Uhud?",
            options: [
              { text: "The archers disobeyed the Prophet's order to hold their position" },
              { text: "The Muslims were outnumbered and weak" },
              { text: "The Quraysh used war elephants" },
              { text: "There was a sandstorm" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Who suggested digging a trench at the Battle of the Trench?",
            options: [
              { text: "Salman al-Farsi (RA)" },
              { text: "Khalid ibn al-Walid (RA)" },
              { text: "Abu Bakr as-Siddiq (RA)" },
              { text: "Umar ibn al-Khattab (RA)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which beloved uncle of the Prophet was martyred at Uhud?",
            options: [
              { text: "Hamzah (RA)" },
              { text: "Abu Talib" },
              { text: "Al-Abbas (RA)" },
              { text: "Abu Lahab" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "The Farewell Sermon & Legacy",
        duration: 40,
        content: `## The Final Year

In the 10th year after Hijrah (632 CE), the Prophet ﷺ performed his **only Hajj** — known as **Hajjat al-Wada** (the Farewell Pilgrimage). During this pilgrimage, he delivered the most comprehensive sermon ever given.

## The Farewell Sermon (Khutbat al-Wada)

Standing at **Mount Arafat**, addressing over 100,000 companions, the Prophet ﷺ said:

> "O people, listen to me carefully. I do not know whether I will ever meet you here again after this year.   **Your lives and property are sacred** — as sacred as this day, this month, and this city.   **All usury (riba) is abolished** — your capital is yours, do not wrong and you will not be wronged.   **Beware of Satan** — he has despaired of being worshipped in this land, but he will be satisfied with being obeyed in your deeds.   **O people, your Lord is One, and your father is one.** All of you are from Adam, and Adam was from dust. There is no superiority for an Arab over a non-Arab, nor for a non-Arab over an Arab, except by piety (Taqwa)."

## The Completion of the Religion

After the sermon, Allah revealed the final verse of the Quran:

> **"This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as your religion."** (Surah Al-Ma'idah 5:3)

## The Passing of the Prophet ﷺ

Shortly after returning to Madinah, the Prophet ﷺ fell ill. He passed away on Monday, the 12th of Rabi' al-Awwal, 11 AH (632 CE), at the age of 63, in the room of his wife Aisha (RA). His last words were: **"With the Supreme Companion (Ar-Rafiq al-A'la)."**

## The Enduring Legacy

- He left behind the **Quran and the Sunnah** — the complete guidance for humanity
- Within 100 years, Islam spread from Spain to China
- He transformed a tribal society into a civilization of justice, learning, and compassion
- He is the most influential human being in history, loved by over a billion people today`,
        questions: [
          {
            questionText: "In which year after Hijrah did the Prophet perform his farewell Hajj?",
            options: [
              { text: "10 AH" },
              { text: "8 AH" },
              { text: "11 AH" },
              { text: "9 AH" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What was the final revealed verse of the Quran?",
            options: [
              { text: "\"This day I have perfected for you your religion...\" (5:3)" },
              { text: "\"Today I have completed your faith...\" (5:5)" },
              { text: "\"And fear the Day when you will be returned to Allah...\" (2:281)" },
              { text: "\"O Prophet, indeed We have sent you as a witness...\" (33:45)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "According to the Farewell Sermon, what is the basis of superiority?",
            options: [
              { text: "Piety (Taqwa)" },
              { text: "Wealth" },
              { text: "Tribal lineage" },
              { text: "Knowledge alone" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Where did the Prophet ﷺ deliver the Farewell Sermon?",
            options: [
              { text: "Mount Arafat" },
              { text: "Masjid an-Nabawi" },
              { text: "Mount Safa" },
              { text: "The Kaaba" },
            ],
            correctAnswer: "0",
          },
        ],
      },
    ],
  },
  {
    title: "Tajweed Foundations",
    slug: "tajweed-foundations",
    description: "A self-paced introduction to the rules of Tajweed. Covers Makharij, Sifaat, Noon Sakinah, Meem Sakinah, and Madd rules — complete with audio examples and interactive exercises.",
    image: "/tajweed.jpg",
    category: "Quran",
    lessons: [
      {
        title: "Introduction to Tajweed",
        duration: 20,
        videoUrl: "https://www.youtube.com/embed/mCjcofctbHg",
        content: `## What is Tajweed?

Tajweed (تجويد) literally means "to make better" or "to improve." In the context of Quranic recitation, it refers to the set of rules governing the correct pronunciation of letters and the proper application of recitation rules.

### The Ruling of Tajweed

Scholars agree that applying Tajweed is **fard ‘ayn** (an individual obligation) for every Muslim who recites the Quran. The evidence comes from Allah's command:

> "…And recite the Quran with measured recitation." (Surah Al-Muzzammil, 73:4)

### Why Learn Tajweed?

- **Preserve the meaning** — Incorrect pronunciation can change the meaning of words
- **Beautify your recitation** — The Prophet ﷺ said: "Adorn the Quran with your voices"
- **Earn rewards** — Every letter recited brings 10 rewards

### The Two Branches of Tajweed

- **Knowing the rules**, Application (Practice): Reciting with proper pronunciation
- **Understanding Makharij**, Application (Practice): Producing letters from correct articulation points

### Key Arabic Letters to Practice

أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ء ي

### Listen & Repeat

Find a recording of Surah Al-Fatihah by a qualified Qari (e.g., Sheikh Al-Husary or Sheikh Sudais). Listen carefully and try to imitate the pronunciation of each letter.

---

### Key Takeaways

1. Tajweed means "improvement" — it is the science of correct Quranic recitation
2. It is obligatory for every Muslim reciting the Quran
3. There are two aspects: theoretical knowledge and practical application
4. The Arabic alphabet has 28 letters, some with unique articulation points`,
        questions: [
          {
            questionText: "What does the word \"Tajweed\" (تجويد) literally mean?",
            options: [
              { text: "To make better / to improve" },
              { text: "To memorize" },
              { text: "To recite quickly" },
              { text: "To understand" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The ruling of Tajweed for every Muslim reciting the Quran is:",
            options: [
              { text: "Fard ‘Ayn (individual obligation)" },
              { text: "Fard Kifayah (communal obligation)" },
              { text: "Sunnah (recommended)" },
              { text: "Mubah (permissible)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which verse commands us to recite the Quran with measured recitation?",
            options: [
              { text: "Surah Al-Muzzammil, 73:4" },
              { text: "Surah Al-Fatihah, 1:1" },
              { text: "Surah Al-Baqarah, 2:255" },
              { text: "Surah Al-Ikhlas, 112:1" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many letters are in the Arabic alphabet?",
            options: [
              { text: "28" },
              { text: "26" },
              { text: "30" },
              { text: "24" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What are the two branches of Tajweed?",
            options: [
              { text: "Theory (Ilm) and Practice (Application)" },
              { text: "Reading and Writing" },
              { text: "Memorization and Revision" },
              { text: "Tafsir and Fiqh" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Makharij al-Huruf — Part 1",
        duration: 30,
        videoUrl: "https://www.youtube.com/embed/KirU7DexAiI",
        content: `## Articulation Points — The Throat Letters

Every Arabic letter has a specific **makhraj** (articulation point) — the place in the mouth or throat where it is produced. Learning Makharij is the foundation of correct Tajweed.

### The Five Main Regions

1. **Al-Jawf** (الجوف) — The empty space in the mouth and throat
2. **Al-Halq** (الحلق) — The throat (3 points)
3. **Al-Lisaan** (اللسان) — The tongue (10 points)
4. **Ash-Shafataan** (الشفتان) — The lips (2 points)
5. **Al-Khayshoom** (الخيشوم) — The nasal cavity

### 1. Throat Letters (Al-Halq)

The throat is divided into three articulation points:

- **Aqsal-Halq (أقصى الحلق)**, Location: Deepest part of the throat (near the chest), Letters: ء ه
- **Wasat al-Halq (وسط الحلق)**, Location: Middle of the throat, Letters: ع ح
- **Adnal-Halq (أدنى الحلق)**, Location: Nearest part of the throat (near the mouth), Letters: غ خ

### Pronunciation Guide

- **ء (Hamzah)** — A sharp glottal stop, like the "t" in "bottle" (British English)
- **ه (Ha)** — A soft exhale from the deepest throat
- **ع (‘Ayn)** — A strong, deep sound from the middle throat (no English equivalent)
- **ح (Hha)** — A sharp exhale from the middle throat, like blowing on glasses to clean them
- **غ (Ghayn)** — A rolling sound from the nearest throat, like a French "r"
- **خ (Kha)** — A rough, scraping sound from the nearest throat, like the "ch" in Scottish "loch"

### Practice Exercise

أَ - هَ - عَ - حَ - غَ - خَ

Repeat each letter slowly, focusing on where it feels like it's produced in your throat.`,
        questions: [
          {
            questionText: "How many main articulation point regions are there for Arabic letters?",
            options: [
              { text: "5" },
              { text: "3" },
              { text: "7" },
              { text: "10" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which letters are pronounced from the deepest part of the throat (Aqsal-Halq)?",
            options: [
              { text: "ء (Hamzah) and ه (Ha)" },
              { text: "ع (‘Ayn) and ح (Hha)" },
              { text: "غ (Ghayn) and خ (Kha)" },
              { text: "ق (Qaf) and ك (Kaf)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The letter خ (Kha) is pronounced from which part of the throat?",
            options: [
              { text: "Adnal-Halq — nearest part of the throat" },
              { text: "Aqsal-Halq — deepest part of the throat" },
              { text: "Wasat al-Halq — middle of the throat" },
              { text: "Al-Jawf — the empty space in the mouth" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which letter is described as having \"no English equivalent\" and requires a strong, deep sound?",
            options: [
              { text: "ع (‘Ayn)" },
              { text: "ه (Ha)" },
              { text: "ء (Hamzah)" },
              { text: "غ (Ghayn)" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Makharij al-Huruf — Part 2",
        duration: 30,
        videoUrl: "https://www.youtube.com/embed/CtKHyq7aNWI",
        content: `## Articulation Points — Tongue, Lips, and Nasal Cavity

### 2. Tongue Letters (Al-Lisaan)

The tongue has **10 articulation points** producing **18 letters**. These are divided among different parts of the tongue:

### The Deepest Part of the Tongue (Aqsal-Lisaan)

Touching the upper palate near the throat:

- **ق (Qaf)** — Deepest part of tongue touches the upper palate
- **ك (Kaf)** — Slightly forward of Qaf's position

### Middle of the Tongue (Wasat al-Lisaan)

The middle of the tongue touches the middle of the upper palate:

- **ج (Jeem)** — جـِ
- **ش (Sheen)** — شـِ
- **ي (Ya)** — يـِ (when used as a consonant)

### Side of the Tongue (Haafat al-Lisaan)

- **ض (Daud)** — Pronounced from the side(s) of the tongue touching the upper molars. The most difficult Arabic letter for non-native speakers!

### Tip of the Tongue

Various positions produce the remaining letters: ل, ن, ر, د, ت, ط, ص, ز, س, ظ, ث, ذ, and more.

### 3. Lip Letters (Ash-Shafataan)

- **ف (Fa)**, How It Is Produced: Inner part of the bottom lip touches the edge of the upper front teeth
- **ب (Ba)**, How It Is Produced: Two lips close together with pressure
- **م (Meem)**, How It Is Produced: Two lips close together (lighter than Ba)
- **و (Waw)**, How It Is Produced: Lips rounded and forward, like English "w"

### 4. Nasal Cavity (Al-Khayshoom)

The **ghunnah** (nasalization) is produced from the nasal cavity. This occurs for:

- Letters **م** (Meem) and **ن** (Noon) when they have shaddah
- Ikhfaa, Idghaam with Ghunnah

### Practice: Complete the Letters Table

ق ك ج ش ي ض ل ن ر د ت ط ص ز س ظ ث ذ

Try to identify which region of the tongue produces each letter.`,
        questions: [
          {
            questionText: "The letter ض (Daud) is pronounced from which part of the tongue?",
            options: [
              { text: "The side(s) of the tongue touching the upper molars" },
              { text: "The tip of the tongue" },
              { text: "The deepest part of the tongue" },
              { text: "The middle of the tongue" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many articulation points does the tongue have?",
            options: [
              { text: "10" },
              { text: "5" },
              { text: "2" },
              { text: "18" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The letter ف (Fa) is produced by:",
            options: [
              { text: "Inner bottom lip touching the edge of upper front teeth" },
              { text: "Two lips closing together" },
              { text: "The tip of the tongue" },
              { text: "The nasal cavity" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What is \"Ghunnah\"?",
            options: [
              { text: "Nasalization produced from the nasal cavity" },
              { text: "A heavy letter" },
              { text: "An articulation point in the throat" },
              { text: "A type of Madd" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which of the following is NOT a lip letter?",
            options: [
              { text: "ق (Qaf)" },
              { text: "ف (Fa)" },
              { text: "ب (Ba)" },
              { text: "م (Meem)" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Sifaat al-Huruf",
        duration: 25,
        content: `## Characteristics of Letters (Sifaat al-Huruf)

Every Arabic letter has **permanent characteristics** (Sifaat Lazimah) that distinguish it from other letters that share the same articulation point. Understanding these helps you produce each letter correctly.

### Opposing Characteristics

Most Sifaat come in pairs:

- ****Al-Jahr** (الجهر)**, Meaning: Voicebox engaged — vibration felt, Opposite: **Al-Hams** (الهمس) — Whisper, no vibration
- ****Ash-Shiddah** (الشدة)**, Meaning: Strong — airflow blocked completely, Opposite: **Ar-Rakhawah** (الرخاوة) — Soft, airflow continues
- ****Al-Istifaal** (الاستفال)**, Meaning: Flat tongue, light sound, Opposite: **Al-Isti'laa** (الاستعلاء) — Raised tongue, heavy sound
- ****Al-Infitaah** (الانفتاح)**, Meaning: Tongue separates from the palate, Opposite: **Al-Itbaaq** (الإطباق) — Tongue adheres to the palate
- ****Al-Idhlaaq** (الإذلاق)**, Meaning: Pronounced quickly with tongue tip/lips, Opposite: **Al-Ismaat** (الإصمات) — Heavy, slower pronunciation

### The "Heavy" Letters (Tafkheem)

Seven letters are always heavy (مفخمة):

خ ص ض غ ط ق ظ

A mnemonic: **"خص ضغط قظ"**

When pronouncing these, the tongue is raised toward the upper palate, giving the letter a "full" or "deep" quality.

### The "Light" Letters (Tarqeeq)

All other letters are light (مرققة) — the tongue remains flat and the sound is thin.

### Practice Exercise

Compare the following pairs, feeling the difference between heavy and light:

س (light) vs ص (heavy) — ت (light) vs ط (heavy) — ذ (light) vs ظ (heavy)`,
        questions: [
          {
            questionText: "How many \"heavy\" letters (Tafkheem) are there?",
            options: [
              { text: "7" },
              { text: "5" },
              { text: "10" },
              { text: "28" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The characteristic Al-Jahr means:",
            options: [
              { text: "Voicebox is engaged, vibration is felt" },
              { text: "Airflow is blocked completely" },
              { text: "Airflow continues without interruption" },
              { text: "The sound is whispered" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which of these letters is a \"heavy\" letter?",
            options: [
              { text: "ص (Saad)" },
              { text: "س (Seen)" },
              { text: "د (Dal)" },
              { text: "ت (Ta)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What happens to the tongue when pronouncing heavy letters?",
            options: [
              { text: "The tongue is raised toward the upper palate" },
              { text: "The tongue lies flat" },
              { text: "The tongue curls backward" },
              { text: "The tongue touches the lower teeth" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Noon Sakinah & Tanween",
        duration: 35,
        videoUrl: "https://www.youtube.com/embed/mDxEV5IINMg",
        content: `## The Four Rules of Noon Sakinah and Tanween

When a **Noon Sakinah** (ن with sukoon) or **Tanween** (ً ٍ ٌ) is followed by one of the 28 Arabic letters, one of four rules applies:

### 1. Al-Ith-haar (الإظهار) — Clear Pronunciation

**Rule:** The Noon Sakinah/Tanween is pronounced clearly without ghunnah.

**Letters:** Throat letters — ء ه ع ح غ خ

**Example:** مَنْ آمَنَ (man aaman) — the ن is clear

### 2. Al-Idghaam (الإدغام) — Merging

**Rule:** The Noon Sakinah/Tanween is merged into the following letter. It comes in two types:

- **Idghaam with Ghunnah**, Letters: ي ن م و, With Ghunnah?: Yes (2 counts)
- **Idghaam without Ghunnah**, Letters: ل ر, With Ghunnah?: No

**Memory aid for Idghaam with Ghunnah:** ينمو (Yanmu — "it grows")

### 3. Al-Iqlaab (الإقلاب) — Conversion

**Rule:** The Noon Sakinah/Tanween is converted to a **Meem (م)** with ghunnah.

**Letter:** ب (Ba) only

**Example:** مِنْ بَعْدِ (mim ba'di) — pronounced as if written مِم بَعْدِ

### 4. Al-Ikhfaa (الإخفاء) — Concealment

**Rule:** The Noon Sakinah/Tanween is pronounced with ghunnah but not fully clear nor merged.

**Letters:** The remaining 15 letters (all except the ones above)

**Example:** مِنْ شَيْءٍ (min shay'in) — soft nasalization

### Summary Table

- **Ith-haar**, Letters: ء ه ع ح غ خ, Count: 6
- **Idghaam**, Letters: ي ن م و ل ر, Count: 6
- **Iqlaab**, Letters: ب, Count: 1
- **Ikhfaa**, Letters: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك, Count: 15

**Total: 28 letters**`,
        questions: [
          {
            questionText: "How many rules apply to Noon Sakinah and Tanween?",
            options: [
              { text: "4" },
              { text: "3" },
              { text: "5" },
              { text: "2" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Al-Iqlaab applies when Noon Sakinah is followed by which letter?",
            options: [
              { text: "ب (Ba)" },
              { text: "م (Meem)" },
              { text: "ل (Lam)" },
              { text: "ي (Ya)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Al-Ith-haar applies before which group of letters?",
            options: [
              { text: "Throat letters: ء ه ع ح غ خ" },
              { text: "Lip letters: ف ب م و" },
              { text: "Tongue tip letters: ت ث د ذ" },
              { text: "Heavy letters: خ ص ض غ ط ق ظ" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What happens to the Noon in Al-Iqlaab?",
            options: [
              { text: "It is converted to a Meem (م) with ghunnah" },
              { text: "It is pronounced clearly" },
              { text: "It is merged into the next letter" },
              { text: "It is completely silent" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many letters trigger Al-Ikhfaa?",
            options: [
              { text: "15" },
              { text: "6" },
              { text: "28" },
              { text: "1" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Meem Sakinah",
        duration: 25,
        content: `## The Rules of Meem Sakinah

When a **Meem Sakinah** (م with sukoon) is followed by any Arabic letter, one of three rules applies:

### 1. Al-Ikhfaa Ash-Shafawi (الإخفاء الشفوي) — Labial Concealment

**When:** Meem Sakinah is followed by **ب (Ba)**

The Meem is pronounced with ghunnah but not fully clear, preparing the lips for Ba.

**Example:** تَرْمِيهِم بِحِجَارَةٍ — The ب is pronounced with the lips ready for the next letter

### 2. Al-Idghaam Ash-Shafawi (الإدغام الشفوي) — Labial Merging

**When:** Meem Sakinah is followed by another **م (Meem)**

The first Meem merges into the second with ghunnah (2 counts).

**Example:** لَهُمْ مَا (lahum maa) — the first م merges into the second

### 3. Al-Ith-haar Ash-Shafawi (الإظهار الشفوي) — Labial Clarity

**When:** Meem Sakinah is followed by any letter **other than** ب or م

The Meem is pronounced clearly without ghunnah.

**Example:** أَنْعَمْتَ عَلَيْهِمْ غَيْرِ — the م is clear before غ

### Summary

- **Ikhfaa Shafawi**, Following Letter: ب, Pronunciation: Ghunnah, concealed
- **Idghaam Shafawi**, Following Letter: م, Pronunciation: Merged with ghunnah
- **Ith-haar Shafawi**, Following Letter: All other letters, Pronunciation: Clear, no ghunnah`,
        questions: [
          {
            questionText: "How many rules apply to Meem Sakinah?",
            options: [
              { text: "3" },
              { text: "4" },
              { text: "2" },
              { text: "1" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Al-Ikhfaa Ash-Shafawi occurs when Meem Sakinah is followed by:",
            options: [
              { text: "ب (Ba)" },
              { text: "م (Meem)" },
              { text: "ف (Fa)" },
              { text: "و (Waw)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "When two Meems meet (first with sukoon), which rule applies?",
            options: [
              { text: "Idghaam Shafawi — the first merges into the second with ghunnah" },
              { text: "Ikhfaa Shafawi — concealed pronunciation" },
              { text: "Ith-haar Shafawi — clear pronunciation" },
              { text: "Iqlaab — conversion to another letter" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Madd Rules — Introduction",
        duration: 30,
        content: `## Introduction to Madd (مد)

**Madd** literally means "to lengthen" or "to extend." In Tajweed, it refers to lengthening the pronunciation of a vowel letter beyond its natural duration.

### The Three Madd Letters (Huroof al-Madd)

There are three letters that can be lengthened:

- **ا** (Alif) — preceded by a fatha (ـَ)
- **و** (Waw Saakinah) — preceded by a dammah (ـُ)
- **ي** (Ya Saakinah) — preceded by a kasrah (ـِ)

### Natural Madd (Madd Asli)

The basic, natural lengthening of **2 counts** (harakat). This occurs when a madd letter is **not followed** by a hamzah (ء) or a sukoon (ْ).

**Examples:** قَالَ (qaala), يَقُولُ (yaqoolu), رَحِيمٍ (raheem)

### Causes of Extended Madd

Two things can cause the Madd to be extended beyond 2 counts:

1. **Hamzah** (ء) — either before or after the madd letter
2. **Sukoon** (ْ) — stillness on the letter after the madd letter

### Madd Lengths

- **Natural (Asli)**, Counts: 2, Where Used: All basic madds
- **Permissible (Jaiz)**, Counts: 2, 4, or 5, Where Used: Madd Jaiz Munfasil
- **Necessary (Wajib)**, Counts: 4 or 5, Where Used: Madd Wajib Muttasil
- **Lazim (Compulsory)**, Counts: 6, Where Used: Madd Lazim — always 6 counts

### Practice

Read the following words and identify the madd letters:

الرَّحْمَٰنِ الرَّحِيمِ

Hint: Look for ا, و preceded by dammah, and ي preceded by kasrah.`,
        questions: [
          {
            questionText: "How many counts does Natural Madd (Madd Asli) have?",
            options: [
              { text: "2 counts" },
              { text: "4 counts" },
              { text: "6 counts" },
              { text: "1 count" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What are the three madd letters?",
            options: [
              { text: "ا (Alif), و (Waw), ي (Ya)" },
              { text: "ا (Alif), ب (Ba), ت (Ta)" },
              { text: "م (Meem), ن (Noon), و (Waw)" },
              { text: "ق (Qaf), ك (Kaf), ل (Lam)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What causes a Madd to be extended beyond 2 counts?",
            options: [
              { text: "Hamzah (ء) or Sukoon (ْ)" },
              { text: "Shaddah (ّ)" },
              { text: "Fatha (َ)" },
              { text: "Tanween (ً)" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Madd Lazim is always lengthened to how many counts?",
            options: [
              { text: "6 counts" },
              { text: "2 counts" },
              { text: "4 counts" },
              { text: "8 counts" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Madd Rules — Far'i (Extended)",
        duration: 40,
        content: `## Extended Madd (Madd al-Far'i)

When a **Hamzah** or **Sukoon** appears near a Madd letter, the elongation extends beyond the natural 2 counts. There are several types:

## 1. Madd Wajib Muttasil (مد واجب متصل)

**Compulsory connected Madd.** The Hamzah appears **after** the Madd letter in the **same word**.

- **Length:** 4-5 counts
- **Example:** **جَاءَ** (the Alif is followed by Hamzah in the same word)
- **Rule:** This Madd is wajib (compulsory) — it must be extended

## 2. Madd Jaiz Munfasil (مد جائز منفصل)

**Permissible separate Madd.** The Hamzah appears **after** the Madd letter but in the **next word**.

- **Length:** 2, 4, or 5 counts (depending on recitation style)
- **Example:** **يَا أَيُّهَا** (the Madd Ya is in the first word, Hamzah in the second)
- **Rule:** This Madd is jaiz (permissible) — the reciter may choose the length

## 3. Madd Aarid lis-Sukoon (مد عارض للسكون)

This Madd occurs when **stopping** at the end of a word that ends with a Madd letter followed by a letter that would have a vowel when continuing.

- **Length:** 2, 4, or 6 counts (at the stop)
- **Example:** **رَبِّ الْعَالَمِينَ** — when stopping on **الْعَالَمِينَ**, the Ya is extended
- **Rule:** The reciter chooses the length

> **Key distinction:** Madd Wajib Muttasil is **always** extended (at least 4 counts), while Madd Jaiz Munfasil can be shortened. This is a common area of error for students — do not shorten the Muttasil!`,
        questions: [
        ],
      },
      {
        title: "Qalqalah",
        duration: 20,
        content: `## What is Qalqalah?

**Qalqalah** (قلقلة) literally means *echoing* or *disturbance*. In Tajweed, it is the **vibrating/echoing sound** produced when pronouncing certain letters that have Sukoon on them.

> The Qalqalah letters are grouped in the phrase: **قُطْبُ جَدٍ** — the five letters: **ق ط ب ج د**

## The Five Qalqalah Letters

- **ق (Qaf)**, Pronunciation: Echo from the back of the tongue, Degree: Major
- **ط (Ta)**, Pronunciation: Echo from the tip of the tongue, Degree: Major
- **ب (Ba)**, Pronunciation: Echo from the lips, Degree: Minor
- **ج (Jeem)**, Pronunciation: Echo from the middle of the tongue, Degree: Minor
- **د (Dal)**, Pronunciation: Echo from the tip of the tongue, Degree: Minor

## Degrees of Qalqalah

- **Minor Qalqalah** — when the letter appears with Sukoon in the **middle** of a word
- **Major Qalqalah** — when the letter appears with Sukoon at the **end** of a word (especially when stopping)
- **Strongest Qalqalah** — when stopping on the letter and it has Shaddah (emphasis), e.g. **الْحَقَّ**

## Common Mistakes

- **Over-echoing** — Qalqalah should be a subtle echo, not a full vowel sound
- **Adding a vowel** — Do not say "bak" for ب — it should be a clean echo without a following Kasrah or vowel
- **Missing Qalqalah on ق and ط** — these two have the strongest echo; if they are weak, they sound like ك and ت respectively`,
        questions: [
        ],
      },
      {
        title: "Practical Review & Assessment",
        duration: 45,
        content: `## Review & Self-Assessment

This final module brings together everything you have learned. Work through each section and use the checklist to track your progress.

## Section 1: Articulation Points Review

Recite the following letters, focusing on their correct Makhraj:

- Throat letters: **ء ه ع ح غ خ**
- Tongue letters: **ق ك ج ش ي ض ل ن ر ط د ت ص س ز ظ ذ ث**
- Lip letters: **ب م ف و**

## Section 2: Sifaat Review

For each letter below, identify all its characteristics:

- **ص** — (Answer: Jahr, Rakhawah, Isti'laa, Itbaaq, Ismaat)
- **ف** — (Answer: Hams, Rakhawah, Istifaal, Infitaah, Idhlaaq)
- **ق** — (Answer: Jahr, Shiddah, Isti'laa, Infitaah, Ismaat — plus Qalqalah)

## Section 3: Noon & Meem Sakinah

Identify the rule applied in each example:

1. **مِنْ خَوْفٍ** — (Idhhaar — before خ)
2. **مِن مَّسَدٍ** — (Idghaam with Ghunnah — before م)
3. **سَمِيعٌ بَصِيرٌ** — (Iqlaab on the first Tanween — before ب)
4. **عَلَيْهِمْ وَلَا** — (Idhhaar ash-Shafawi — before و)

## Section 4: Madd Rules Quick Reference

- **Madd Asli**, Cause: Natural long vowel, Length: 2 counts, Ruling: Always
- **Madd Muttasil**, Cause: Hamzah in same word, Length: 4-5 counts, Ruling: Wajib
- **Madd Munfasil**, Cause: Hamzah in next word, Length: 2-5 counts, Ruling: Jaiz
- **Madd Aarid**, Cause: Sukoon at stop, Length: 2-6 counts, Ruling: Jaiz

## Self-Assessment Checklist

- I can identify the Makhraj of all 29 Arabic letters
- I can explain the four rules of Noon Sakinah
- I can apply the three rules of Meem Sakinah
- I can distinguish Madd Asli from the extended Madd types
- I can apply Qalqalah correctly on ق ط ب ج د
- I can recite a short passage applying all rules

> **Congratulations on completing Tajweed Foundations!** Continue practicing daily, and consider reciting to a qualified teacher for final correction and Ijazah.`,
        questions: [
        ],
      },
    ],
  },
  {
    title: "Fiqh of Salah",
    slug: "fiqh-of-salah",
    description: "Master the rulings, conditions, and etiquette of the five daily prayers. Covers purification, prayer times, pillars of Salah, common mistakes, and congregational prayer.",
    image: "/fiqh-salah.png",
    category: "Fiqh",
    lessons: [
      {
        title: "Importance & Ruling of Salah",
        duration: 20,
        videoUrl: "https://www.youtube.com/embed/PCzJ7r8VwLs",
        content: `## The Importance of Salah in Islam

Salah (prayer) is the second pillar of Islam and the most important act of worship after belief in Allah. It is a direct connection between the servant and their Lord, performed five times daily.

### Evidence from the Quran

> "Indeed, prayer has been enjoined upon the believers at fixed times." (Surah An-Nisa, 4:103)

> "And establish prayer and give zakah and bow with those who bow [in worship]." (Surah Al-Baqarah, 2:43)

### Evidence from the Sunnah

The Prophet ﷺ said:

> "The covenant between us and them is prayer; whoever abandons it has committed disbelief." (Sunan At-Tirmidhi)

### The Five Daily Prayers

- **Fajr** (الفجر) — 2 rak'ahs, before sunrise
- **Dhuhr** (الظهر) — 4 rak'ahs, after noon
- **Asr** (العصر) — 4 rak'ahs, afternoon
- **Maghrib** (المغرب) — 3 rak'ahs, after sunset
- **Isha** (العشاء) — 4 rak'ahs, night

### Consequences of Abandoning Salah

- Spiritual disconnection from Allah
- Loss of blessings in time and life
- Major sin with severe consequences on the Day of Judgment

### Benefits of Praying on Time

- Purifies the soul and prevents sin
- Brings peace and tranquility to the heart
- Teaches discipline and time management`,
        questions: [
          {
            questionText: "Salah is the _____ pillar of Islam.",
            options: [
              { text: "Second" },
              { text: "First" },
              { text: "Third" },
              { text: "Fourth" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many daily prayers are obligatory?",
            options: [
              { text: "5" },
              { text: "3" },
              { text: "7" },
              { text: "4" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which prayer has only 2 rak'ahs?",
            options: [
              { text: "Fajr" },
              { text: "Dhuhr" },
              { text: "Maghrib" },
              { text: "Isha" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What did the Prophet ﷺ say about abandoning prayer?",
            options: [
              { text: "It is the line between faith and disbelief" },
              { text: "It is a minor sin" },
              { text: "It is permissible under some circumstances" },
              { text: "It can be made up anytime without issue" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Purification — Wudu",
        duration: 35,
        content: `## Wudu (أبواب الوضوء)

Wudu is a spiritual and physical purification required before performing Salah. Allah says:

> "O you who believe! When you intend to offer prayer, wash your faces and your hands up to the elbows, wipe your heads, and (wash) your feet up to the ankles." (Surah Al-Ma'idah, 5:6)

### Obligatory Acts of Wudu (Fara'id)

1. **Intention (Niyyah)** — in the heart, not spoken
2. **Washing the face** — from hairline to chin, ear to ear
3. **Washing the hands to the elbows** — including elbows
4. **Wiping the head** — at least part of the head
5. **Washing the feet to the ankles** — including ankles
6. **Order (Tartib)** — performing the above in sequence

### Recommended Acts (Sunnan)

- Starting with "Bismillah"
- Washing hands three times at the beginning
- Rinsing the mouth (Madmadah)
- Sniffing water into the nose (Istinshaq)
- Wiping the ears
- Doing each part three times
- Using the right side first
- Not wasting water

### Nullifiers of Wudu

- Natural discharges (urine, stool, wind)
- Deep sleep (lying down)
- Loss of consciousness
- Touching the private parts directly
- Eating camel meat (according to some scholars)

### Common Mistakes in Wudu

- Not washing between the fingers
- Not ensuring water reaches the elbows
- Excessive water usage
- Speaking during wudu unnecessarily`,
        questions: [
          {
            questionText: "How many obligatory acts (Fara'id) are there in Wudu?",
            options: [
              { text: "6" },
              { text: "4" },
              { text: "8" },
              { text: "10" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which of the following NULLIFIES Wudu?",
            options: [
              { text: "Passing wind" },
              { text: "Coughing" },
              { text: "Reading Quran" },
              { text: "Eating" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Washing the feet to the ankles is:",
            options: [
              { text: "An obligatory act of Wudu" },
              { text: "A recommended act" },
              { text: "Optional" },
              { text: "Not part of Wudu" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which verse mentions the obligations of Wudu?",
            options: [
              { text: "Surah Al-Ma'idah, 5:6" },
              { text: "Surah Al-Fatihah, 1:1" },
              { text: "Surah Al-Baqarah, 2:43" },
              { text: "Surah An-Nisa, 4:103" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Purification — Ghusl & Tayammum",
        duration: 30,
        content: `## Ghusl: Full Body Purification

**Ghusl** is the act of washing the entire body to remove major ritual impurity (Janabah). It is required after sexual intercourse, ejaculation, and completion of menstruation or postpartum bleeding.

> "And if you are in a state of janabah, then purify yourselves." (Surah Al-Maidah, 5:6)

### How to Perform Ghusl

1. **Intention (Niyyah)** — silently intend to remove the state of Janabah
2. Wash the private parts
3. Perform a complete Wudu
4. Pour water over the head three times, ensuring it reaches the scalp
5. Pour water over the right shoulder three times, then the left
6. Ensure every part of the body is washed, including skin folds

### Tayammum: Dry Ablution

Tayammum is a substitute for Wudu or Ghusl using clean earth when water is unavailable or harmful.

Allah says: *"...and you find no water, then seek clean earth and wipe your faces and your hands with it"* (5:6)

### When Tayammum is Permitted

- No water available after genuinely searching
- Water is harmful due to illness or extreme cold
- Water is needed for drinking/survival

### How to Perform Tayammum

1. Intention
2. Strike clean earth with both hands
3. Wipe the face once
4. Strike earth again
5. Wipe the hands to the wrists`,
        questions: [
          {
            questionText: "What is the minimum requirement for Ghusl to be valid?",
            options: [
              { text: "Water must reach every part of the body with intention" },
              { text: "Pouring water three times is sufficient" },
              { text: "Just the head and shoulders" },
              { text: "A symbolic splash of water" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "When is Tayammum permitted?",
            options: [
              { text: "When water is unavailable or harmful" },
              { text: "When you are in a hurry" },
              { text: "When you feel tired" },
              { text: "Any time you prefer it over Wudu" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What nullifies Tayammum?",
            options: [
              { text: "Finding water or the excuse no longer applying" },
              { text: "Eating or drinking" },
              { text: "Speaking" },
              { text: "Walking" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Ghusl is required after which of the following?",
            options: [
              { text: "All of the above" },
              { text: "Sexual intercourse" },
              { text: "Ejaculation during sleep" },
              { text: "Completion of menstruation" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Prayer Times",
        duration: 25,
        content: `## The Five Prescribed Prayer Times

Allah has prescribed specific time windows for each of the five daily prayers. Praying within these times is an essential condition for the prayer's validity.

> "Indeed, prayer has been decreed upon the believers at fixed times." (Surah An-Nisa, 4:103)

### 1. Fajr (Dawn)

- **Begins:** True dawn (horizontal light across the horizon)
- **Ends:** Sunrise
- **Rak'ahs:** 2 Fard, 2 Sunnah
- **Recitation:** Aloud (Jahr)

### 2. Dhuhr (Noon)

- **Begins:** Sun passes its zenith and declines
- **Ends:** When shadow equals object's height
- **Rak'ahs:** 4 Fard, 4 Sunnah before, 2 after
- **Recitation:** Silent (Sirr)

### 3. Asr (Afternoon)

- **Begins:** When shadow equals object's height
- **Ends:** Sunset
- **Rak'ahs:** 4 Fard
- **Note:** Disliked to delay once the sun turns yellow

### 4. Maghrib (Sunset)

- **Begins:** Immediately after sunset
- **Ends:** When red twilight disappears
- **Rak'ahs:** 3 Fard, 2 Sunnah after
- **Note:** Shortest window — pray promptly

### 5. Isha (Night)

- **Begins:** When red twilight fades
- **Ends:** Midnight (middle of the night)
- **Rak'ahs:** 4 Fard, 2 Sunnah after, 3 Witr`,
        questions: [
          {
            questionText: "Which prayer has the shortest time window?",
            options: [
              { text: "Maghrib" },
              { text: "Fajr" },
              { text: "Asr" },
              { text: "Isha" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Fajr prayer ends at:",
            options: [
              { text: "Sunrise" },
              { text: "Midday" },
              { text: "When the sun turns yellow" },
              { text: "True dawn" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "In which prayers is the Quran recited aloud?",
            options: [
              { text: "Fajr, Maghrib, and Isha" },
              { text: "All five prayers" },
              { text: "Only Fajr" },
              { text: "Dhuhr and Asr" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How many rak'ahs are in Dhuhr prayer?",
            options: [
              { text: "4 Fard" },
              { text: "2 Fard" },
              { text: "3 Fard" },
              { text: "6 Fard" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Conditions & Pillars of Salah",
        duration: 40,
        content: `## Prerequisites of Prayer (Shurut)

Nine conditions must be fulfilled before prayer begins. These are prerequisites, not part of the prayer itself, but without them the prayer is invalid.

### The 9 Conditions

1. **Islam** — the person must be Muslim
2. **Sanity** — of sound mind
3. **Puberty** — reached the age of accountability
4. **Purity from Hadath** — free from minor/major impurities
5. **Purity from Najasah** — body, clothes, place must be clean
6. **Covering the Awrah** — men: navel to knees; women: all except face and hands
7. **Facing the Qiblah** — towards the Kaaba
8. **Correct Time** — within the designated window
9. **Intention (Niyyah)** — in the heart

### The 14 Pillars (Arkan) of Salah

Pillars are actions *within* the prayer. If any is missed intentionally or unintentionally, the prayer must be repeated.

1. Standing (Qiyam) if able
2. Opening Takbir (Allahu Akbar)
3. Reciting Surah Al-Fatihah in every rak'ah
4. Bowing (Ruku)
5. Rising from Ruku
6. Standing straight after Ruku
7. Prostration (Sujud) on seven body parts
8. Rising from Sujud
9. Sitting between the two prostrations
10. Tranquility (Tumaninah) in each position
11. Final Tashahhud
12. Sitting for the final Tashahhud
13. Sending blessings on the Prophet ﷺ
14. The final Salam`,
        questions: [
          {
            questionText: "How many conditions (Shurut) must be fulfilled before prayer?",
            options: [
              { text: "9" },
              { text: "14" },
              { text: "7" },
              { text: "5" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What happens if a pillar (Rukn) is missed in prayer?",
            options: [
              { text: "The prayer must be repeated" },
              { text: "Sujud al-Sahw can fix it" },
              { text: "Nothing — continue the prayer" },
              { text: "The prayer is still valid" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The awrah for men during prayer is:",
            options: [
              { text: "Navel to knees" },
              { text: "Shoulders to knees" },
              { text: "Whole body except head" },
              { text: "Chest to thighs" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Reciting Surah Al-Fatihah in every rak'ah is a:",
            options: [
              { text: "Pillar (Rukn)" },
              { text: "Condition (Shart)" },
              { text: "Wajib" },
              { text: "Sunnah" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Wajibat and Sunnan of Salah",
        duration: 30,
        content: `## Obligatory Acts (Wajibat) of Salah

**Wajibat** are required acts that are not pillars. If forgotten, they can be compensated by Sujud al-Sahw. Deliberate omission invalidates the prayer.

### The 7 Wajibat

1. All Takbirs except the opening Takbir
2. Saying "Sami Allahu liman hamidah" for the Imam/alone
3. Saying "Rabbana wa lakal hamd" upon rising from Ruku
4. Saying "Subhana Rabbiyal Azeem" once in Ruku
5. Saying "Subhana Rabbiyal A'la" once in Sujud
6. The first Tashahhud (in 3 or 4 rak'ah prayers)
7. Sitting for the first Tashahhud

### Recommended Acts (Sunnan)

Sunnan bring additional reward but omitting them does not require Sujud al-Sahw.

### Verbal Sunnan

- Opening supplication (Du'a al-Istiftah)
- Ta'awwudh (A'udhu billahi min ash-Shaytan ir-Rajeem)
- Saying Bismillah before Al-Fatihah
- Saying Ameen after Al-Fatihah
- Reciting additional Quranic verses after Al-Fatihah

### Physical Sunnan

- Raising the hands to shoulders/ears at Takbir
- Raising the hands when saying Allahu Akbar for Ruku
- Raising the hands when rising from Ruku
- Placing right hand over left on the chest
- Looking at the place of Sujud`,
        questions: [
          {
            questionText: "How many Wajibat are there in Salah?",
            options: [
              { text: "7" },
              { text: "14" },
              { text: "9" },
              { text: "5" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What compensates for forgetting a Wajib?",
            options: [
              { text: "Sujud al-Sahw" },
              { text: "Repeating the entire prayer" },
              { text: "Making Wudu again" },
              { text: "Nothing can compensate" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Saying Ameen after Al-Fatihah is a:",
            options: [
              { text: "Sunnah" },
              { text: "Wajib" },
              { text: "Pillar" },
              { text: "Condition" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "The first Tashahhud in a 4-rak'ah prayer is a:",
            options: [
              { text: "Wajib" },
              { text: "Sunnah" },
              { text: "Pillar" },
              { text: "Optional" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Invalidators of Salah",
        duration: 25,
        content: `## What Invalidates the Prayer?

Certain actions nullify the prayer and require it to be restarted. Some may be compensated by Sujud al-Sahw if done forgetfully.

> The Prophet ﷺ said: "The prayer of a person who does not have tranquility in his bowing and prostration is not sufficient."

### Major Invalidators

- **Speaking intentionally** — words not related to the prayer
- **Eating or drinking** deliberately
- **Laughing aloud** (smiling does not invalidate)
- **Uncovering the Awrah** intentionally or without immediately covering
- **Turning the chest away from the Qiblah** without excuse
- **Breaking Wudu** — passing wind, urine, etc.
- **Changing the intention** mid-prayer
- **Deliberately omitting a pillar**

### Actions that are Disliked (Makruh)

- Playing with clothes or body
- Looking around unnecessarily
- Holding back urine or stool
- Praying when food is ready and distracting
- Yawning without covering the mouth
- Rushed recitation without contemplation`,
        questions: [
          {
            questionText: "Which of the following invalidates the prayer?",
            options: [
              { text: "Speaking intentionally" },
              { text: "Smiling" },
              { text: "Sneezing" },
              { text: "Coughing lightly" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What is the ruling on laughing during prayer?",
            options: [
              { text: "Audible laughter invalidates; smiling does not" },
              { text: "Any laughter invalidates the prayer" },
              { text: "It is disliked but does not invalidate" },
              { text: "It is completely fine" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "If Wudu is broken during prayer, what should you do?",
            options: [
              { text: "Leave the prayer, make Wudu, and start over" },
              { text: "Continue the prayer and make Wudu after" },
              { text: "Make Wudu and continue from where you stopped" },
              { text: "Perform Tayammum and continue" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Looking around during prayer is:",
            options: [
              { text: "Disliked (Makruh)" },
              { text: "Invalidates the prayer" },
              { text: "Recommended" },
              { text: "Required" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Congregational Prayer",
        duration: 35,
        content: `## The Ruling on Congregational Prayer

Prayer in congregation (Salat al-Jama'ah) is highly emphasized. It is a strongly recommended Sunnah for men, and some scholars consider it obligatory.

> The Prophet ﷺ said: "Prayer in congregation is twenty-seven times superior to prayer offered individually." (Bukhari & Muslim)

### Rewards of Congregational Prayer

- 27 times more reward than praying alone
- Forgiveness of sins between prayers
- Community bonding and unity
- The Angels pray for you as long as you remain in your place

### Role of the Imam

The Imam should be the most knowledgeable in Quran and Fiqh of prayer. He should recite moderately — not too fast nor too slow. Followers should not precede the Imam in any action.

### Following the Imam

- Followers do not recite aloud during audible prayers
- Latecomers complete missed rak'ahs after the Imam's Salam
- There should be a gap of approximately one action behind the Imam`,
        questions: [
          {
            questionText: "How much more reward does congregational prayer have over praying alone?",
            options: [
              { text: "27 times" },
              { text: "10 times" },
              { text: "50 times" },
              { text: "100 times" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What should a latecomer do when joining the congregation?",
            options: [
              { text: "Join immediately and complete missed rak'ahs after Salam" },
              { text: "Wait for the next prayer" },
              { text: "Pray alone" },
              { text: "Make up the entire prayer later" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Who should lead the congregation as Imam?",
            options: [
              { text: "The most knowledgeable in Quran and Fiqh" },
              { text: "The oldest person present" },
              { text: "The wealthiest person" },
              { text: "Any volunteer regardless of knowledge" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Followers should ____ the Imam in actions.",
            options: [
              { text: "Not precede" },
              { text: "Precede" },
              { text: "Match exactly at the same time" },
              { text: "Ignore" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Makeup Prayers (Qada)",
        duration: 20,
        content: `## Making Up Missed Prayers

If a Muslim misses a prayer for a valid reason (sleep, forgetfulness), they must make it up (Qada) as soon as they remember.

> The Prophet ﷺ said: "Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it." (Bukhari & Muslim)

### When Qada is Required

- Sleeping through the prayer time
- Forgetting to pray
- Unconsciousness or coma (most schools)

### When Qada is NOT Required

- Menstruation or postpartum bleeding
- Mental illness during the period of insanity
- Before puberty

### How to Make Up Missed Prayers

- Pray the missed prayer exactly as you would have — same rak'ahs
- Intend Qada in your heart
- Multiple missed prayers can be made up in sequence
- Qada can be offered at any time except the three forbidden times (sunrise, zenith, sunset)
- Pray Qada as soon as possible without unnecessary delay`,
        questions: [
          {
            questionText: "What should you do if you miss a prayer due to sleep?",
            options: [
              { text: "Pray it as soon as you wake up" },
              { text: "Pray it at the next prayer time" },
              { text: "It is excused and no makeup is needed" },
              { text: "Give charity instead" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "Which group is exempt from making up missed prayers?",
            options: [
              { text: "Menstruating women" },
              { text: "Travelers" },
              { text: "Sick people" },
              { text: "Busy professionals" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "At what times is it forbidden to pray Qada?",
            options: [
              { text: "Sunrise, zenith, and sunset" },
              { text: "Only at midnight" },
              { text: "After Isha until Fajr" },
              { text: "There are no forbidden times" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "How should multiple missed prayers be made up?",
            options: [
              { text: "In sequence, one after another" },
              { text: "All at once in a single prayer" },
              { text: "They cannot be made up" },
              { text: "Only the most recent one can be made up" },
            ],
            correctAnswer: "0",
          },
        ],
      },
      {
        title: "Sujud al-Sahw (Prostration of Forgetfulness)",
        duration: 25,
        content: `## Sujud al-Sahw: Correcting Forgetfulness in Prayer

Allah, in His mercy, prescribed Sujud al-Sahw (prostration of forgetfulness) to rectify errors made during prayer.

### When is Sujud al-Sahw Required?

1. **Addition** — adding an extra action (e.g., praying 5 rak'ahs instead of 4)
2. **Omission** — omitting a Wajib (e.g., forgetting the first Tashahhud)
3. **Doubt** — uncertainty about the number of rak'ahs completed

### How to Perform Sujud al-Sahw

- **Before Salam** — if you omitted a Wajib, perform two extra prostrations before Salam
- **After Salam** — if you added something, perform after Salam
- **If in doubt** — act upon the lesser number, complete the prayer, then perform Sujud al-Sahw before Salam

### Important Principles

- If you consistently have doubts (Waswas), ignore the doubt and act upon the majority
- If you remember a missed action while still in the same position, perform it immediately
- If you remember after moving to the next position, continue and perform Sujud al-Sahw`,
        questions: [
          {
            questionText: "In which scenarios is Sujud al-Sahw performed?",
            options: [
              { text: "Addition, omission, or doubt in prayer" },
              { text: "Only when adding extra rak'ahs" },
              { text: "Only when missing Wudu" },
              { text: "After every prayer by default" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "If you are uncertain about the number of rak'ahs, you should:",
            options: [
              { text: "Act upon the lesser number and perform Sujud al-Sahw" },
              { text: "Act upon the greater number" },
              { text: "Start the prayer over" },
              { text: "Ignore the doubt" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "When is Sujud al-Sahw performed before Salam?",
            options: [
              { text: "When a Wajib has been omitted" },
              { text: "When an extra rak'ah has been added" },
              { text: "When the prayer was interrupted" },
              { text: "It is always performed before Salam" },
            ],
            correctAnswer: "0",
          },
          {
            questionText: "What should a person who constantly doubts (Waswas) do?",
            options: [
              { text: "Ignore the doubt and act upon the majority" },
              { text: "Always repeat the prayer" },
              { text: "Perform Sujud al-Sahw after every prayer" },
              { text: "Stop praying altogether until certain" },
            ],
            correctAnswer: "0",
          },
        ],
      },
    ],
  },
];
