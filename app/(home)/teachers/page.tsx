import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, MapPin } from "lucide-react";
import { elMessiri } from "@/components/ui/fonts";
import { ArchFrame } from "@/components/ui/arch";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses, ButtonSheen } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Find a Quran Teacher — Ijazah-Verified Volunteers",
  description:
    "Browse vetted, ijazah-verified volunteer teachers of Tajweed, Hifdh, and classical Arabic. Every teacher passes a four-stage review before their first student.",
  alternates: { canonical: "/teachers" },
  openGraph: {
    title: "Find a Quran Teacher | Maymanah",
    description:
      "Vetted, ijazah-verified volunteer teachers of Tajweed, Hifdh, and classical Arabic — book a session, free.",
    url: "/teachers",
  },
};

const teachers = [
  {
    name: "Maher Al-Muaiqly",
    specialty: "Recitation & Tajweed",
    portrait: "/portraits/maher.jpg",
    location: "Makkah",
    languages: "Arabic · English",
    bio: "Guides students from foundational articulation through to riwayah-precise recitation.",
  },
  {
    name: "Yasser Al-Dossari",
    specialty: "Hifdh Mentorship",
    portrait: "/portraits/yasser.jpg",
    location: "Riyadh",
    languages: "Arabic · English",
    bio: "Builds sustainable memorization schedules with a focus on long-term retention.",
  },
  {
    name: "Abdulrahman Al-Sudais",
    specialty: "Advanced Ijazah",
    portrait: "/portraits/sudais.png",
    location: "Makkah",
    languages: "Arabic",
    bio: "Prepares advanced reciters for ijazah with an unbroken chain of transmission.",
  },
  {
    name: "Idris Abkar",
    specialty: "Tajweed & Ijazah",
    portrait: "/portraits/abkar.jpg",
    location: "Abu Dhabi",
    languages: "Arabic · English",
    bio: "Known for patient, detail-first correction of madd and waqf in live recitation.",
  },
  {
    name: "Hazza Al-Balushi",
    specialty: "Youth & Beginners",
    portrait: "/portraits/balushi.jpg",
    location: "Muscat",
    languages: "Arabic · English",
    bio: "Welcomes absolute beginners and younger students into their first surahs.",
  },
  {
    name: "Ustadh Issa",
    specialty: "Arabic Language",
    portrait: "/portraits/pattern-1.png",
    location: "Cairo",
    languages: "Arabic · English · French",
    bio: "Bridges recitation and understanding through classical Arabic grammar.",
  },
];

export default function Teachers() {
  return (
    <main className="flex w-full flex-col items-center gap-16 pb-24">
      <PageHeader
        arabic="أَهْلُ الْقُرْآنِ"
        title="The people of the Quran"
        lede="Every teacher volunteers their time for the sake of Allah, and every one of them has passed our four-stage vetting — ijazah verification, live recitation trial, pedagogical review, and continuous assessment."
      />
      <Reveal className="w-full">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 md:px-8 lg:grid-cols-3">
          {teachers.map((teacher, index) => (
            <TeacherCard key={teacher.name} index={index} {...teacher} />
          ))}
        </section>
      </Reveal>
      <Reveal className="w-full">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-sage">
            Carry knowledge yourself? Join them and make it an ongoing charity.
          </p>
          <Link href="/teach" className={buttonClasses("ghost", "md")}>
            Apply to teach
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </Reveal>
    </main>
  );
}

function TeacherCard({
  name,
  specialty,
  portrait,
  location,
  languages,
  bio,
  index = 0,
}: (typeof teachers)[number] & { index?: number }) {
  return (
    <article
      className="glass-still hover-lift stagger-item group relative flex flex-col items-center gap-4 rounded-2xl p-6 pt-8 text-center hover:border-brass/30"
      style={{ "--i": index } as React.CSSProperties}
    >
      <ArchFrame className="h-44 w-30">
        <Image
          src={portrait}
          alt={`Portrait of ${name}`}
          fill
          sizes="120px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-layl/50 via-transparent to-transparent"
        />
      </ArchFrame>
      <div className="flex flex-col items-center gap-1.5">
        <h2
          className={`${elMessiri.className} text-xl font-semibold text-ivory`}
        >
          {name}
        </h2>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brass">
          {specialty}
        </p>
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-sage/70">
          <span aria-hidden className="size-1.5 rotate-45 bg-brass/70" />
          Ijazah verified
        </p>
      </div>
      <p className="text-[13px] leading-relaxed text-sage">{bio}</p>
      <div className="mt-1 flex items-center gap-4 text-[12px] text-sage/70">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-brass/60" />
          {location}
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-brass/60" />
          {languages}
        </span>
      </div>
      <Link
        href="/register"
        className={buttonClasses("primary", "md", "mt-2 w-full")}
      >
        <ButtonSheen />
        Book a session
      </Link>
    </article>
  );
}
