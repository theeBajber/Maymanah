import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faChartLine,
  faStar,
  faArrowRight,
  faBullhorn,
  faGlobe,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default async function Dash() {
  const session = await auth();

  const [enrollmentCount, profile] = await Promise.all([
    prisma.enrollment.count({
      where: { userId: session?.user?.id, status: "ACTIVE" },
    }),
    prisma.profile.findUnique({
      where: { userId: session?.user?.id },
    }),
  ]);

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
      {/* Header */}
      <section className="mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-primary font-bold uppercase tracking-widest">
            Student Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">
            Dashboard
          </h1>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="bg-bg-card border border-border rounded-xl p-8 md:p-12 relative overflow-hidden group shadow-sm">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-primary"
                style={{ fontSize: "8rem" }}
              />
            </div>

            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-text-primary mb-1">
                  Welcome, {session?.user?.name}
                </h2>
                <p className="text-text-secondary">
                  Your role:{" "}
                  <span className="text-primary font-bold">
                    {session?.user?.role}
                  </span>
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent mb-8" />

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faBullhorn}
                      className="text-primary size-6!"
                    />
                    Announcement
                  </h3>
                  <div className="bg-bg-primary border border-border rounded-2xl p-5">
                    <p className="text-text-secondary font-medium">
                      Portal coming soon. Stay tuned!
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    className="bg-primary text-text-inverse font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:bg-primary-light active:scale-95 transition-all shadow-lg shadow-primary/20"
                    href={"/curriculum"}
                  >
                    Explore Courses
                    <FontAwesomeIcon icon={faArrowRight} className="size-4!" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-bg-card border border-border rounded-xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-muted flex items-center justify-center text-primary shrink-0">
                <FontAwesomeIcon icon={faBookOpen} className="size-6!" />
              </div>
              <div>
                <p className="text-text-tertiary text-sm font-medium mb-0.5">
                  Curriculum
                </p>
                <p className="text-text-primary font-bold text-lg">
                  {enrollmentCount} Module{enrollmentCount !== 1 ? "s" : ""}{" "}
                  Active
                </p>
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-xl p-6 flex items-start gap-4 hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-muted flex items-center justify-center text-primary shrink-0">
                <FontAwesomeIcon icon={faChartLine} className="size-6!" />
              </div>
              <div>
                <p className="text-text-tertiary text-sm font-medium mb-0.5">
                  Progress
                </p>
                <p className="text-text-primary font-bold text-lg">
                  {profile?.quranLevel
                    ? profile.quranLevel.charAt(0).toUpperCase() +
                      profile.quranLevel.slice(1)
                    : "Level 1 — Initiate"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full">
            {/* Image */}
            <div className="h-48 relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJdXNwp9xbYpzhC9XcY2Joxhs9YWVSguXxhVjs2bgAt9AI5qxue_HE-YFacROURqShp9Pj4S0sbDuxY7yzuP4uO-ZdkwW5PeXKoeJO0DOAN5kBNsr-wR4zFo8ZlT1zF5_6xrJqj-CzcwDzRmYxKCajAW3hlN42yn2geaaRSTJtyP_XVreR5LYEHGwTmsUDAUyYnaykpc9mf2iQwpoYuZI6ZF-DeGhFf5aNIItRlFV1aUhjgNpxNKecjxbZbl_Ij_ynw0hCS2mJZ82Y"
                alt="Spiritual Sanctuary"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-bg-card to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-text-primary mb-3">
                Spiritual Journey
              </h3>
              <p className="text-text-secondary text-sm mb-6 italic leading-relaxed">
                &ldquo;Seeking knowledge is a mandatory path for every explorer
                of truth.&rdquo;
              </p>

              <div className="space-y-3">
                {[
                  { icon: faStar, label: "Weekly Wisdom Series" },
                  { icon: faGlobe, label: "Global Community Access" },
                  { icon: faRoute, label: "Interactive Learning Paths" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={icon}
                      className="text-primary text-sm w-4"
                    />
                    <span className="text-sm font-medium text-text-secondary">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
