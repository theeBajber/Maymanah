export const lessonsContent: Record<string, Array<{
  title: string;
  content: string;
  videoUrl?: string;
  quiz: Array<{ question: string; options: Array<{ text: string; correct: boolean }> }>;
}>> = {
  'tajweed-foundations': [
    {
      title: 'Introduction to Tajweed',
      videoUrl: 'https://www.youtube.com/embed/mCjcofctbHg',
      content: `
<h2>What is Tajweed?</h2>
<p>Tajweed (تجويد) literally means "to make better" or "to improve." In the context of Quranic recitation, it refers to the set of rules governing the correct pronunciation of letters and the proper application of recitation rules.</p>

<h3>The Ruling of Tajweed</h3>
<p>Scholars agree that applying Tajweed is <strong>fard ‘ayn</strong> (an individual obligation) for every Muslim who recites the Quran. The evidence comes from Allah's command:</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"…And recite the Quran with measured recitation." (Surah Al-Muzzammil, 73:4)
</blockquote>

<h3>Why Learn Tajweed?</h3>
<ul>
  <li><strong>Preserve the meaning</strong> — Incorrect pronunciation can change the meaning of words</li>
  <li><strong>Beautify your recitation</strong> — The Prophet ﷺ said: "Adorn the Quran with your voices"</li>
  <li><strong>Earn rewards</strong> — Every letter recited brings 10 rewards</li>
</ul>

<h3>The Two Branches of Tajweed</h3>
<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; text-align:left; border:1px solid var(--border);">Ilm at-Tajweed (Theory)</th>
    <th style="padding:8px; text-align:left; border:1px solid var(--border);">Application (Practice)</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Knowing the rules</td>
    <td style="padding:8px; border:1px solid var(--border);">Reciting with proper pronunciation</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Understanding Makharij</td>
    <td style="padding:8px; border:1px solid var(--border);">Producing letters from correct articulation points</td>
  </tr>
</table>

<h3>Key Arabic Letters to Practice</h3>
<p style="font-size: 1.4rem; line-height: 2; direction: rtl; text-align: center;">
  أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ء ي
</p>

<h3>Listen & Repeat</h3>
<p>Find a recording of Surah Al-Fatihah by a qualified Qari (e.g., Sheikh Al-Husary or Sheikh Sudais). Listen carefully and try to imitate the pronunciation of each letter.</p>

<hr />
<h3>Key Takeaways</h3>
<ol>
  <li>Tajweed means "improvement" — it is the science of correct Quranic recitation</li>
  <li>It is obligatory for every Muslim reciting the Quran</li>
  <li>There are two aspects: theoretical knowledge and practical application</li>
  <li>The Arabic alphabet has 28 letters, some with unique articulation points</li>
</ol>
`,
      quiz: [
        {
          question: 'What does the word "Tajweed" (تجويد) literally mean?',
          options: [
            { text: 'To make better / to improve', correct: true },
            { text: 'To memorize', correct: false },
            { text: 'To recite quickly', correct: false },
            { text: 'To understand', correct: false },
          ],
        },
        {
          question: 'The ruling of Tajweed for every Muslim reciting the Quran is:',
          options: [
            { text: 'Fard \‘Ayn (individual obligation)', correct: true },
            { text: 'Fard Kifayah (communal obligation)', correct: false },
            { text: 'Sunnah (recommended)', correct: false },
            { text: 'Mubah (permissible)', correct: false },
          ],
        },
        {
          question: 'Which verse commands us to recite the Quran with measured recitation?',
          options: [
            { text: 'Surah Al-Muzzammil, 73:4', correct: true },
            { text: 'Surah Al-Fatihah, 1:1', correct: false },
            { text: 'Surah Al-Baqarah, 2:255', correct: false },
            { text: 'Surah Al-Ikhlas, 112:1', correct: false },
          ],
        },
        {
          question: 'How many letters are in the Arabic alphabet?',
          options: [
            { text: '28', correct: true },
            { text: '26', correct: false },
            { text: '30', correct: false },
            { text: '24', correct: false },
          ],
        },
        {
          question: 'What are the two branches of Tajweed?',
          options: [
            { text: 'Theory (Ilm) and Practice (Application)', correct: true },
            { text: 'Reading and Writing', correct: false },
            { text: 'Memorization and Revision', correct: false },
            { text: 'Tafsir and Fiqh', correct: false },
          ],
        },
      ],
    },
    {
      title: "Makharij al-Huruf — Part 1",
      videoUrl: 'https://www.youtube.com/embed/KirU7DexAiI',
      content: `
<h2>Articulation Points — The Throat Letters</h2>
<p>Every Arabic letter has a specific <strong>makhraj</strong> (articulation point) — the place in the mouth or throat where it is produced. Learning Makharij is the foundation of correct Tajweed.</p>

<h3>The Five Main Regions</h3>
<ol>
  <li><strong>Al-Jawf</strong> (الجوف) — The empty space in the mouth and throat</li>
  <li><strong>Al-Halq</strong> (الحلق) — The throat (3 points)</li>
  <li><strong>Al-Lisaan</strong> (اللسان) — The tongue (10 points)</li>
  <li><strong>Ash-Shafataan</strong> (الشفتان) — The lips (2 points)</li>
  <li><strong>Al-Khayshoom</strong> (الخيشوم) — The nasal cavity</li>
</ol>

<h3>1. Throat Letters (Al-Halq)</h3>
<p>The throat is divided into three articulation points:</p>

<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Point</th>
    <th style="padding:8px; border:1px solid var(--border);">Location</th>
    <th style="padding:8px; border:1px solid var(--border);">Letters</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Aqsal-Halq (أقصى الحلق)</td>
    <td style="padding:8px; border:1px solid var(--border);">Deepest part of the throat (near the chest)</td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.5rem;">ء  ه</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Wasat al-Halq (وسط الحلق)</td>
    <td style="padding:8px; border:1px solid var(--border);">Middle of the throat</td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.5rem;">ع  ح</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Adnal-Halq (أدنى الحلق)</td>
    <td style="padding:8px; border:1px solid var(--border);">Nearest part of the throat (near the mouth)</td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.5rem;">غ  خ</td>
  </tr>
</table>

<h3>Pronunciation Guide</h3>
<ul>
  <li><strong>ء (Hamzah)</strong> — A sharp glottal stop, like the "t" in "bottle" (British English)</li>
  <li><strong>ه (Ha)</strong> — A soft exhale from the deepest throat</li>
  <li><strong>ع (‘Ayn)</strong> — A strong, deep sound from the middle throat (no English equivalent)</li>
  <li><strong>ح (Hha)</strong> — A sharp exhale from the middle throat, like blowing on glasses to clean them</li>
  <li><strong>غ (Ghayn)</strong> — A rolling sound from the nearest throat, like a French "r"</li>
  <li><strong>خ (Kha)</strong> — A rough, scraping sound from the nearest throat, like the "ch" in Scottish "loch"</li>
</ul>

<h3>Practice Exercise</h3>
<p style="direction: rtl; font-size: 1.6rem; text-align: center;">
  أَ - هَ - عَ - حَ - غَ - خَ
</p>
<p>Repeat each letter slowly, focusing on where it feels like it's produced in your throat.</p>
`,
      quiz: [
        {
          question: 'How many main articulation point regions are there for Arabic letters?',
          options: [
            { text: '5', correct: true },
            { text: '3', correct: false },
            { text: '7', correct: false },
            { text: '10', correct: false },
          ],
        },
        {
          question: 'Which letters are pronounced from the deepest part of the throat (Aqsal-Halq)?',
          options: [
            { text: 'ء (Hamzah) and ه (Ha)', correct: true },
            { text: 'ع (‘Ayn) and ح (Hha)', correct: false },
            { text: 'غ (Ghayn) and خ (Kha)', correct: false },
            { text: 'ق (Qaf) and ك (Kaf)', correct: false },
          ],
        },
        {
          question: 'The letter خ (Kha) is pronounced from which part of the throat?',
          options: [
            { text: 'Adnal-Halq — nearest part of the throat', correct: true },
            { text: 'Aqsal-Halq — deepest part of the throat', correct: false },
            { text: 'Wasat al-Halq — middle of the throat', correct: false },
            { text: 'Al-Jawf — the empty space in the mouth', correct: false },
          ],
        },
        {
          question: 'Which letter is described as having "no English equivalent" and requires a strong, deep sound?',
          options: [
            { text: 'ع (\‘Ayn)', correct: true },
            { text: 'ه (Ha)', correct: false },
            { text: 'ء (Hamzah)', correct: false },
            { text: 'غ (Ghayn)', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Makharij al-Huruf — Part 2',
      videoUrl: 'https://www.youtube.com/embed/CtKHyq7aNWI',
      content: `
<h2>Articulation Points — Tongue, Lips, and Nasal Cavity</h2>

<h3>2. Tongue Letters (Al-Lisaan)</h3>
<p>The tongue has <strong>10 articulation points</strong> producing <strong>18 letters</strong>. These are divided among different parts of the tongue:</p>

<h4>The Deepest Part of the Tongue (Aqsal-Lisaan)</h4>
<p>Touching the upper palate near the throat:</p>
<ul>
  <li><strong>ق (Qaf)</strong> — Deepest part of tongue touches the upper palate</li>
  <li><strong>ك (Kaf)</strong> — Slightly forward of Qaf's position</li>
</ul>

<h4>Middle of the Tongue (Wasat al-Lisaan)</h4>
<p>The middle of the tongue touches the middle of the upper palate:</p>
<ul>
  <li><strong>ج (Jeem)</strong> — جـِ</li>
  <li><strong>ش (Sheen)</strong> — شـِ</li>
  <li><strong>ي (Ya)</strong> — يـِ (when used as a consonant)</li>
</ul>

<h4>Side of the Tongue (Haafat al-Lisaan)</h4>
<ul>
  <li><strong>ض (Daud)</strong> — Pronounced from the side(s) of the tongue touching the upper molars. The most difficult Arabic letter for non-native speakers!</li>
</ul>

<h4>Tip of the Tongue</h4>
<p>Various positions produce the remaining letters: ل, ن, ر, د, ت, ط, ص, ز, س, ظ, ث, ذ, and more.</p>

<h3>3. Lip Letters (Ash-Shafataan)</h3>
<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Letter</th>
    <th style="padding:8px; border:1px solid var(--border);">How It Is Produced</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.2rem;">ف (Fa)</td>
    <td style="padding:8px; border:1px solid var(--border);">Inner part of the bottom lip touches the edge of the upper front teeth</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.2rem;">ب (Ba)</td>
    <td style="padding:8px; border:1px solid var(--border);">Two lips close together with pressure</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.2rem;">م (Meem)</td>
    <td style="padding:8px; border:1px solid var(--border);">Two lips close together (lighter than Ba)</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border); text-align:center; font-size:1.2rem;">و (Waw)</td>
    <td style="padding:8px; border:1px solid var(--border);">Lips rounded and forward, like English "w"</td>
  </tr>
</table>

<h3>4. Nasal Cavity (Al-Khayshoom)</h3>
<p>The <strong>ghunnah</strong> (nasalization) is produced from the nasal cavity. This occurs for:</p>
<ul>
  <li>Letters <strong>م</strong> (Meem) and <strong>ن</strong> (Noon) when they have shaddah</li>
  <li>Ikhfaa, Idghaam with Ghunnah</li>
</ul>

<h3>Practice: Complete the Letters Table</h3>
<p style="direction: rtl; font-size: 1.4rem; line-height: 2; text-align: center;">
  ق ك ج ش ي ض ل ن ر د ت ط ص ز س ظ ث ذ
</p>
<p>Try to identify which region of the tongue produces each letter.</p>
`,
      quiz: [
        {
          question: 'The letter ض (Daud) is pronounced from which part of the tongue?',
          options: [
            { text: 'The side(s) of the tongue touching the upper molars', correct: true },
            { text: 'The tip of the tongue', correct: false },
            { text: 'The deepest part of the tongue', correct: false },
            { text: 'The middle of the tongue', correct: false },
          ],
        },
        {
          question: 'How many articulation points does the tongue have?',
          options: [
            { text: '10', correct: true },
            { text: '5', correct: false },
            { text: '2', correct: false },
            { text: '18', correct: false },
          ],
        },
        {
          question: 'The letter ف (Fa) is produced by:',
          options: [
            { text: 'Inner bottom lip touching the edge of upper front teeth', correct: true },
            { text: 'Two lips closing together', correct: false },
            { text: 'The tip of the tongue', correct: false },
            { text: 'The nasal cavity', correct: false },
          ],
        },
        {
          question: 'What is "Ghunnah"?',
          options: [
            { text: 'Nasalization produced from the nasal cavity', correct: true },
            { text: 'A heavy letter', correct: false },
            { text: 'An articulation point in the throat', correct: false },
            { text: 'A type of Madd', correct: false },
          ],
        },
        {
          question: 'Which of the following is NOT a lip letter?',
          options: [
            { text: 'ق (Qaf)', correct: true },
            { text: 'ف (Fa)', correct: false },
            { text: 'ب (Ba)', correct: false },
            { text: 'م (Meem)', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Sifaat al-Huruf',
      content: `
<h2>Characteristics of Letters (Sifaat al-Huruf)</h2>
<p>Every Arabic letter has <strong>permanent characteristics</strong> (Sifaat Lazimah) that distinguish it from other letters that share the same articulation point. Understanding these helps you produce each letter correctly.</p>

<h3>Opposing Characteristics</h3>
<p>Most Sifaat come in pairs:</p>

<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Characteristic</th>
    <th style="padding:8px; border:1px solid var(--border);">Meaning</th>
    <th style="padding:8px; border:1px solid var(--border);">Opposite</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Jahr</strong> (الجهر)</td>
    <td style="padding:8px; border:1px solid var(--border);">Voicebox engaged — vibration felt</td>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Hams</strong> (الهمس) — Whisper, no vibration</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Ash-Shiddah</strong> (الشدة)</td>
    <td style="padding:8px; border:1px solid var(--border);">Strong — airflow blocked completely</td>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Ar-Rakhawah</strong> (الرخاوة) — Soft, airflow continues</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Istifaal</strong> (الاستفال)</td>
    <td style="padding:8px; border:1px solid var(--border);">Flat tongue, light sound</td>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Isti'laa</strong> (الاستعلاء) — Raised tongue, heavy sound</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Infitaah</strong> (الانفتاح)</td>
    <td style="padding:8px; border:1px solid var(--border);">Tongue separates from the palate</td>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Itbaaq</strong> (الإطباق) — Tongue adheres to the palate</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Idhlaaq</strong> (الإذلاق)</td>
    <td style="padding:8px; border:1px solid var(--border);">Pronounced quickly with tongue tip/lips</td>
    <td style="padding:8px; border:1px solid var(--border);"><strong>Al-Ismaat</strong> (الإصمات) — Heavy, slower pronunciation</td>
  </tr>
</table>

<h3>The "Heavy" Letters (Tafkheem)</h3>
<p>Seven letters are always heavy (مفخمة):</p>
<p style="direction: rtl; font-size: 1.8rem; text-align: center; letter-spacing: 4px;">
  خ ص ض غ ط ق ظ
</p>
<p>A mnemonic: <strong>"خص ضغط قظ"</strong></p>
<p>When pronouncing these, the tongue is raised toward the upper palate, giving the letter a "full" or "deep" quality.</p>

<h3>The "Light" Letters (Tarqeeq)</h3>
<p>All other letters are light (مرققة) — the tongue remains flat and the sound is thin.</p>

<h3>Practice Exercise</h3>
<p>Compare the following pairs, feeling the difference between heavy and light:</p>
<p style="direction: rtl; font-size: 1.4rem; text-align: center;">
  س (light) vs ص (heavy) — ت (light) vs ط (heavy) — ذ (light) vs ظ (heavy)
</p>
`,
      quiz: [
        {
          question: 'How many "heavy" letters (Tafkheem) are there?',
          options: [
            { text: '7', correct: true },
            { text: '5', correct: false },
            { text: '10', correct: false },
            { text: '28', correct: false },
          ],
        },
        {
          question: 'The characteristic Al-Jahr means:',
          options: [
            { text: 'Voicebox is engaged, vibration is felt', correct: true },
            { text: 'Airflow is blocked completely', correct: false },
            { text: 'Airflow continues without interruption', correct: false },
            { text: 'The sound is whispered', correct: false },
          ],
        },
        {
          question: 'Which of these letters is a "heavy" letter?',
          options: [
            { text: 'ص (Saad)', correct: true },
            { text: 'س (Seen)', correct: false },
            { text: 'د (Dal)', correct: false },
            { text: 'ت (Ta)', correct: false },
          ],
        },
        {
          question: 'What happens to the tongue when pronouncing heavy letters?',
          options: [
            { text: 'The tongue is raised toward the upper palate', correct: true },
            { text: 'The tongue lies flat', correct: false },
            { text: 'The tongue curls backward', correct: false },
            { text: 'The tongue touches the lower teeth', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Noon Sakinah & Tanween',
      videoUrl: 'https://www.youtube.com/embed/mDxEV5IINMg',
      content: `
<h2>The Four Rules of Noon Sakinah and Tanween</h2>
<p>When a <strong>Noon Sakinah</strong> (ن with sukoon) or <strong>Tanween</strong> (ً ٍ ٌ) is followed by one of the 28 Arabic letters, one of four rules applies:</p>

<h3>1. Al-Ith-haar (الإظهار) — Clear Pronunciation</h3>
<p><strong>Rule:</strong> The Noon Sakinah/Tanween is pronounced clearly without ghunnah.</p>
<p><strong>Letters:</strong> Throat letters — ء ه ع ح غ خ</p>
<p><strong>Example:</strong> مَنْ آمَنَ (man aaman) — the ن is clear</p>

<h3>2. Al-Idghaam (الإدغام) — Merging</h3>
<p><strong>Rule:</strong> The Noon Sakinah/Tanween is merged into the following letter. It comes in two types:</p>

<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Type</th>
    <th style="padding:8px; border:1px solid var(--border);">Letters</th>
    <th style="padding:8px; border:1px solid var(--border);">With Ghunnah?</th>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Idghaam with Ghunnah</td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center;">ي ن م و</td>
    <td style="padding:8px; border:1px solid var(--border);">Yes (2 counts)</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid var(--border);">Idghaam without Ghunnah</td>
    <td style="padding:8px; border:1px solid var(--border); text-align:center;">ل ر</td>
    <td style="padding:8px; border:1px solid var(--border);">No</td>
  </tr>
</table>

<p><strong>Memory aid for Idghaam with Ghunnah:</strong> <span style="direction:rtl; display:inline-block;">ينمو</span> (Yanmu — "it grows")</p>

<h3>3. Al-Iqlaab (الإقلاب) — Conversion</h3>
<p><strong>Rule:</strong> The Noon Sakinah/Tanween is converted to a <strong>Meem (م)</strong> with ghunnah.</p>
<p><strong>Letter:</strong> ب (Ba) only</p>
<p><strong>Example:</strong> مِنْ بَعْدِ (mim ba'di) — pronounced as if written مِم بَعْدِ</p>

<h3>4. Al-Ikhfaa (الإخفاء) — Concealment</h3>
<p><strong>Rule:</strong> The Noon Sakinah/Tanween is pronounced with ghunnah but not fully clear nor merged.</p>
<p><strong>Letters:</strong> The remaining 15 letters (all except the ones above)</p>
<p><strong>Example:</strong> مِنْ شَيْءٍ (min shay'in) — soft nasalization</p>

<h3>Summary Table</h3>
<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Rule</th>
    <th style="padding:8px; border:1px solid var(--border);">Letters</th>
    <th style="padding:8px; border:1px solid var(--border);">Count</th>
  </tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Ith-haar</td><td style="padding:8px; border:1px solid var(--border);">ء ه ع ح غ خ</td><td style="padding:8px; border:1px solid var(--border);">6</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Idghaam</td><td style="padding:8px; border:1px solid var(--border);">ي ن م و ل ر</td><td style="padding:8px; border:1px solid var(--border);">6</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Iqlaab</td><td style="padding:8px; border:1px solid var(--border);">ب</td><td style="padding:8px; border:1px solid var(--border);">1</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Ikhfaa</td><td style="padding:8px; border:1px solid var(--border);">ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك</td><td style="padding:8px; border:1px solid var(--border);">15</td></tr>
</table>
<p><strong>Total: 28 letters</strong></p>
`,
      quiz: [
        {
          question: 'How many rules apply to Noon Sakinah and Tanween?',
          options: [
            { text: '4', correct: true },
            { text: '3', correct: false },
            { text: '5', correct: false },
            { text: '2', correct: false },
          ],
        },
        {
          question: 'Al-Iqlaab applies when Noon Sakinah is followed by which letter?',
          options: [
            { text: 'ب (Ba)', correct: true },
            { text: 'م (Meem)', correct: false },
            { text: 'ل (Lam)', correct: false },
            { text: 'ي (Ya)', correct: false },
          ],
        },
        {
          question: 'Al-Ith-haar applies before which group of letters?',
          options: [
            { text: 'Throat letters: ء ه ع ح غ خ', correct: true },
            { text: 'Lip letters: ف ب م و', correct: false },
            { text: 'Tongue tip letters: ت ث د ذ', correct: false },
            { text: 'Heavy letters: خ ص ض غ ط ق ظ', correct: false },
          ],
        },
        {
          question: 'What happens to the Noon in Al-Iqlaab?',
          options: [
            { text: 'It is converted to a Meem (م) with ghunnah', correct: true },
            { text: 'It is pronounced clearly', correct: false },
            { text: 'It is merged into the next letter', correct: false },
            { text: 'It is completely silent', correct: false },
          ],
        },
        {
          question: 'How many letters trigger Al-Ikhfaa?',
          options: [
            { text: '15', correct: true },
            { text: '6', correct: false },
            { text: '28', correct: false },
            { text: '1', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Meem Sakinah',
      content: `
<h2>The Rules of Meem Sakinah</h2>
<p>When a <strong>Meem Sakinah</strong> (م with sukoon) is followed by any Arabic letter, one of three rules applies:</p>

<h3>1. Al-Ikhfaa Ash-Shafawi (الإخفاء الشفوي) — Labial Concealment</h3>
<p><strong>When:</strong> Meem Sakinah is followed by <strong>ب (Ba)</strong></p>
<p>The Meem is pronounced with ghunnah but not fully clear, preparing the lips for Ba.</p>
<p><strong>Example:</strong> تَرْمِيهِم بِحِجَارَةٍ — The ب is pronounced with the lips ready for the next letter</p>

<h3>2. Al-Idghaam Ash-Shafawi (الإدغام الشفوي) — Labial Merging</h3>
<p><strong>When:</strong> Meem Sakinah is followed by another <strong>م (Meem)</strong></p>
<p>The first Meem merges into the second with ghunnah (2 counts).</p>
<p><strong>Example:</strong> لَهُمْ مَا (lahum maa) — the first م merges into the second</p>

<h3>3. Al-Ith-haar Ash-Shafawi (الإظهار الشفوي) — Labial Clarity</h3>
<p><strong>When:</strong> Meem Sakinah is followed by any letter <strong>other than</strong> ب or م</p>
<p>The Meem is pronounced clearly without ghunnah.</p>
<p><strong>Example:</strong> أَنْعَمْتَ عَلَيْهِمْ غَيْرِ — the م is clear before غ</p>

<h3>Summary</h3>
<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Rule</th>
    <th style="padding:8px; border:1px solid var(--border);">Following Letter</th>
    <th style="padding:8px; border:1px solid var(--border);">Pronunciation</th>
  </tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Ikhfaa Shafawi</td><td style="padding:8px; border:1px solid var(--border);">ب</td><td style="padding:8px; border:1px solid var(--border);">Ghunnah, concealed</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Idghaam Shafawi</td><td style="padding:8px; border:1px solid var(--border);">م</td><td style="padding:8px; border:1px solid var(--border);">Merged with ghunnah</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Ith-haar Shafawi</td><td style="padding:8px; border:1px solid var(--border);">All other letters</td><td style="padding:8px; border:1px solid var(--border);">Clear, no ghunnah</td></tr>
</table>
`,
      quiz: [
        {
          question: 'How many rules apply to Meem Sakinah?',
          options: [
            { text: '3', correct: true },
            { text: '4', correct: false },
            { text: '2', correct: false },
            { text: '1', correct: false },
          ],
        },
        {
          question: 'Al-Ikhfaa Ash-Shafawi occurs when Meem Sakinah is followed by:',
          options: [
            { text: 'ب (Ba)', correct: true },
            { text: 'م (Meem)', correct: false },
            { text: 'ف (Fa)', correct: false },
            { text: 'و (Waw)', correct: false },
          ],
        },
        {
          question: 'When two Meems meet (first with sukoon), which rule applies?',
          options: [
            { text: 'Idghaam Shafawi — the first merges into the second with ghunnah', correct: true },
            { text: 'Ikhfaa Shafawi — concealed pronunciation', correct: false },
            { text: 'Ith-haar Shafawi — clear pronunciation', correct: false },
            { text: 'Iqlaab — conversion to another letter', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Madd Rules — Introduction',
      content: `
<h2>Introduction to Madd (مد)</h2>
<p><strong>Madd</strong> literally means "to lengthen" or "to extend." In Tajweed, it refers to lengthening the pronunciation of a vowel letter beyond its natural duration.</p>

<h3>The Three Madd Letters (Huroof al-Madd)</h3>
<p>There are three letters that can be lengthened:</p>
<ul>
  <li><strong>ا</strong> (Alif) — preceded by a fatha (ـَ)</li>
  <li><strong>و</strong> (Waw Saakinah) — preceded by a dammah (ـُ)</li>
  <li><strong>ي</strong> (Ya Saakinah) — preceded by a kasrah (ـِ)</li>
</ul>

<h3>Natural Madd (Madd Asli)</h3>
<p>The basic, natural lengthening of <strong>2 counts</strong> (harakat). This occurs when a madd letter is <strong>not followed</strong> by a hamzah (ء) or a sukoon (ْ).</p>
<p><strong>Examples:</strong> قَالَ (qaala), يَقُولُ (yaqoolu), رَحِيمٍ (raheem)</p>

<h3>Causes of Extended Madd</h3>
<p>Two things can cause the Madd to be extended beyond 2 counts:</p>
<ol>
  <li><strong>Hamzah</strong> (ء) — either before or after the madd letter</li>
  <li><strong>Sukoon</strong> (ْ) — stillness on the letter after the madd letter</li>
</ol>

<h3>Madd Lengths</h3>
<table style="width:100%; border-collapse:collapse;">
  <tr style="background: var(--primary-muted);">
    <th style="padding:8px; border:1px solid var(--border);">Length</th>
    <th style="padding:8px; border:1px solid var(--border);">Counts</th>
    <th style="padding:8px; border:1px solid var(--border);">Where Used</th>
  </tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Natural (Asli)</td><td style="padding:8px; border:1px solid var(--border);">2</td><td style="padding:8px; border:1px solid var(--border);">All basic madds</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Permissible (Jaiz)</td><td style="padding:8px; border:1px solid var(--border);">2, 4, or 5</td><td style="padding:8px; border:1px solid var(--border);">Madd Jaiz Munfasil</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Necessary (Wajib)</td><td style="padding:8px; border:1px solid var(--border);">4 or 5</td><td style="padding:8px; border:1px solid var(--border);">Madd Wajib Muttasil</td></tr>
  <tr><td style="padding:8px; border:1px solid var(--border);">Lazim (Compulsory)</td><td style="padding:8px; border:1px solid var(--border);">6</td><td style="padding:8px; border:1px solid var(--border);">Madd Lazim — always 6 counts</td></tr>
</table>

<h3>Practice</h3>
<p>Read the following words and identify the madd letters:</p>
<p style="direction: rtl; font-size: 1.4rem;">الرَّحْمَٰنِ الرَّحِيمِ</p>
<p>Hint: Look for ا, و preceded by dammah, and ي preceded by kasrah.</p>
`,
      quiz: [
        {
          question: 'How many counts does Natural Madd (Madd Asli) have?',
          options: [
            { text: '2 counts', correct: true },
            { text: '4 counts', correct: false },
            { text: '6 counts', correct: false },
            { text: '1 count', correct: false },
          ],
        },
        {
          question: 'What are the three madd letters?',
          options: [
            { text: 'ا (Alif), و (Waw), ي (Ya)', correct: true },
            { text: 'ا (Alif), ب (Ba), ت (Ta)', correct: false },
            { text: 'م (Meem), ن (Noon), و (Waw)', correct: false },
            { text: 'ق (Qaf), ك (Kaf), ل (Lam)', correct: false },
          ],
        },
        {
          question: 'What causes a Madd to be extended beyond 2 counts?',
          options: [
            { text: 'Hamzah (ء) or Sukoon (ْ)', correct: true },
            { text: 'Shaddah (ّ)', correct: false },
            { text: 'Fatha (َ)', correct: false },
            { text: 'Tanween (ً)', correct: false },
          ],
        },
        {
          question: 'Madd Lazim is always lengthened to how many counts?',
          options: [
            { text: '6 counts', correct: true },
            { text: '2 counts', correct: false },
            { text: '4 counts', correct: false },
            { text: '8 counts', correct: false },
          ],
        },
      ],
    },
  ],
  'fiqh-of-salah': [
    {
      title: 'Importance & Ruling of Salah',
      videoUrl: 'https://www.youtube.com/embed/PCzJ7r8VwLs',
      content: `
<h2>The Importance of Salah in Islam</h2>
<p>Salah (prayer) is the second pillar of Islam and the most important act of worship after belief in Allah. It is a direct connection between the servant and their Lord, performed five times daily.</p>

<h3>Evidence from the Quran</h3>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"Indeed, prayer has been enjoined upon the believers at fixed times." (Surah An-Nisa, 4:103)
</blockquote>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"And establish prayer and give zakah and bow with those who bow [in worship]." (Surah Al-Baqarah, 2:43)
</blockquote>

<h3>Evidence from the Sunnah</h3>
<p>The Prophet ﷺ said:</p>
<blockquote style="border-left: 4px solid var(--secondary); padding-left: 16px; margin: 16px 0;">
"The covenant between us and them is prayer; whoever abandons it has committed disbelief." (Sunan At-Tirmidhi)
</blockquote>

<h3>The Five Daily Prayers</h3>
<ul>
  <li><strong>Fajr</strong> (الفجر) — 2 rak'ahs, before sunrise</li>
  <li><strong>Dhuhr</strong> (الظهر) — 4 rak'ahs, after noon</li>
  <li><strong>Asr</strong> (العصر) — 4 rak'ahs, afternoon</li>
  <li><strong>Maghrib</strong> (المغرب) — 3 rak'ahs, after sunset</li>
  <li><strong>Isha</strong> (العشاء) — 4 rak'ahs, night</li>
</ul>

<h3>Consequences of Abandoning Salah</h3>
<ul>
  <li>Spiritual disconnection from Allah</li>
  <li>Loss of blessings in time and life</li>
  <li>Major sin with severe consequences on the Day of Judgment</li>
</ul>

<h3>Benefits of Praying on Time</h3>
<ul>
  <li>Purifies the soul and prevents sin</li>
  <li>Brings peace and tranquility to the heart</li>
  <li>Teaches discipline and time management</li>
</ul>
`,
      quiz: [
        {
          question: 'Salah is the _____ pillar of Islam.',
          options: [
            { text: 'Second', correct: true },
            { text: 'First', correct: false },
            { text: 'Third', correct: false },
            { text: 'Fourth', correct: false },
          ],
        },
        {
          question: 'How many daily prayers are obligatory?',
          options: [
            { text: '5', correct: true },
            { text: '3', correct: false },
            { text: '7', correct: false },
            { text: '4', correct: false },
          ],
        },
        {
          question: 'Which prayer has only 2 rak\'ahs?',
          options: [
            { text: 'Fajr', correct: true },
            { text: 'Dhuhr', correct: false },
            { text: 'Maghrib', correct: false },
            { text: 'Isha', correct: false },
          ],
        },
        {
          question: 'What did the Prophet ﷺ say about abandoning prayer?',
          options: [
            { text: 'It is the line between faith and disbelief', correct: true },
            { text: 'It is a minor sin', correct: false },
            { text: 'It is permissible under some circumstances', correct: false },
            { text: 'It can be made up anytime without issue', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Purification — Wudu',
      content: `
<h2>Wudu (أبواب الوضوء)</h2>
<p>Wudu is a spiritual and physical purification required before performing Salah. Allah says:</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"O you who believe! When you intend to offer prayer, wash your faces and your hands up to the elbows, wipe your heads, and (wash) your feet up to the ankles." (Surah Al-Ma'idah, 5:6)
</blockquote>

<h3>Obligatory Acts of Wudu (Fara'id)</h3>
<ol>
  <li><strong>Intention (Niyyah)</strong> — in the heart, not spoken</li>
  <li><strong>Washing the face</strong> — from hairline to chin, ear to ear</li>
  <li><strong>Washing the hands to the elbows</strong> — including elbows</li>
  <li><strong>Wiping the head</strong> — at least part of the head</li>
  <li><strong>Washing the feet to the ankles</strong> — including ankles</li>
  <li><strong>Order (Tartib)</strong> — performing the above in sequence</li>
</ol>

<h3>Recommended Acts (Sunnan)</h3>
<ul>
  <li>Starting with "Bismillah"</li>
  <li>Washing hands three times at the beginning</li>
  <li>Rinsing the mouth (Madmadah)</li>
  <li>Sniffing water into the nose (Istinshaq)</li>
  <li>Wiping the ears</li>
  <li>Doing each part three times</li>
  <li>Using the right side first</li>
  <li>Not wasting water</li>
</ul>

<h3>Nullifiers of Wudu</h3>
<ul>
  <li>Natural discharges (urine, stool, wind)</li>
  <li>Deep sleep (lying down)</li>
  <li>Loss of consciousness</li>
  <li>Touching the private parts directly</li>
  <li>Eating camel meat (according to some scholars)</li>
</ul>

<h3>Common Mistakes in Wudu</h3>
<ul>
  <li>Not washing between the fingers</li>
  <li>Not ensuring water reaches the elbows</li>
  <li>Excessive water usage</li>
  <li>Speaking during wudu unnecessarily</li>
</ul>
`,
      quiz: [
        {
          question: 'How many obligatory acts (Fara\'id) are there in Wudu?',
          options: [
            { text: '6', correct: true },
            { text: '4', correct: false },
            { text: '8', correct: false },
            { text: '10', correct: false },
          ],
        },
        {
          question: 'Which of the following NULLIFIES Wudu?',
          options: [
            { text: 'Passing wind', correct: true },
            { text: 'Coughing', correct: false },
            { text: 'Reading Quran', correct: false },
            { text: 'Eating', correct: false },
          ],
        },
        {
          question: 'Washing the feet to the ankles is:',
          options: [
            { text: 'An obligatory act of Wudu', correct: true },
            { text: 'A recommended act', correct: false },
            { text: 'Optional', correct: false },
            { text: 'Not part of Wudu', correct: false },
          ],
        },
        {
          question: 'Which verse mentions the obligations of Wudu?',
          options: [
            { text: 'Surah Al-Ma\'idah, 5:6', correct: true },
            { text: 'Surah Al-Fatihah, 1:1', correct: false },
            { text: 'Surah Al-Baqarah, 2:43', correct: false },
            { text: 'Surah An-Nisa, 4:103', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Purification — Ghusl & Tayammum',
      content: `
<h2>Ghusl: Full Body Purification</h2>
<p><strong>Ghusl</strong> is the act of washing the entire body to remove major ritual impurity (Janabah). It is required after sexual intercourse, ejaculation, and completion of menstruation or postpartum bleeding.</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"And if you are in a state of janabah, then purify yourselves." (Surah Al-Maidah, 5:6)
</blockquote>

<h3>How to Perform Ghusl</h3>
<ol>
  <li><strong>Intention (Niyyah)</strong> — silently intend to remove the state of Janabah</li>
  <li>Wash the private parts</li>
  <li>Perform a complete Wudu</li>
  <li>Pour water over the head three times, ensuring it reaches the scalp</li>
  <li>Pour water over the right shoulder three times, then the left</li>
  <li>Ensure every part of the body is washed, including skin folds</li>
</ol>

<h3>Tayammum: Dry Ablution</h3>
<p>Tayammum is a substitute for Wudu or Ghusl using clean earth when water is unavailable or harmful.</p>
<p>Allah says: <em>"...and you find no water, then seek clean earth and wipe your faces and your hands with it"</em> (5:6)</p>

<h3>When Tayammum is Permitted</h3>
<ul>
  <li>No water available after genuinely searching</li>
  <li>Water is harmful due to illness or extreme cold</li>
  <li>Water is needed for drinking/survival</li>
</ul>

<h3>How to Perform Tayammum</h3>
<ol>
  <li>Intention</li>
  <li>Strike clean earth with both hands</li>
  <li>Wipe the face once</li>
  <li>Strike earth again</li>
  <li>Wipe the hands to the wrists</li>
</ol>
`,
      quiz: [
        {
          question: 'What is the minimum requirement for Ghusl to be valid?',
          options: [
            { text: 'Water must reach every part of the body with intention', correct: true },
            { text: 'Pouring water three times is sufficient', correct: false },
            { text: 'Just the head and shoulders', correct: false },
            { text: 'A symbolic splash of water', correct: false },
          ],
        },
        {
          question: 'When is Tayammum permitted?',
          options: [
            { text: 'When water is unavailable or harmful', correct: true },
            { text: 'When you are in a hurry', correct: false },
            { text: 'When you feel tired', correct: false },
            { text: 'Any time you prefer it over Wudu', correct: false },
          ],
        },
        {
          question: 'What nullifies Tayammum?',
          options: [
            { text: 'Finding water or the excuse no longer applying', correct: true },
            { text: 'Eating or drinking', correct: false },
            { text: 'Speaking', correct: false },
            { text: 'Walking', correct: false },
          ],
        },
        {
          question: 'Ghusl is required after which of the following?',
          options: [
            { text: 'All of the above', correct: true },
            { text: 'Sexual intercourse', correct: false },
            { text: 'Ejaculation during sleep', correct: false },
            { text: 'Completion of menstruation', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Prayer Times',
      content: `
<h2>The Five Prescribed Prayer Times</h2>
<p>Allah has prescribed specific time windows for each of the five daily prayers. Praying within these times is an essential condition for the prayer's validity.</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
"Indeed, prayer has been decreed upon the believers at fixed times." (Surah An-Nisa, 4:103)
</blockquote>

<h3>1. Fajr (Dawn)</h3>
<ul>
  <li><strong>Begins:</strong> True dawn (horizontal light across the horizon)</li>
  <li><strong>Ends:</strong> Sunrise</li>
  <li><strong>Rak'ahs:</strong> 2 Fard, 2 Sunnah</li>
  <li><strong>Recitation:</strong> Aloud (Jahr)</li>
</ul>

<h3>2. Dhuhr (Noon)</h3>
<ul>
  <li><strong>Begins:</strong> Sun passes its zenith and declines</li>
  <li><strong>Ends:</strong> When shadow equals object's height</li>
  <li><strong>Rak'ahs:</strong> 4 Fard, 4 Sunnah before, 2 after</li>
  <li><strong>Recitation:</strong> Silent (Sirr)</li>
</ul>

<h3>3. Asr (Afternoon)</h3>
<ul>
  <li><strong>Begins:</strong> When shadow equals object's height</li>
  <li><strong>Ends:</strong> Sunset</li>
  <li><strong>Rak'ahs:</strong> 4 Fard</li>
  <li><strong>Note:</strong> Disliked to delay once the sun turns yellow</li>
</ul>

<h3>4. Maghrib (Sunset)</h3>
<ul>
  <li><strong>Begins:</strong> Immediately after sunset</li>
  <li><strong>Ends:</strong> When red twilight disappears</li>
  <li><strong>Rak'ahs:</strong> 3 Fard, 2 Sunnah after</li>
  <li><strong>Note:</strong> Shortest window — pray promptly</li>
</ul>

<h3>5. Isha (Night)</h3>
<ul>
  <li><strong>Begins:</strong> When red twilight fades</li>
  <li><strong>Ends:</strong> Midnight (middle of the night)</li>
  <li><strong>Rak'ahs:</strong> 4 Fard, 2 Sunnah after, 3 Witr</li>
</ul>
`,
      quiz: [
        {
          question: 'Which prayer has the shortest time window?',
          options: [
            { text: 'Maghrib', correct: true },
            { text: 'Fajr', correct: false },
            { text: 'Asr', correct: false },
            { text: 'Isha', correct: false },
          ],
        },
        {
          question: 'Fajr prayer ends at:',
          options: [
            { text: 'Sunrise', correct: true },
            { text: 'Midday', correct: false },
            { text: 'When the sun turns yellow', correct: false },
            { text: 'True dawn', correct: false },
          ],
        },
        {
          question: 'In which prayers is the Quran recited aloud?',
          options: [
            { text: 'Fajr, Maghrib, and Isha', correct: true },
            { text: 'All five prayers', correct: false },
            { text: 'Only Fajr', correct: false },
            { text: 'Dhuhr and Asr', correct: false },
          ],
        },
        {
          question: 'How many rak\'ahs are in Dhuhr prayer?',
          options: [
            { text: '4 Fard', correct: true },
            { text: '2 Fard', correct: false },
            { text: '3 Fard', correct: false },
            { text: '6 Fard', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Conditions & Pillars of Salah',
      content: `
<h2>Prerequisites of Prayer (Shurut)</h2>
<p>Nine conditions must be fulfilled before prayer begins. These are prerequisites, not part of the prayer itself, but without them the prayer is invalid.</p>

<h3>The 9 Conditions</h3>
<ol>
  <li><strong>Islam</strong> — the person must be Muslim</li>
  <li><strong>Sanity</strong> — of sound mind</li>
  <li><strong>Puberty</strong> — reached the age of accountability</li>
  <li><strong>Purity from Hadath</strong> — free from minor/major impurities</li>
  <li><strong>Purity from Najasah</strong> — body, clothes, place must be clean</li>
  <li><strong>Covering the Awrah</strong> — men: navel to knees; women: all except face and hands</li>
  <li><strong>Facing the Qiblah</strong> — towards the Kaaba</li>
  <li><strong>Correct Time</strong> — within the designated window</li>
  <li><strong>Intention (Niyyah)</strong> — in the heart</li>
</ol>

<h3>The 14 Pillars (Arkan) of Salah</h3>
<p>Pillars are actions <em>within</em> the prayer. If any is missed intentionally or unintentionally, the prayer must be repeated.</p>
<ol>
  <li>Standing (Qiyam) if able</li>
  <li>Opening Takbir (Allahu Akbar)</li>
  <li>Reciting Surah Al-Fatihah in every rak'ah</li>
  <li>Bowing (Ruku)</li>
  <li>Rising from Ruku</li>
  <li>Standing straight after Ruku</li>
  <li>Prostration (Sujud) on seven body parts</li>
  <li>Rising from Sujud</li>
  <li>Sitting between the two prostrations</li>
  <li>Tranquility (Tumaninah) in each position</li>
  <li>Final Tashahhud</li>
  <li>Sitting for the final Tashahhud</li>
  <li>Sending blessings on the Prophet ﷺ</li>
  <li>The final Salam</li>
</ol>
`,
      quiz: [
        {
          question: 'How many conditions (Shurut) must be fulfilled before prayer?',
          options: [
            { text: '9', correct: true },
            { text: '14', correct: false },
            { text: '7', correct: false },
            { text: '5', correct: false },
          ],
        },
        {
          question: 'What happens if a pillar (Rukn) is missed in prayer?',
          options: [
            { text: 'The prayer must be repeated', correct: true },
            { text: 'Sujud al-Sahw can fix it', correct: false },
            { text: 'Nothing — continue the prayer', correct: false },
            { text: 'The prayer is still valid', correct: false },
          ],
        },
        {
          question: 'The awrah for men during prayer is:',
          options: [
            { text: 'Navel to knees', correct: true },
            { text: 'Shoulders to knees', correct: false },
            { text: 'Whole body except head', correct: false },
            { text: 'Chest to thighs', correct: false },
          ],
        },
        {
          question: 'Reciting Surah Al-Fatihah in every rak\'ah is a:',
          options: [
            { text: 'Pillar (Rukn)', correct: true },
            { text: 'Condition (Shart)', correct: false },
            { text: 'Wajib', correct: false },
            { text: 'Sunnah', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Wajibat and Sunnan of Salah',
      content: `
<h2>Obligatory Acts (Wajibat) of Salah</h2>
<p><strong>Wajibat</strong> are required acts that are not pillars. If forgotten, they can be compensated by Sujud al-Sahw. Deliberate omission invalidates the prayer.</p>

<h3>The 7 Wajibat</h3>
<ol>
  <li>All Takbirs except the opening Takbir</li>
  <li>Saying "Sami Allahu liman hamidah" for the Imam/alone</li>
  <li>Saying "Rabbana wa lakal hamd" upon rising from Ruku</li>
  <li>Saying "Subhana Rabbiyal Azeem" once in Ruku</li>
  <li>Saying "Subhana Rabbiyal A'la" once in Sujud</li>
  <li>The first Tashahhud (in 3 or 4 rak'ah prayers)</li>
  <li>Sitting for the first Tashahhud</li>
</ol>

<h3>Recommended Acts (Sunnan)</h3>
<p>Sunnan bring additional reward but omitting them does not require Sujud al-Sahw.</p>

<h4>Verbal Sunnan</h4>
<ul>
  <li>Opening supplication (Du'a al-Istiftah)</li>
  <li>Ta'awwudh (A'udhu billahi min ash-Shaytan ir-Rajeem)</li>
  <li>Saying Bismillah before Al-Fatihah</li>
  <li>Saying Ameen after Al-Fatihah</li>
  <li>Reciting additional Quranic verses after Al-Fatihah</li>
</ul>

<h4>Physical Sunnan</h4>
<ul>
  <li>Raising the hands to shoulders/ears at Takbir</li>
  <li>Raising the hands when saying Allahu Akbar for Ruku</li>
  <li>Raising the hands when rising from Ruku</li>
  <li>Placing right hand over left on the chest</li>
  <li>Looking at the place of Sujud</li>
</ul>
`,
      quiz: [
        {
          question: 'How many Wajibat are there in Salah?',
          options: [
            { text: '7', correct: true },
            { text: '14', correct: false },
            { text: '9', correct: false },
            { text: '5', correct: false },
          ],
        },
        {
          question: 'What compensates for forgetting a Wajib?',
          options: [
            { text: 'Sujud al-Sahw', correct: true },
            { text: 'Repeating the entire prayer', correct: false },
            { text: 'Making Wudu again', correct: false },
            { text: 'Nothing can compensate', correct: false },
          ],
        },
        {
          question: 'Saying Ameen after Al-Fatihah is a:',
          options: [
            { text: 'Sunnah', correct: true },
            { text: 'Wajib', correct: false },
            { text: 'Pillar', correct: false },
            { text: 'Condition', correct: false },
          ],
        },
        {
          question: 'The first Tashahhud in a 4-rak\'ah prayer is a:',
          options: [
            { text: 'Wajib', correct: true },
            { text: 'Sunnah', correct: false },
            { text: 'Pillar', correct: false },
            { text: 'Optional', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Invalidators of Salah',
      content: `
<h2>What Invalidates the Prayer?</h2>
<p>Certain actions nullify the prayer and require it to be restarted. Some may be compensated by Sujud al-Sahw if done forgetfully.</p>
<blockquote style="border-left: 4px solid var(--important); padding-left: 16px; margin: 16px 0;">
The Prophet ﷺ said: "The prayer of a person who does not have tranquility in his bowing and prostration is not sufficient."
</blockquote>

<h3>Major Invalidators</h3>
<ul>
  <li><strong>Speaking intentionally</strong> — words not related to the prayer</li>
  <li><strong>Eating or drinking</strong> deliberately</li>
  <li><strong>Laughing aloud</strong> (smiling does not invalidate)</li>
  <li><strong>Uncovering the Awrah</strong> intentionally or without immediately covering</li>
  <li><strong>Turning the chest away from the Qiblah</strong> without excuse</li>
  <li><strong>Breaking Wudu</strong> — passing wind, urine, etc.</li>
  <li><strong>Changing the intention</strong> mid-prayer</li>
  <li><strong>Deliberately omitting a pillar</strong></li>
</ul>

<h3>Actions that are Disliked (Makruh)</h3>
<ul>
  <li>Playing with clothes or body</li>
  <li>Looking around unnecessarily</li>
  <li>Holding back urine or stool</li>
  <li>Praying when food is ready and distracting</li>
  <li>Yawning without covering the mouth</li>
  <li>Rushed recitation without contemplation</li>
</ul>
`,
      quiz: [
        {
          question: 'Which of the following invalidates the prayer?',
          options: [
            { text: 'Speaking intentionally', correct: true },
            { text: 'Smiling', correct: false },
            { text: 'Sneezing', correct: false },
            { text: 'Coughing lightly', correct: false },
          ],
        },
        {
          question: 'What is the ruling on laughing during prayer?',
          options: [
            { text: 'Audible laughter invalidates; smiling does not', correct: true },
            { text: 'Any laughter invalidates the prayer', correct: false },
            { text: 'It is disliked but does not invalidate', correct: false },
            { text: 'It is completely fine', correct: false },
          ],
        },
        {
          question: 'If Wudu is broken during prayer, what should you do?',
          options: [
            { text: 'Leave the prayer, make Wudu, and start over', correct: true },
            { text: 'Continue the prayer and make Wudu after', correct: false },
            { text: 'Make Wudu and continue from where you stopped', correct: false },
            { text: 'Perform Tayammum and continue', correct: false },
          ],
        },
        {
          question: 'Looking around during prayer is:',
          options: [
            { text: 'Disliked (Makruh)', correct: true },
            { text: 'Invalidates the prayer', correct: false },
            { text: 'Recommended', correct: false },
            { text: 'Required', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Congregational Prayer',
      content: `
<h2>The Ruling on Congregational Prayer</h2>
<p>Prayer in congregation (Salat al-Jama'ah) is highly emphasized. It is a strongly recommended Sunnah for men, and some scholars consider it obligatory.</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
The Prophet ﷺ said: "Prayer in congregation is twenty-seven times superior to prayer offered individually." (Bukhari & Muslim)
</blockquote>

<h3>Rewards of Congregational Prayer</h3>
<ul>
  <li>27 times more reward than praying alone</li>
  <li>Forgiveness of sins between prayers</li>
  <li>Community bonding and unity</li>
  <li>The Angels pray for you as long as you remain in your place</li>
</ul>

<h3>Role of the Imam</h3>
<p>The Imam should be the most knowledgeable in Quran and Fiqh of prayer. He should recite moderately — not too fast nor too slow. Followers should not precede the Imam in any action.</p>

<h3>Following the Imam</h3>
<ul>
  <li>Followers do not recite aloud during audible prayers</li>
  <li>Latecomers complete missed rak'ahs after the Imam's Salam</li>
  <li>There should be a gap of approximately one action behind the Imam</li>
</ul>
`,
      quiz: [
        {
          question: 'How much more reward does congregational prayer have over praying alone?',
          options: [
            { text: '27 times', correct: true },
            { text: '10 times', correct: false },
            { text: '50 times', correct: false },
            { text: '100 times', correct: false },
          ],
        },
        {
          question: 'What should a latecomer do when joining the congregation?',
          options: [
            { text: 'Join immediately and complete missed rak\'ahs after Salam', correct: true },
            { text: 'Wait for the next prayer', correct: false },
            { text: 'Pray alone', correct: false },
            { text: 'Make up the entire prayer later', correct: false },
          ],
        },
        {
          question: 'Who should lead the congregation as Imam?',
          options: [
            { text: 'The most knowledgeable in Quran and Fiqh', correct: true },
            { text: 'The oldest person present', correct: false },
            { text: 'The wealthiest person', correct: false },
            { text: 'Any volunteer regardless of knowledge', correct: false },
          ],
        },
        {
          question: 'Followers should ____ the Imam in actions.',
          options: [
            { text: 'Not precede', correct: true },
            { text: 'Precede', correct: false },
            { text: 'Match exactly at the same time', correct: false },
            { text: 'Ignore', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Makeup Prayers (Qada)',
      content: `
<h2>Making Up Missed Prayers</h2>
<p>If a Muslim misses a prayer for a valid reason (sleep, forgetfulness), they must make it up (Qada) as soon as they remember.</p>
<blockquote style="border-left: 4px solid var(--primary); padding-left: 16px; margin: 16px 0;">
The Prophet ﷺ said: "Whoever forgets a prayer or sleeps through it, its expiation is to pray it when he remembers it." (Bukhari & Muslim)
</blockquote>

<h3>When Qada is Required</h3>
<ul>
  <li>Sleeping through the prayer time</li>
  <li>Forgetting to pray</li>
  <li>Unconsciousness or coma (most schools)</li>
</ul>

<h3>When Qada is NOT Required</h3>
<ul>
  <li>Menstruation or postpartum bleeding</li>
  <li>Mental illness during the period of insanity</li>
  <li>Before puberty</li>
</ul>

<h3>How to Make Up Missed Prayers</h3>
<ul>
  <li>Pray the missed prayer exactly as you would have — same rak'ahs</li>
  <li>Intend Qada in your heart</li>
  <li>Multiple missed prayers can be made up in sequence</li>
  <li>Qada can be offered at any time except the three forbidden times (sunrise, zenith, sunset)</li>
  <li>Pray Qada as soon as possible without unnecessary delay</li>
</ul>
`,
      quiz: [
        {
          question: 'What should you do if you miss a prayer due to sleep?',
          options: [
            { text: 'Pray it as soon as you wake up', correct: true },
            { text: 'Pray it at the next prayer time', correct: false },
            { text: 'It is excused and no makeup is needed', correct: false },
            { text: 'Give charity instead', correct: false },
          ],
        },
        {
          question: 'Which group is exempt from making up missed prayers?',
          options: [
            { text: 'Menstruating women', correct: true },
            { text: 'Travelers', correct: false },
            { text: 'Sick people', correct: false },
            { text: 'Busy professionals', correct: false },
          ],
        },
        {
          question: 'At what times is it forbidden to pray Qada?',
          options: [
            { text: 'Sunrise, zenith, and sunset', correct: true },
            { text: 'Only at midnight', correct: false },
            { text: 'After Isha until Fajr', correct: false },
            { text: 'There are no forbidden times', correct: false },
          ],
        },
        {
          question: 'How should multiple missed prayers be made up?',
          options: [
            { text: 'In sequence, one after another', correct: true },
            { text: 'All at once in a single prayer', correct: false },
            { text: 'They cannot be made up', correct: false },
            { text: 'Only the most recent one can be made up', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Sujud al-Sahw (Prostration of Forgetfulness)',
      content: `
<h2>Sujud al-Sahw: Correcting Forgetfulness in Prayer</h2>
<p>Allah, in His mercy, prescribed Sujud al-Sahw (prostration of forgetfulness) to rectify errors made during prayer.</p>

<h3>When is Sujud al-Sahw Required?</h3>
<ol>
  <li><strong>Addition</strong> — adding an extra action (e.g., praying 5 rak'ahs instead of 4)</li>
  <li><strong>Omission</strong> — omitting a Wajib (e.g., forgetting the first Tashahhud)</li>
  <li><strong>Doubt</strong> — uncertainty about the number of rak'ahs completed</li>
</ol>

<h3>How to Perform Sujud al-Sahw</h3>
<ul>
  <li><strong>Before Salam</strong> — if you omitted a Wajib, perform two extra prostrations before Salam</li>
  <li><strong>After Salam</strong> — if you added something, perform after Salam</li>
  <li><strong>If in doubt</strong> — act upon the lesser number, complete the prayer, then perform Sujud al-Sahw before Salam</li>
</ul>

<h3>Important Principles</h3>
<ul>
  <li>If you consistently have doubts (Waswas), ignore the doubt and act upon the majority</li>
  <li>If you remember a missed action while still in the same position, perform it immediately</li>
  <li>If you remember after moving to the next position, continue and perform Sujud al-Sahw</li>
</ul>
`,
      quiz: [
        {
          question: 'In which scenarios is Sujud al-Sahw performed?',
          options: [
            { text: 'Addition, omission, or doubt in prayer', correct: true },
            { text: 'Only when adding extra rak\'ahs', correct: false },
            { text: 'Only when missing Wudu', correct: false },
            { text: 'After every prayer by default', correct: false },
          ],
        },
        {
          question: 'If you are uncertain about the number of rak\'ahs, you should:',
          options: [
            { text: 'Act upon the lesser number and perform Sujud al-Sahw', correct: true },
            { text: 'Act upon the greater number', correct: false },
            { text: 'Start the prayer over', correct: false },
            { text: 'Ignore the doubt', correct: false },
          ],
        },
        {
          question: 'When is Sujud al-Sahw performed before Salam?',
          options: [
            { text: 'When a Wajib has been omitted', correct: true },
            { text: 'When an extra rak\'ah has been added', correct: false },
            { text: 'When the prayer was interrupted', correct: false },
            { text: 'It is always performed before Salam', correct: false },
          ],
        },
        {
          question: 'What should a person who constantly doubts (Waswas) do?',
          options: [
            { text: 'Ignore the doubt and act upon the majority', correct: true },
            { text: 'Always repeat the prayer', correct: false },
            { text: 'Perform Sujud al-Sahw after every prayer', correct: false },
            { text: 'Stop praying altogether until certain', correct: false },
          ],
        },
      ],
    },
  ],
  'seerah-life-of-the-prophet': [
    {
      title: 'Arabia Before Islam',
      content: `
<h2>The Arabian Peninsula Before Islam</h2>
<p>To understand the impact of the Prophet ﷺ, we must first understand the world into which he was born.</p>

<h3>Political Landscape</h3>
<p>Arabia was not a unified nation. It consisted of:</p>
<ul>
  <li><strong>Independent tribes</strong> with their own chiefs and customs</li>
  <li><strong>Two major powers</strong> nearby: The Byzantine Empire (Christian) and the Sassanid Persian Empire (Zoroastrian)</li>
  <li><strong>Yemen</strong> — under Persian influence, agriculture-based civilization</li>
  <li><strong>Hejaz</strong> (where Makkah and Madinah are) — tribal, trade-based economy</li>
</ul>

<h3>Religious Landscape</h3>
<ul>
  <li><strong>Idol worship</strong> — dominant practice. The Ka'bah housed 360 idols</li>
  <li><strong>Hanif</strong> — a few individuals who rejected idolatry and followed the pure monotheism of Ibrahim (Abraham)</li>
  <li><strong>Jewish communities</strong> in Yathrib (Madinah), Khaybar, and Yemen</li>
  <li><strong>Christians</strong> in Najran and some northern tribes</li>
  <li><strong>Zoroastrians</strong> in areas under Persian influence</li>
</ul>

<h3>Social Conditions</h3>
<ul>
  <li>Tribal loyalty was paramount — "My tribe, right or wrong"</li>
  <li>Blood feuds and tribal wars were common (e.g., the war of Basus lasted 40 years)</li>
  <li>Women had very limited rights — female infanticide was practiced</li>
  <li>Slavery was widespread</li>
  <li>Alcohol, gambling, and exploitative trade practices were rampant</li>
  <li>Poetry and oratory were the highest art forms — annual fairs at Ukaz</li>
</ul>

<h3>The Economic System</h3>
<p>Makkah was a major trade hub, with caravans traveling to Syria (summer) and Yemen (winter), as mentioned in Surah Quraysh. Wealth was concentrated in the hands of a few powerful tribes, especially the Quraysh.</p>

<h3>Why Was Revelation Needed?</h3>
<p>Humanity had reached a state where divine guidance was urgently needed. The existing scriptures had been altered, and the original message of monotheism was lost among most people. The world was ready for the final revelation.</p>
`,
      quiz: [
        {
          question: 'How many idols were housed in the Ka\'bah before Islam?',
          options: [
            { text: '360', correct: true },
            { text: '100', correct: false },
            { text: '500', correct: false },
            { text: '200', correct: false },
          ],
        },
        {
          question: 'What were the two major empires bordering Arabia?',
          options: [
            { text: 'Byzantine and Persian', correct: true },
            { text: 'Roman and Egyptian', correct: false },
            { text: 'Ottoman and Mongol', correct: false },
            { text: 'Greek and Indian', correct: false },
          ],
        },
        {
          question: 'What was the dominant religion in Arabia before Islam?',
          options: [
            { text: 'Idol worship', correct: true },
            { text: 'Christianity', correct: false },
            { text: 'Judaism', correct: false },
            { text: 'Zoroastrianism', correct: false },
          ],
        },
        {
          question: 'Who were the Hanif?',
          options: [
            { text: 'Individuals who rejected idolatry and followed pure monotheism', correct: true },
            { text: 'Jewish tribes in Madinah', correct: false },
            { text: 'Christian monks', correct: false },
            { text: 'Idol worshippers', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Birth & Early Life',
      videoUrl: 'https://www.youtube.com/embed/FEaqNoFNTdA',
      content: `
<h2>The Birth and Early Life of Prophet Muhammad ﷺ</h2>

<h3>The Year of the Elephant (عام الفيل)</h3>
<p>The Prophet ﷺ was born in the <strong>Year of the Elephant</strong> (approximately 570 CE), named after the event when Abraha al-Ashram, the Christian ruler of Yemen, marched toward Makkah with an army that included elephants, intending to destroy the Ka'bah. Allah protected His House by sending flocks of birds that pelted the army with stones of baked clay (Surah Al-Fil).</p>

<h3>Birth</h3>
<p>Prophet Muhammad ﷺ was born on Monday, the 12th of Rabi' al-Awwal, in Makkah. His father, <strong>Abdullah ibn Abd al-Muttalib</strong>, had died before his birth. His mother was <strong>Aminah bint Wahb</strong>.</p>

<h3>Early Childhood</h3>
<ul>
  <li>As was the custom, he was sent to a wet nurse, <strong>Halimah as-Sa'diyah</strong>, from the tribe of Banu Sa'd, to grow up in the desert — healthy environment, pure Arabic</li>
  <li>At age 6, his mother Aminah died, leaving him orphaned</li>
  <li>He was then cared for by his grandfather, <strong>Abd al-Muttalib</strong>, who loved him dearly</li>
  <li>At age 8, his grandfather also passed away</li>
  <li>He then came under the care of his uncle, <strong>Abu Talib</strong>, who protected him throughout his life</li>
</ul>

<h3>Youth and Early Adulthood</h3>
<ul>
  <li>As a young man, he worked as a shepherd, then as a trader</li>
  <li>He became known as <strong>Al-Amin</strong> (the Trustworthy) and <strong>As-Sadiq</strong> (the Truthful) among his people</li>
  <li>He never participated in idol worship or immoral practices common among the youth</li>
  <li>At age 25, he married <strong>Khadijah bint Khuwaylid</strong>, a wealthy businesswoman who proposed to him after witnessing his character</li>
</ul>

<h3>The Rebuilding of the Ka'bah</h3>
<p>When the Prophet ﷺ was 35, the Quraysh rebuilt the Ka'bah after a flood damaged it. A dispute arose over who would place the Black Stone (Hajar al-Aswad). They agreed to let the first person to enter the gate be the arbitrator — it was Muhammad ﷺ. He placed the stone on a cloth and asked each tribal chief to hold a corner, then he himself placed it in position, avoiding bloodshed.</p>
`,
      quiz: [
        {
          question: 'Who cared for the Prophet ﷺ after the death of his grandfather?',
          options: [
            { text: 'His uncle Abu Talib', correct: true },
            { text: 'His uncle Hamzah', correct: false },
            { text: 'His cousin Ali', correct: false },
            { text: 'His wet nurse Halimah', correct: false },
          ],
        },
        {
          question: 'What title did the Prophet ﷺ earn because of his trustworthiness?',
          options: [
            { text: 'Al-Amin (the Trustworthy)', correct: true },
            { text: 'Al-Hafiz (the Preserver)', correct: false },
            { text: 'Al-Karim (the Generous)', correct: false },
            { text: 'Al-Aziz (the Mighty)', correct: false },
          ],
        },
        {
          question: 'The Prophet ﷺ was born in which year?',
          options: [
            { text: 'The Year of the Elephant (~570 CE)', correct: true },
            { text: 'The Year of the Flood', correct: false },
            { text: 'The Year of the Covenant', correct: false },
            { text: 'The Year of the Migration', correct: false },
          ],
        },
        {
          question: 'How did the Prophet ﷺ resolve the dispute over the Black Stone?',
          options: [
            { text: 'He placed the stone on a cloth and had each tribe lift a corner', correct: true },
            { text: 'He personally placed it, asserting tribal authority', correct: false },
            { text: 'He let the eldest chief place it', correct: false },
            { text: 'He drew lots among the tribes', correct: false },
          ],
        },
        {
          question: 'At what age did the Prophet ﷺ marry Khadijah?',
          options: [
            { text: '25', correct: true },
            { text: '30', correct: false },
            { text: '20', correct: false },
            { text: '35', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The First Revelation',
      content: `
<h2>The Cave of Hira</h2>
<p>At age 40, the Prophet ﷺ began retreating to <strong>Cave Hira</strong> on Jabal an-Noor (Mountain of Light) outside Makkah. He would meditate and contemplate the Creator. It was here that the most significant event in human history unfolded.</p>

<p>The first revelation began with <strong>true visions in sleep</strong> — they would come like the break of dawn. Then he came to love seclusion and would stay in the Cave of Hira for many nights.</p>

<h2>The Descent of Jibril (AS)</h2>
<p>One night, the Angel <strong>Jibril (AS)</strong> appeared and commanded: <strong>"Iqra!"</strong> (Read!).</p>
<ul>
  <li>The Prophet ﷺ replied: "I am not one who reads" — he was unlettered</li>
  <li>Jibril <strong>embraced him tightly</strong> three times, each time commanding him to read</li>
  <li>Finally, Jibril revealed the first verses of <strong>Surah Al-Alaq (96:1-5)</strong></li>
</ul>

<blockquote><strong>"Recite in the name of your Lord who created — Created man from a clot. Recite, and your Lord is the Most Generous — Who taught by the pen — Taught man that which he knew not."</strong></blockquote>

<h2>The Return to Khadijah</h2>
<p>Trembling and overwhelmed, the Prophet ﷺ returned to Khadijah saying: <strong>"Cover me! Cover me!"</strong> He told her what had happened, and she became the <strong>first person to believe in his prophethood</strong>.</p>
<p>She took him to her cousin <strong>Waraqah ibn Nawfal</strong>, a Christian scholar who confirmed: <strong>"This is the same angel that Allah sent to Moses. I wish I could be alive when your people drive you out"</strong> — foreseeing the persecution to come.</p>
`,
      quiz: [
        {
          question: 'Where was the Prophet ﷺ when he received the first revelation?',
          options: [
            { text: 'Cave of Hira on Jabal an-Noor', correct: true },
            { text: 'Cave of Thawr', correct: false },
            { text: 'In his home with Khadijah', correct: false },
            { text: 'At the Kaaba', correct: false },
          ],
        },
        {
          question: 'Which angel delivered the first revelation?',
          options: [
            { text: 'Jibril (AS)', correct: true },
            { text: 'Mikail (AS)', correct: false },
            { text: 'Israfil (AS)', correct: false },
            { text: 'Malik (AS)', correct: false },
          ],
        },
        {
          question: 'Which surah was first revealed?',
          options: [
            { text: 'Surah Al-Alaq (96)', correct: true },
            { text: 'Surah Al-Fatihah (1)', correct: false },
            { text: 'Surah Al-Qalam (68)', correct: false },
            { text: 'Surah Al-Muddaththir (74)', correct: false },
          ],
        },
        {
          question: 'Who confirmed to the Prophet that the revelation was from Allah?',
          options: [
            { text: 'Waraqah ibn Nawfal', correct: true },
            { text: 'Abu Bakr as-Siddiq', correct: false },
            { text: 'Ali ibn Abi Talib', correct: false },
            { text: 'Hamzah ibn Abd al-Muttalib', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The Makkan Period — Early Dawah',
      content: `
<h2>The Early Call to Islam</h2>
<p>The Prophet ﷺ began his mission with <strong>secret calls</strong> to those he trusted most. For three years, Islam spread quietly among close friends and family.</p>

<h2>The First Believers</h2>
<ul>
  <li><strong>Khadijah bint Khuwaylid</strong> — first believer, unwavering supporter</li>
  <li><strong>Ali ibn Abi Talib</strong> — first child to accept Islam (age 10)</li>
  <li><strong>Abu Bakr as-Siddiq</strong> — first adult male outside the family</li>
  <li><strong>Zayd ibn Harithah</strong> — freed slave and adopted son</li>
  <li><strong>Bilal ibn Rabah</strong>, <strong>Ammar ibn Yasir</strong>, <strong>Sumayyah bint Khabbab</strong> — early converts from marginalized backgrounds</li>
</ul>

<h2>The Open Call</h2>
<p>After three years, Allah commanded the Prophet ﷺ to <strong>call openly</strong>. He ascended Mount Safa and addressed the Quraysh: <strong>"If I told you that an army was behind this mountain, would you believe me?"</strong> They replied: <strong>"We have never known you to lie."</strong></p>
<p>He then declared: <strong>"I am a warner to you of a severe punishment before you."</strong> His uncle <strong>Abu Lahab</strong> cursed him publicly, and the Quraysh began their campaign of opposition.</p>

<blockquote>Allah revealed: <strong>"Perish the hands of Abu Lahab and perish he!"</strong> (Surah Al-Masad 111) — a powerful confirmation that the Prophet's message was from Allah.</blockquote>

<h2>The Quraysh's Response</h2>
<ul>
  <li><strong>Mockery and ridicule</strong> — calling him a poet, magician, or madman</li>
  <li><strong>Offers of wealth and power</strong> — kingship, wealth, and marriage if he would stop</li>
  <li><strong>Prophet's reply:</strong> "By Allah, if they put the sun in my right hand and the moon in my left, I would not abandon this mission until Allah makes it prevail or I perish trying."</li>
</ul>
`,
      quiz: [
        {
          question: 'How long did the Prophet ﷺ call to Islam secretly before the open call?',
          options: [
            { text: 'Three years', correct: true },
            { text: 'One year', correct: false },
            { text: 'Five years', correct: false },
            { text: 'Seven years', correct: false },
          ],
        },
        {
          question: 'Who was the first adult male outside the family to accept Islam?',
          options: [
            { text: 'Abu Bakr as-Siddiq', correct: true },
            { text: 'Umar ibn al-Khattab', correct: false },
            { text: 'Uthman ibn Affan', correct: false },
            { text: 'Hamzah ibn Abd al-Muttalib', correct: false },
          ],
        },
        {
          question: 'Which surah was revealed in response to Abu Lahab\'s cursing of the Prophet?',
          options: [
            { text: 'Surah Al-Masad (111)', correct: true },
            { text: 'Surah Al-Kawthar (108)', correct: false },
            { text: 'Surah An-Nasr (110)', correct: false },
            { text: 'Surah Al-Ikhlas (112)', correct: false },
          ],
        },
        {
          question: 'From which mountain did the Prophet ﷺ make the first open call?',
          options: [
            { text: 'Mount Safa', correct: true },
            { text: 'Mount Marwah', correct: false },
            { text: 'Mount Uhud', correct: false },
            { text: 'Mount Hira', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Persecution & Patience',
      content: `
<h2>The Trials of the Early Muslims</h2>
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
  <li><strong>Khadijah (RA)</strong> — his beloved wife, confidante and first supporter — passed away</li>
  <li><strong>Abu Talib</strong> — his protective uncle who shielded him from the Quraysh — also died</li>
</ol>
<p>With the loss of his two main protectors, the persecution intensified. The Prophet ﷺ called this <strong>"the Year of Grief."</strong></p>

<h2>The Journey to Ta'if</h2>
<p>Seeking a new base for Islam, the Prophet ﷺ traveled to <strong>Ta'if</strong>. The people rejected him cruelly, <strong>stoning him</strong> until his feet bled. As he retreated to a garden, the angel of the mountains offered to crush the people between two mountains — but the Prophet ﷺ refused, saying:</p>
<blockquote><strong>"I hope that Allah will bring from their descendants people who will worship Allah alone."</strong></blockquote>
`,
      quiz: [
        {
          question: 'What was the Year of Grief (Aam al-Huzn)?',
          options: [
            { text: 'The year Khadijah and Abu Talib both died', correct: true },
            { text: 'The year of the Battle of Badr', correct: false },
            { text: 'The year of the Hijrah', correct: false },
            { text: 'The year of the boycott of Banu Hashim', correct: false },
          ],
        },
        {
          question: 'How did the people of Ta\'if respond to the Prophet\'s call?',
          options: [
            { text: 'They stoned him until his feet bled', correct: true },
            { text: 'They accepted Islam', correct: false },
            { text: 'They ignored him', correct: false },
            { text: 'They offered him wealth', correct: false },
          ],
        },
        {
          question: 'When the angel offered to destroy the people of Ta\'if, what did the Prophet do?',
          options: [
            { text: 'He refused and prayed for their descendants to believe', correct: true },
            { text: 'He accepted the offer', correct: false },
            { text: 'He asked for a delay', correct: false },
            { text: 'He consulted his companions first', correct: false },
          ],
        },
        {
          question: 'How long was the Banu Hashim social boycott?',
          options: [
            { text: 'Three years', correct: true },
            { text: 'One year', correct: false },
            { text: 'Five years', correct: false },
            { text: 'Six months', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The Night Journey & Ascension (Isra & Mi\'raj)',
      content: `
<h2>The Journey of Journeys</h2>
<p>In the midst of grief and hardship, Allah honored the Prophet ﷺ with the greatest miracle — the <strong>Night Journey</strong> (Isra) and <strong>Heavenly Ascension</strong> (Mi'raj).</p>

<blockquote>Allah says: <strong>"Exalted is He who took His servant by night from the Sacred Mosque to the Farthest Mosque, whose surroundings We have blessed, to show him of Our signs. Indeed, He is the Hearing, the Seeing."</strong> (Surah Al-Isra 17:1)</blockquote>

<h2>The Isra (Night Journey)</h2>
<ul>
  <li>The Prophet ﷺ was transported from the <strong>Kaaba in Makkah</strong> to <strong>Masjid al-Aqsa in Jerusalem</strong> on the winged steed <strong>Al-Buraq</strong></li>
  <li>In Jerusalem, he <strong>led all previous prophets in prayer</strong> — a symbol of his leadership of all humanity</li>
  <li>He was offered two vessels: <strong>wine and milk</strong>. He chose milk, and Jibril said: "You have chosen the natural disposition (Fitrah)."</li>
</ul>

<h2>The Mi'raj (Ascension)</h2>
<p>From Jerusalem, the Prophet ﷺ ascended through the seven heavens, meeting various prophets:</p>
<ul>
  <li><strong>First heaven:</strong> Prophet Adam (AS)</li>
  <li><strong>Second heaven:</strong> Prophets Yahya and Isa (AS)</li>
  <li><strong>Third heaven:</strong> Prophet Yusuf (AS)</li>
  <li><strong>Fourth heaven:</strong> Prophet Idris (AS)</li>
  <li><strong>Fifth heaven:</strong> Prophet Harun (AS)</li>
  <li><strong>Sixth heaven:</strong> Prophet Musa (AS)</li>
  <li><strong>Seventh heaven:</strong> Prophet Ibrahim (AS)</li>
  <li><strong>Sidrat al-Muntaha:</strong> The Lote Tree of the Utmost Boundary — where he received the command for <strong>50 daily prayers</strong>, later reduced to <strong>5</strong> after Musa's advice</li>
</ul>

<h2>Lessons from Isra and Mi'raj</h2>
<ul>
  <li><strong>Hardship is followed by ease</strong> — the greatest spiritual gift came after the worst worldly trial</li>
  <li><strong>The five daily prayers</strong> were gifted directly by Allah — their importance is unmatched</li>
  <li><strong>Faith transcends time and space</strong> — all prophets are united in Tawheed</li>
</ul>
`,
      quiz: [
        {
          question: 'On which animal did the Prophet ﷺ travel during the Night Journey?',
          options: [
            { text: 'Al-Buraq', correct: true },
            { text: 'A flying carpet', correct: false },
            { text: 'A horse named Qaswa', correct: false },
            { text: 'A camel', correct: false },
          ],
        },
        {
          question: 'Where did the Prophet ﷺ lead the other prophets in prayer?',
          options: [
            { text: 'Masjid al-Aqsa in Jerusalem', correct: true },
            { text: 'Masjid an-Nabawi in Madinah', correct: false },
            { text: 'The Kaaba in Makkah', correct: false },
            { text: 'The Cave of Hira', correct: false },
          ],
        },
        {
          question: 'How many daily prayers were originally commanded?',
          options: [
            { text: '50', correct: true },
            { text: '5', correct: false },
            { text: '10', correct: false },
            { text: '30', correct: false },
          ],
        },
        {
          question: 'Which prophet advised the Prophet ﷺ to ask for a reduction in prayers?',
          options: [
            { text: 'Musa (AS)', correct: true },
            { text: 'Ibrahim (AS)', correct: false },
            { text: 'Isa (AS)', correct: false },
            { text: 'Adam (AS)', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The Hijrah to Madinah',
      content: `
<h2>The Migration to Madinah</h2>
<p>As persecution intensified and the Quraysh plotted to assassinate the Prophet ﷺ, Allah gave permission for the Muslims to <strong>migrate</strong> to <strong>Yathrib</strong> (later renamed Madinah al-Munawwarah). This migration (Hijrah) marks the beginning of the Islamic calendar.</p>

<h2>The Planning</h2>
<ul>
  <li>The Prophet ﷺ and <strong>Abu Bakr (RA)</strong> hid in the <strong>Cave of Thawr</strong> for three days</li>
  <li>Allah caused a <strong>spider to weave a web</strong> and a <strong>bird to nest</strong> at the cave entrance, convincing pursuers it was empty</li>
  <li>They hired a guide from a different tribe for secrecy</li>
  <li>The journey took <strong>8-10 days</strong> on camelback through desert terrain</li>
</ul>

<h2>The Arrival in Madinah</h2>
<p>The entire city welcomed the Prophet ﷺ with joy. People sang:</p>
<blockquote><strong>"The full moon has risen over us — from the passes of Thaniyat al-Wada — gratitude is due to Allah — as long as any caller calls to Allah."</strong></blockquote>
<p>Every family wanted the Prophet ﷺ to stay with them. He let his camel, <strong>Qaswa</strong>, decide — wherever it knelt, that would be his home. It knelt at the site where <strong>Masjid an-Nabawi</strong> now stands.</p>

<h2>Key Actions in Madinah</h2>
<ul>
  <li><strong>Built the first mosque</strong> — Masjid an-Nabawi, the center of the new community</li>
  <li><strong>Established brotherhood</strong> (Muakhah) — pairing each Muhajir with an Ansar as brothers</li>
  <li><strong>Drafted the Constitution of Madinah</strong> — the first written constitution in history</li>
  <li><strong>Built a market</strong> — economic independence from the Quraysh</li>
</ul>
`,
      quiz: [
        {
          question: 'In which cave did the Prophet and Abu Bakr hide during the Hijrah?',
          options: [
            { text: 'Cave of Thawr', correct: true },
            { text: 'Cave of Hira', correct: false },
            { text: 'Cave of Saur', correct: false },
            { text: 'Cave of the Seven Sleepers', correct: false },
          ],
        },
        {
          question: 'What did Allah use to conceal the cave entrance?',
          options: [
            { text: 'A spider web and a bird\'s nest', correct: true },
            { text: 'A sandstorm', correct: false },
            { text: 'A rock that rolled in front', correct: false },
            { text: 'A tree that grew overnight', correct: false },
          ],
        },
        {
          question: 'What was the name of the Prophet\'s camel?',
          options: [
            { text: 'Qaswa', correct: true },
            { text: 'Al-Buraq', correct: false },
            { text: 'Al-Mahdi', correct: false },
            { text: 'Al-Kawthar', correct: false },
          ],
        },
        {
          question: 'The Hijrah marks the beginning of which calendar?',
          options: [
            { text: 'The Islamic calendar', correct: true },
            { text: 'The Gregorian calendar', correct: false },
            { text: 'The Jewish calendar', correct: false },
            { text: 'The Persian calendar', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Building the Islamic State in Madinah',
      content: `
<h2>The Foundations of Islamic Civilization</h2>
<p>In Madinah, the Prophet ﷺ established the <strong>first Islamic state</strong> — a model of governance, social justice, and community organization that would transform the world.</p>

<h2>The Constitution of Madinah</h2>
<p>This remarkable document, written by the Prophet ﷺ himself, established:</p>
<ul>
  <li><strong>Unity of the community</strong> — Muslims, Jews, and polytheists formed one nation (Ummah)</li>
  <li><strong>Freedom of religion</strong> — "The Jews have their religion, and the Muslims have theirs"</li>
  <li><strong>Mutual defense</strong> — all parties would defend the city against attack</li>
  <li><strong>Justice for all</strong> — the Prophet ﷺ was the final authority in disputes</li>
  <li><strong>Blood money and ransom</strong> — a system to prevent endless tribal feuds</li>
</ul>
<blockquote>This constitution is considered the <strong>first written constitution in human history</strong>, predating the Magna Carta by nearly 600 years.</blockquote>

<h2>The Brotherhood (Muakhah)</h2>
<p>Each immigrant from Makkah was paired with a resident of Madinah as a <strong>brother in faith</strong>. The Ansar shared homes, businesses, and farms with their Muhajir brothers. This bond was so strong they even inherited from each other (a temporary ruling later abrogated).</p>

<h2>The Role of the Masjid</h2>
<p>Masjid an-Nabawi was not just a place of prayer — it was:</p>
<ul>
  <li>A <strong>school</strong> — where the Sahabah learned Quran and Islam</li>
  <li>A <strong>court</strong> — where disputes were resolved</li>
  <li>A <strong>community center</strong> — for social gatherings and events</li>
  <li>A <strong>guest house</strong> — where visitors and delegations were hosted</li>
  <li>A <strong>hospital</strong> — where the wounded were treated</li>
</ul>
`,
      quiz: [
        {
          question: 'What is the Constitution of Madinah considered to be?',
          options: [
            { text: 'The first written constitution in human history', correct: true },
            { text: 'The first international treaty', correct: false },
            { text: 'A commercial trade agreement', correct: false },
            { text: 'A military alliance only', correct: false },
          ],
        },
        {
          question: 'What was Muakhah (brotherhood)?',
          options: [
            { text: 'Pairing each Muhajir with an Ansar as brothers in faith', correct: true },
            { text: 'A military training program', correct: false },
            { text: 'A treaty with the Quraysh', correct: false },
            { text: 'A system of trade agreements', correct: false },
          ],
        },
        {
          question: 'Which of these was NOT a function of Masjid an-Nabawi?',
          options: [
            { text: 'A marketplace for buying and selling', correct: true },
            { text: 'A school for learning Quran', correct: false },
            { text: 'A court for resolving disputes', correct: false },
            { text: 'A community center for gatherings', correct: false },
          ],
        },
        {
          question: 'The Constitution of Madinah predates the Magna Carta by how many years?',
          options: [
            { text: 'Nearly 600 years', correct: true },
            { text: 'Nearly 200 years', correct: false },
            { text: 'Nearly 1000 years', correct: false },
            { text: 'Nearly 100 years', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The Major Battles',
      content: `
<h2>Defending the New State</h2>
<p>The Quraysh could not tolerate an independent Muslim state in Madinah. They launched several military campaigns. The Prophet ﷺ, under divine guidance, responded with strategic defensive battles.</p>

<h2>Battle of Badr (2 AH / 624 CE)</h2>
<p>The first and most significant battle.</p>
<ul>
  <li><strong>Muslims:</strong> 313 poorly equipped men, 2 horses, 70 camels</li>
  <li><strong>Quraysh:</strong> 1,000 well-armed men, 200 horses</li>
  <li><strong>Outcome:</strong> Decisive Muslim victory — 70 Quraysh killed, 70 captured</li>
  <li><strong>Significance:</strong> Established the Muslims as a military force. Angels fought alongside them</li>
</ul>
<blockquote>Allah says: <strong>"And Allah had certainly helped you at Badr when you were weak."</strong> (Surah Aal-e-Imran 3:123)</blockquote>

<h2>Battle of Uhud (3 AH / 625 CE)</h2>
<ul>
  <li><strong>Muslims:</strong> 700 men</li>
  <li><strong>Quraysh:</strong> 3,000 men, including 200 cavalry led by Khalid ibn al-Walid</li>
  <li><strong>Outcome:</strong> Initial Muslim advantage turned to defeat when <strong>archers disobeyed</strong> the Prophet's order</li>
  <li><strong>Losses:</strong> 70 Muslims martyred, including the Prophet's uncle <strong>Hamzah (RA)</strong></li>
  <li><strong>Lesson:</strong> Obedience to the leader is paramount</li>
</ul>

<h2>Battle of the Trench (Khandaq) — 5 AH / 627 CE</h2>
<ul>
  <li>A coalition of 10,000 enemy forces besieged Madinah</li>
  <li>The Prophet ﷺ acted on the advice of <strong>Salman al-Farsi (RA)</strong> to dig a trench</li>
  <li>After a month-long siege, a <strong>windstorm</strong> sent by Allah scattered the coalition</li>
  <li><strong>Significance:</strong> The last major campaign against Madinah; Islam spread rapidly afterward</li>
</ul>
`,
      quiz: [
        {
          question: 'How many Muslims fought at the Battle of Badr?',
          options: [
            { text: '313', correct: true },
            { text: '700', correct: false },
            { text: '1,000', correct: false },
            { text: '10,000', correct: false },
          ],
        },
        {
          question: 'What caused the Muslim defeat at Uhud?',
          options: [
            { text: 'The archers disobeyed the Prophet\'s order to hold their position', correct: true },
            { text: 'The Muslims were outnumbered and weak', correct: false },
            { text: 'The Quraysh used war elephants', correct: false },
            { text: 'There was a sandstorm', correct: false },
          ],
        },
        {
          question: 'Who suggested digging a trench at the Battle of the Trench?',
          options: [
            { text: 'Salman al-Farsi (RA)', correct: true },
            { text: 'Khalid ibn al-Walid (RA)', correct: false },
            { text: 'Abu Bakr as-Siddiq (RA)', correct: false },
            { text: 'Umar ibn al-Khattab (RA)', correct: false },
          ],
        },
        {
          question: 'Which beloved uncle of the Prophet was martyred at Uhud?',
          options: [
            { text: 'Hamzah (RA)', correct: true },
            { text: 'Abu Talib', correct: false },
            { text: 'Al-Abbas (RA)', correct: false },
            { text: 'Abu Lahab', correct: false },
          ],
        },
      ],
    },
    {
      title: 'The Farewell Sermon & Legacy',
      content: `
<h2>The Final Year</h2>
<p>In the 10th year after Hijrah (632 CE), the Prophet ﷺ performed his <strong>only Hajj</strong> — known as <strong>Hajjat al-Wada</strong> (the Farewell Pilgrimage). During this pilgrimage, he delivered the most comprehensive sermon ever given.</p>

<h2>The Farewell Sermon (Khutbat al-Wada)</h2>
<p>Standing at <strong>Mount Arafat</strong>, addressing over 100,000 companions, the Prophet ﷺ said:</p>
<blockquote>
"O people, listen to me carefully. I do not know whether I will ever meet you here again after this year.<br><br>
<strong>Your lives and property are sacred</strong> — as sacred as this day, this month, and this city.<br><br>
<strong>All usury (riba) is abolished</strong> — your capital is yours, do not wrong and you will not be wronged.<br><br>
<strong>Beware of Satan</strong> — he has despaired of being worshipped in this land, but he will be satisfied with being obeyed in your deeds.<br><br>
<strong>O people, your Lord is One, and your father is one.</strong> All of you are from Adam, and Adam was from dust. There is no superiority for an Arab over a non-Arab, nor for a non-Arab over an Arab, except by piety (Taqwa)."
</blockquote>

<h2>The Completion of the Religion</h2>
<p>After the sermon, Allah revealed the final verse of the Quran:</p>
<blockquote><strong>"This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as your religion."</strong> (Surah Al-Ma'idah 5:3)</blockquote>

<h2>The Passing of the Prophet ﷺ</h2>
<p>Shortly after returning to Madinah, the Prophet ﷺ fell ill. He passed away on Monday, the 12th of Rabi' al-Awwal, 11 AH (632 CE), at the age of 63, in the room of his wife Aisha (RA). His last words were: <strong>"With the Supreme Companion (Ar-Rafiq al-A'la)."</strong></p>

<h2>The Enduring Legacy</h2>
<ul>
  <li>He left behind the <strong>Quran and the Sunnah</strong> — the complete guidance for humanity</li>
  <li>Within 100 years, Islam spread from Spain to China</li>
  <li>He transformed a tribal society into a civilization of justice, learning, and compassion</li>
  <li>He is the most influential human being in history, loved by over a billion people today</li>
</ul>
`,
      quiz: [
        {
          question: 'In which year after Hijrah did the Prophet perform his farewell Hajj?',
          options: [
            { text: '10 AH', correct: true },
            { text: '8 AH', correct: false },
            { text: '11 AH', correct: false },
            { text: '9 AH', correct: false },
          ],
        },
        {
          question: 'What was the final revealed verse of the Quran?',
          options: [
            { text: '"This day I have perfected for you your religion..." (5:3)', correct: true },
            { text: '"Today I have completed your faith..." (5:5)', correct: false },
            { text: '"And fear the Day when you will be returned to Allah..." (2:281)', correct: false },
            { text: '"O Prophet, indeed We have sent you as a witness..." (33:45)', correct: false },
          ],
        },
        {
          question: 'According to the Farewell Sermon, what is the basis of superiority?',
          options: [
            { text: 'Piety (Taqwa)', correct: true },
            { text: 'Wealth', correct: false },
            { text: 'Tribal lineage', correct: false },
            { text: 'Knowledge alone', correct: false },
          ],
        },
        {
          question: 'Where did the Prophet ﷺ deliver the Farewell Sermon?',
          options: [
            { text: 'Mount Arafat', correct: true },
            { text: 'Masjid an-Nabawi', correct: false },
            { text: 'Mount Safa', correct: false },
            { text: 'The Kaaba', correct: false },
          ],
        },
      ],
    },
  ],
  'hifdh-ul-quran': [
    {
      title: 'Program Overview & Goal Setting',
      content: `
<h2>Welcome to Quran Hifdh</h2>
<p>This program is designed to help you <strong>memorize the Quran</strong> systematically with the guidance of a qualified teacher. Whether you are starting from scratch or continuing your journey, this structured approach will help you build consistency and achieve your goals.</p>

<blockquote>The Prophet ﷺ said: <strong>"The best among you are those who learn the Quran and teach it"</strong> (Bukhari). You are now embarking on one of the most rewarding journeys a Muslim can undertake.</blockquote>

<h2>How the Program Works</h2>
<ol>
  <li><strong>Weekly live sessions</strong> — one-on-one with your teacher via video call</li>
  <li><strong>Daily memorization targets</strong> — set realistic goals (3-5 ayahs per day for beginners)</li>
  <li><strong>Revision cycles</strong> — structured daily, weekly, and monthly review</li>
  <li><strong>Progress tracking</strong> — your teacher monitors accuracy, tajweed, and fluency</li>
  <li><strong>Assessment milestones</strong> — each Juz completed is formally assessed and signed off</li>
</ol>

<h2>Setting Your First Goal</h2>
<p>Use the SMART framework:</p>
<ul>
  <li><strong>S</strong>pecific — "I will memorize Surah Al-Mulk this month"</li>
  <li><strong>M</strong>easurable — "3 ayahs per day, 6 days per week"</li>
  <li><strong>A</strong>chievable — based on your current schedule</li>
  <li><strong>R</strong>elevant — aligns with your Quran journey</li>
  <li><strong>T</strong>ime-bound — review and adjust weekly with your teacher</li>
</ul>

<h2>Daily Routine Recommendation</h2>
<ul>
  <li><strong>Before Fajr:</strong> Review yesterday's memorization (15 min)</li>
  <li><strong>Morning:</strong> New memorization session (30 min)</li>
  <li><strong>After Asr:</strong> Weekly revision review (15 min)</li>
  <li><strong>Before sleep:</strong> Listening to the target portion (10 min)</li>
</ul>
`,
      quiz: [
        {
          question: 'What is the recommended new memorization time per day?',
          options: [
            { text: '30 minutes', correct: true },
            { text: '15 minutes', correct: false },
            { text: '60 minutes', correct: false },
            { text: '10 minutes', correct: false },
          ],
        },
        {
          question: 'How many ayahs per day are recommended for beginners?',
          options: [
            { text: '3-5 ayahs', correct: true },
            { text: '10-15 ayahs', correct: false },
            { text: '1-2 ayahs', correct: false },
            { text: 'A full page', correct: false },
          ],
        },
        {
          question: 'When is the best time to review yesterday\'s memorization?',
          options: [
            { text: 'Before Fajr', correct: true },
            { text: 'After Isha', correct: false },
            { text: 'During lunch break', correct: false },
            { text: 'Right before bed', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Memorization Methodology',
      content: `
<h2>Proven Memorization Techniques</h2>
<p>Memorizing the Quran is a skill that can be learned and improved with the right techniques. Here are the most effective methods used by Huffaz worldwide.</p>

<h2>1. The Repetition Cycle</h2>
<ol>
  <li><strong>Listen</strong> — listen to the target ayahs 5-10 times from a qualified reciter</li>
  <li><strong>Read</strong> — follow along visually in the Mushaf while listening</li>
  <li><strong>Repeat</strong> — repeat each phrase 10-20 times until fluent</li>
  <li><strong>Connect</strong> — add the previous ayah and repeat the pair 5 times</li>
  <li><strong>Consolidate</strong> — recite the entire page/section 5 times without looking</li>
</ol>

<h2>2. Chunking</h2>
<p>Break longer ayahs into smaller chunks at natural pause points. Memorize each chunk individually, then connect them.</p>

<h2>3. The "Three-Column" Method</h2>
<ul>
  <li><strong>Column 1:</strong> New memorization (today's target)</li>
  <li><strong>Column 2:</strong> Yesterday's review (reinforce before new)</li>
  <li><strong>Column 3:</strong> Weekly revision (previously memorized portions)</li>
</ul>

<h2>4. Audio Reinforcement</h2>
<p>Listen to the portion you are memorizing during commutes, at bedtime (the brain consolidates memory during sleep), and in prayer.</p>

<blockquote>The Prophet ﷺ said: <strong>"The one who is proficient in the Quran will be with the noble, righteous scribes, and the one who recites the Quran and stumbles over it, finding it difficult, will have a double reward"</strong> (Bukhari & Muslim).</blockquote>
`,
      quiz: [
        {
          question: 'How many times should you listen to target ayahs in the repetition cycle?',
          options: [
            { text: '5-10 times', correct: true },
            { text: '1-2 times', correct: false },
            { text: '20-30 times', correct: false },
            { text: 'Until you get bored', correct: false },
          ],
        },
        {
          question: 'What is the benefit of listening to memorization at bedtime?',
          options: [
            { text: 'The brain consolidates memory during sleep', correct: true },
            { text: 'It helps you fall asleep faster', correct: false },
            { text: 'It replaces the need for daytime study', correct: false },
            { text: 'It improves dream recall', correct: false },
          ],
        },
        {
          question: 'What is chunking in the context of Hifdh?',
          options: [
            { text: 'Breaking longer ayahs into smaller chunks at natural pause points', correct: true },
            { text: 'Memorizing multiple surahs at once', correct: false },
            { text: 'Grouping similar ayahs together', correct: false },
            { text: 'Writing ayahs on small cards', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Juz Amma — Surahs 78–93',
      content: `
<h2>Juz Amma: Surahs 78–93</h2>
<p>Juz Amma (the 30th and final Juz of the Quran) contains 37 surahs, mostly short and powerful. We begin with the first half: Surahs 78 through 93.</p>

<h2>Memorization Plan</h2>
<table>
  <tr><th>Surah</th><th>Verses</th><th>Days</th><th>Key Theme</th></tr>
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
  <li>Use the <strong>musical rhythm</strong> — each surah has a unique flow</li>
  <li>Focus on <strong>similar ayahs</strong> — many have repeating patterns</li>
  <li>Learn the <strong>meaning</strong> — understanding anchors the verses in memory</li>
  <li>Recite in <strong>Fajr prayer</strong> — confirm overnight memorization</li>
</ul>
`,
      quiz: [
        {
          question: 'How many surahs are in Juz Amma?',
          options: [
            { text: '37', correct: true },
            { text: '27', correct: false },
            { text: '47', correct: false },
            { text: '20', correct: false },
          ],
        },
        {
          question: 'What is the theme of Surah An-Naba (78)?',
          options: [
            { text: 'The Great News (Resurrection)', correct: true },
            { text: 'The Night Journey', correct: false },
            { text: 'The Creation of Man', correct: false },
            { text: 'The Stories of the Prophets', correct: false },
          ],
        },
        {
          question: 'How many days are recommended to memorize Surah Ad-Duhaa (93)?',
          options: [
            { text: '2 days', correct: true },
            { text: '5 days', correct: false },
            { text: '1 day', correct: false },
            { text: '7 days', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Juz Amma — Surahs 94–114',
      content: `
<h2>Juz Amma: Surahs 94–114</h2>
<p>Continuing through Juz Amma, these shorter surahs are among the most frequently recited in daily prayers. Master them well — they will accompany you throughout your life.</p>

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

<blockquote><strong>Motivation:</strong> Many of these surahs are recited in every prayer. Imagine the reward — every time you recite them in Salah for the rest of your life, each letter is multiplied 10 times in reward!</blockquote>
`,
      quiz: [
        {
          question: 'How many verses does Surah Al-Ikhlas (112) contain?',
          options: [
            { text: '4', correct: true },
            { text: '3', correct: false },
            { text: '5', correct: false },
            { text: '6', correct: false },
          ],
        },
        {
          question: 'Which surah was the first revelation received by the Prophet?',
          options: [
            { text: 'Surah Al-Alaq (96)', correct: true },
            { text: 'Surah Al-Fatihah (1)', correct: false },
            { text: 'Surah Al-Qadr (97)', correct: false },
            { text: 'Surah Al-Muddaththir (74)', correct: false },
          ],
        },
        {
          question: 'What is the theme of Surah At-Takathur (102)?',
          options: [
            { text: 'The Competition for More', correct: true },
            { text: 'The Day of Judgment', correct: false },
            { text: 'The Story of Prophet Musa', correct: false },
            { text: 'The Creation of the Heavens', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Revision Strategy',
      content: `
<h2>The Key to Retention: Consistent Revision</h2>
<p>Memorization without revision is like filling a leaky bucket. The most common reason students lose their Hifdh is the <strong>lack of a structured revision system</strong>.</p>

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
  <li>Use the <strong>"One Juz per Day"</strong> method for those who completed the full Quran</li>
</ul>

<h2>Common Revision Mistakes</h2>
<ul>
  <li><strong>Only looking forward</strong> — always pushing to new material without solidifying old material</li>
  <li><strong>Skipping the "hard pages"</strong> — the ayahs you dislike reviewing are the ones you need most</li>
  <li><strong>Not reciting to someone</strong> — self-reciting hides subtle mistakes</li>
  <li><strong>Inconsistent schedule</strong> — 10 minutes daily beats 2 hours weekly</li>
</ul>
`,
      quiz: [
        {
          question: 'How many tiers are in the revision system?',
          options: [
            { text: '3', correct: true },
            { text: '2', correct: false },
            { text: '4', correct: false },
            { text: '5', correct: false },
          ],
        },
        {
          question: 'What is reviewed in Tier 1 (Daily Revision)?',
          options: [
            { text: 'The most recent 7 days of memorization', correct: true },
            { text: 'All memorization from the current month', correct: false },
            { text: 'All previously memorized Juz', correct: false },
            { text: 'Only the newest ayahs from today', correct: false },
          ],
        },
        {
          question: 'How long should daily revision take?',
          options: [
            { text: '10-15 minutes', correct: true },
            { text: '30-45 minutes', correct: false },
            { text: '5 minutes', correct: false },
            { text: '1 hour', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Juz 29 — Selected Surahs',
      content: `
<h2>Juz 29: Tabarak</h2>
<p>Juz 29 (also known as Tabarak, named after its first surah Al-Mulk) contains 11 surahs, many regularly recited in Salah, especially at night (Qiyam) and in Maghrib and Isha prayers.</p>

<h2>Focus Surahs</h2>

<h3>1. Surah Al-Mulk (67) — 30 verses</h3>
<p><strong>The Sovereignty.</strong> A powerful protector — it intercedes for its reciter and protects from the punishment of the grave. Memorize <strong>3 verses per day</strong> over 10 days.</p>

<h3>2. Surah Al-Qalam (68) — 52 verses</h3>
<p><strong>The Pen.</strong> The second surah revealed in Makkah, focusing on the character of the Prophet ﷺ and the contrast between truth and falsehood.</p>

<h3>3. Surah Al-Haaqqah (69) — 52 verses</h3>
<p><strong>The Inevitable Reality.</strong> Vivid descriptions of the Day of Judgment and the fate of past nations.</p>

<h3>4. Surah Al-Ma'arij (70) — 44 verses</h3>
<p><strong>The Ascending Stairways.</strong> Discusses the angels' ascent and the qualities of those who will be saved.</p>

<blockquote><strong>Tip:</strong> Surahs in Juz 29 are longer than Juz Amma. Increase your daily time allocation to 45-60 minutes for this Juz.</blockquote>
`,
      quiz: [
        {
          question: 'Why is Juz 29 called "Tabarak"?',
          options: [
            { text: 'It begins with Surah Al-Mulk, whose first word is Tabarak', correct: true },
            { text: 'It is the most blessed Juz', correct: false },
            { text: 'The Prophet named it Tabarak', correct: false },
            { text: 'It contains 29 blessings', correct: false },
          ],
        },
        {
          question: 'What is Surah Al-Mulk (67) known to protect from?',
          options: [
            { text: 'The punishment of the grave', correct: true },
            { text: 'Evil eye', correct: false },
            { text: 'Poverty', correct: false },
            { text: 'Illness', correct: false },
          ],
        },
        {
          question: 'How many surahs are in Juz 29?',
          options: [
            { text: '11', correct: true },
            { text: '37', correct: false },
            { text: '7', correct: false },
            { text: '15', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Live Session: Recitation to Teacher',
      content: `
<h2>Preparing for Your Live Session</h2>
<p>Your weekly one-on-one session with the teacher is the <strong>most important component</strong> of the Hifdh program. This is where mistakes are caught, Tajweed is refined, and memorization is solidified.</p>

<h2>Before the Session</h2>
<ul>
  <li><strong>Prepare your portion</strong> — review what you will recite 3-5 times</li>
  <li><strong>Mark difficult spots</strong> — note ayahs where you frequently stumble</li>
  <li><strong>Test yourself</strong> — recite without looking, then check the Mushaf</li>
  <li><strong>Be on time</strong> — join the session 2-3 minutes early</li>
  <li><strong>Prepare questions</strong> — ask about Tajweed rules or similar ayahs</li>
</ul>

<h2>During the Session</h2>
<ul>
  <li><strong>Recite clearly</strong> — even with mistakes, the teacher needs to hear your actual recitation</li>
  <li><strong>Don't rush</strong> — take your time, apply Tajweed rules consciously</li>
  <li><strong>Accept correction gracefully</strong> — each correction is a step toward mastery</li>
  <li><strong>Repeat after correction</strong> — recite the corrected portion 2-3 times</li>
  <li><strong>Record the session</strong> (with permission) for later review</li>
</ul>

<h2>After the Session</h2>
<ul>
  <li><strong>Review corrections</strong> — practice corrected portions before your next session</li>
  <li><strong>Update your revision list</strong> — move corrected ayahs to your "mastered" list</li>
  <li><strong>Note teacher feedback</strong> — keep a running log of Tajweed points</li>
</ul>
`,
      quiz: [
        {
          question: 'How many times should you review your portion before the live session?',
          options: [
            { text: '3-5 times', correct: true },
            { text: '1 time', correct: false },
            { text: '10 times', correct: false },
            { text: 'As many times as possible', correct: false },
          ],
        },
        {
          question: 'What should you do after being corrected by the teacher?',
          options: [
            { text: 'Repeat the corrected portion 2-3 times', correct: true },
            { text: 'Move on to the next ayah', correct: false },
            { text: 'Apologize and continue', correct: false },
            { text: 'Note the correction for later', correct: false },
          ],
        },
        {
          question: 'How early should you join the session?',
          options: [
            { text: '2-3 minutes early', correct: true },
            { text: '10 minutes early', correct: false },
            { text: 'Exactly on time', correct: false },
            { text: '5 minutes early', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Common Mistakes in Hifdh',
      content: `
<h2>Frequently Confused Ayahs</h2>
<p>The Quran contains many parallel passages, especially in stories repeated across different surahs. This lesson covers the most common confusions and strategies to overcome them.</p>

<h2>Types of Similar Ayahs</h2>

<h3>1. Repeated Stories (Full Parallels)</h3>
<p>The story of <strong>Musa (AS) and Pharaoh</strong>, <strong>Adam and Iblis</strong>, and descriptions of <strong>Paradise and Hell</strong> appear in multiple surahs with slight variations.</p>
<p><strong>Strategy:</strong> Create a chart showing details unique to each occurrence. Focus on the opening words — they are usually the key difference.</p>

<h3>2. Identical Beginnings, Different Endings</h3>
<p>Example: <strong>"وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ"</strong> appears 10 times in Surah Al-Mursalat (77), each followed by a different consequence.</p>
<p><strong>Strategy:</strong> Memorize the <strong>connecting word</strong> after the repeated phrase. Create a mental "chain" of what comes next.</p>

<h3>3. One-letter Differences</h3>
<p>Some ayahs differ by just one letter. Physically underline the different letter in your Mushaf. Recite the pair side by side 5 times each.</p>

<h2>Top 5 Most Confused Ayahs</h2>
<ol>
  <li><strong>"وَالسَّمَاءَ بَنَيْنَاهَا"</strong> (51:47) vs <strong>"وَبَنَيْنَا فَوْقَكُمْ سَبْعًا شِدَادًا"</strong> (78:12)</li>
  <li><strong>"إِنَّ الْأَبْرَارَ"</strong> openings in 76:5, 83:18, 83:22 — different continuations</li>
  <li><strong>"يَوْمَ يُنفَخُ فِي الصُّورِ"</strong> in 10+ surahs — all with different continuations</li>
  <li><strong>"الرَّحْمَٰنُ عَلَى الْعَرْشِ اسْتَوَى"</strong> in 6 surahs — each in a different context</li>
</ol>

<blockquote><strong>Golden Rule:</strong> When you encounter a familiar-sounding ayah, <strong>pause</strong> and consciously identify which surah you are in. The context is your strongest memory anchor.</blockquote>
`,
      quiz: [
        {
          question: 'How many times does "وَيْلٌ يَوْمَئِذٍ لِلْمُكَذِّبِينَ" appear in Surah Al-Mursalat?',
          options: [
            { text: '10 times', correct: true },
            { text: '5 times', correct: false },
            { text: '7 times', correct: false },
            { text: '3 times', correct: false },
          ],
        },
        {
          question: 'What is the best strategy for identical beginnings with different endings?',
          options: [
            { text: 'Memorize the connecting word after the repeated phrase', correct: true },
            { text: 'Skip those ayahs', correct: false },
            { text: 'Memorize them last', correct: false },
            { text: 'Only memorize one version', correct: false },
          ],
        },
        {
          question: 'What is the Golden Rule for handling similar ayahs?',
          options: [
            { text: 'Pause and consciously identify which surah you are in', correct: true },
            { text: 'Skip the ayah if it sounds familiar', correct: false },
            { text: 'Always recite from the Mushaf', correct: false },
            { text: 'Ask the teacher every time', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Dua & Spiritual Preparation',
      content: `
<h2>The Spiritual Dimension of Hifdh</h2>
<p>Memorizing the Quran is not merely an intellectual exercise — it is a <strong>spiritual journey</strong> that requires sincerity, humility, and reliance on Allah.</p>

<blockquote>Allah says: <strong>"And We have certainly made the Quran easy to remember, but is there any who will take heed?"</strong> (Surah Al-Qamar 54:17). The key is in <strong>sincerity</strong> and <strong>seeking Allah's help</strong>.</blockquote>

<h2>Recommended Duas for Memorization</h2>

<h3>Before Memorizing</h3>
<p><strong>"اللهم ارزقني حفظ كتابك واتباع سنّة نبيك عليه الصلاة والسلام"</strong></p>

<h3>When Facing Difficulty</h3>
<p><strong>"رب زدني علما"</strong> (Surah Ta-Ha 20:114) — My Lord, increase me in knowledge.</p>

<h3>After Memorizing</h3>
<p><strong>"اللهم اجعل القرآن ربيع قلبي ونور صدري وجلاء حزني وذهاب همي"</strong></p>

<h2>Spiritual Etiquette (Aadaab) of a Hafiz</h2>
<ul>
  <li><strong>Guard your eyes and tongue</strong> — sins weaken the memory</li>
  <li><strong>Act upon what you memorize</strong> — the Quran becomes part of you through practice</li>
  <li><strong>Maintain Wudu</strong> — recite in a state of purity whenever possible</li>
  <li><strong>Face the Qiblah</strong> — even when memorizing, face the direction of prayer</li>
  <li><strong>Weep when appropriate</strong> — the Quran was revealed to move hearts</li>
  <li><strong>Be humble</strong> — knowledge of the Quran is a gift, not an achievement to boast about</li>
  <li><strong>Teach others</strong> — teaching reinforces memorization and earns ongoing reward</li>
</ul>
`,
      quiz: [
        {
          question: 'Which verse should you recite when facing difficulty in memorization?',
          options: [
            { text: '"Rabbi zidni ilma" (My Lord, increase me in knowledge)', correct: true },
            { text: '"Bismillahir Rahmanir Rahim"', correct: false },
            { text: '"Alhamdulillahi Rabbil Alamin"', correct: false },
            { text: '"Inna lillahi wa inna ilayhi rajiun"', correct: false },
          ],
        },
        {
          question: 'What happens to memory when one commits sins according to the lesson?',
          options: [
            { text: 'Sins weaken the memory', correct: true },
            { text: 'Sins have no effect', correct: false },
            { text: 'Sins strengthen the memory', correct: false },
            { text: 'Only major sins affect memory', correct: false },
          ],
        },
        {
          question: 'What is one benefit of teaching others what you have memorized?',
          options: [
            { text: 'It reinforces memorization and earns ongoing reward', correct: true },
            { text: 'It makes you famous', correct: false },
            { text: 'It is faster than memorizing alone', correct: false },
            { text: 'It replaces the need for revision', correct: false },
          ],
        },
      ],
    },
    {
      title: 'Progress Assessment — Juz Amma',
      content: `
<h2>Final Assessment: Juz Amma</h2>
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
  <li>After recitation, the teacher provides <strong>feedback</strong> and areas for improvement</li>
  <li>Upon passing, the teacher will <strong>sign off</strong> on Juz Amma</li>
</ol>

<blockquote><strong>Mabrook on reaching this milestone!</strong> Completing Juz Amma is a tremendous achievement. Remember that the real journey begins now — maintaining what you have memorized through daily revision and continuing to the next Juz.</blockquote>
`,
      quiz: [
        {
          question: 'How many surahs must you recite from memory in the Juz Amma assessment?',
          options: [
            { text: 'All 37 surahs in order', correct: true },
            { text: 'Any 10 surahs', correct: false },
            { text: 'The 5 longest surahs', correct: false },
            { text: 'Only Surah Al-Fatihah and the last 10', correct: false },
          ],
        },
        {
          question: 'What pace should you recite at during the assessment?',
          options: [
            { text: 'Moderate pace (Tadweer)', correct: true },
            { text: 'As fast as possible', correct: false },
            { text: 'Very slow with stops after every word', correct: false },
            { text: 'In a singing tone', correct: false },
          ],
        },
        {
          question: 'What does passing the assessment mean for your teacher?',
          options: [
            { text: 'They sign off on Juz Amma', correct: true },
            { text: 'You can stop memorizing', correct: false },
            { text: 'You get a certificate immediately', correct: false },
            { text: 'You move to a new teacher', correct: false },
          ],
        },
      ],
    },
  ],
};
