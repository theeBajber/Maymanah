# Maymanah - Quranic Learning Platform

Welcome to **Maymanah**, a comprehensive online platform dedicated to Quranic education. Whether you're a student seeking to deepen your understanding of the Quran, a teacher passionate about sharing knowledge, or someone new to Quranic studies, Maymanah connects you with expert volunteer teachers worldwide. Our mission is to make high-quality Quranic education accessible to everyone, regardless of location.


### Key Highlights
- **Global Reach**: Connect with teachers from around the world via live sessions.
- **Personalized Learning**: Tailored mentorship and progress tracking.
- **Certification**: Earn Ijazahs upon course completion.
- **Community Support**: Donate to sustain the platform and help others.

## Features

### For Students
- **Browse Courses**: Explore courses in Tajweed, Hifdh, Arabic, Translation, and Tafsir.
- **Enroll and Learn**: Track progress through lessons and multimedia content.
- **Mentorship**: Schedule 1-on-1 sessions with teachers.
- **Assessments**: Receive AI-powered feedback on recitation and understanding.
- **Messaging**: Communicate directly with your teacher.
- **Bookmarks**: Save and annotate Quran verses.
- **Portal Dashboard**: Access your learning history, settings, and Mushaf (Quran viewer).

### For Teachers
- **Profile Management**: Set availability and bio.
- **Mentorship**: Guide students through personalized sessions.
- **Scheduling**: Manage appointments and recurring availability.
- **Assessments**: Review and provide feedback on student work.
- **Messaging**: Stay connected with students.

### For Administrators
- **User Management**: Oversee accounts and roles.
- **Course Oversight**: Create and manage curriculum.
- **Donation Tracking**: Monitor contributions and payments.

### General Features
- **Secure Authentication**: Login via email/password or OAuth providers.
- **Multi-Language Support**: Interface in English and Arabic.
- **Donation System**: Support the platform with various payment methods (M-Pesa, Card, PayPal, Bank Transfer).
- **Privacy & Terms**: Dedicated pages for privacy policy and terms of service.

## Getting Started

### Prerequisites
- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **pnpm** (package manager) - Install via `npm install -g pnpm`
- **PostgreSQL** (database) - Set up locally or use a cloud service like Supabase
- **Git** - For cloning the repository

### Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/theebajber/Maymanah.git
   cd Maymanah
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Set Up the Database**:
   - Create a PostgreSQL database.
   - Copy `.env.example` to `.env.local` and configure your database URL and other secrets (e.g., NextAuth secret).
   - Run Prisma migrations:
     ```bash
     pnpm prisma migrate dev
     ```
   - Generate Prisma client:
     ```bash
     pnpm prisma generate
     ```

4. **Run the Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup
- Register an account as a student or teacher.
- Explore the home page for courses and information.
- If you're a teacher, set up your profile and availability in the portal.

## Usage Guide

### For New Users
1. **Sign Up**: Visit the register page and create an account.
2. **Explore**: Browse courses on the home page or learn about the platform via the About page.
3. **Enroll**: Choose a course and start learning at your own pace.
4. **Connect**: Request mentorship for personalized guidance.

### For Existing Users
- **Login**: Use your credentials to access the portal.
- **Dashboard**: View your progress, upcoming appointments, and messages.
- **Settings**: Update your profile, timezone, and preferences.
- **Donate**: Support the platform through the Donate page.

### Technical Usage
- **API Endpoints**: Located in `app/api/`, including auth routes and data handlers.
- **Database Queries**: Use Prisma Client for data operations.
- **Styling**: Customize with Tailwind CSS classes.
- **Fonts**: Optimized fonts loaded via Next.js.

## Development

### Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm prisma studio` - Open Prisma Studio for database management

### Project Structure
```
app/
├── (auth)/          # Authentication pages (login, register)
├── (home)/          # Public pages (about, curriculum, donate, etc.)
├── (portal)/        # Protected user area (dashboard, courses, settings)
├── api/             # API routes (auth, register)
├── ui/              # Reusable components (nav, footer, fonts)
lib/                 # Utilities (auth, prisma)
prisma/              # Database schema and migrations
public/              # Static assets
types/               # TypeScript definitions
```

### Contributing
We welcome contributions! Please:
1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test thoroughly.
4. Submit a pull request with a clear description.

For major changes, open an issue first to discuss.

### Testing
- Run tests with `pnpm test` (if configured).
- Ensure all features work across devices.

## Deployment
- **Vercel**: Recommended for Next.js apps. Connect your GitHub repo and deploy automatically.
- **Other Platforms**: Ensure PostgreSQL is available and environment variables are set.
- Build command: `pnpm build`
- Start command: `pnpm start`

## Support & Contact
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/theeBajber/Maymanah/issues).
- **Discussions**: Join community discussions for questions.
- **Email**: Contact us at support@Maymanah.com.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for being part of the Maymanah community. Together, we're making Quranic education accessible to all!
 
 faraj salim ahmed 