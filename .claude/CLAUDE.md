# PostHog Population +1 - Project Memory

**Project Type:** Interactive cover letter web application for PostHog job application
**Developer:** Alexandre Alvaro
**Goal:** Create a memorable, data-driven cover letter demonstrating full-stack and analytics skills

---

## 🎯 Project Overview

This is an interactive web application that:
- Displays PostHog's team members on an interactive world map
- Showcases the applicant (Alexandre) as a "new applicant" with dual locations (Lisbon & Brasília)
- Features creative hire/don't-hire button interactions
- Tracks all user interactions with PostHog analytics
- Demonstrates full-stack development, UI/UX design, and product thinking

**Reference Documents:**
- See @docs/BUILD_INSTRUCTIONS.md for quick-start checklist
- See @docs/PROJECT_INSTRUCTIONS.md for detailed implementation guide
- See @docs/fastify-guide.md for Fastify-specific guidance

---

## 👨‍💻 Developer Context

### Experience Level
- **Fastify:** New/Learning - Always explain Fastify concepts, patterns, and best practices
- **React:** Proficient
- **Node.js:** Proficient
- **PostHog Analytics:** Learning

### Learning Approach Preferences
When introducing new technologies or concepts:
1. Explain what it does and why we're using it
2. Show code examples with inline comments
3. Compare to familiar alternatives when relevant
4. Highlight common pitfalls
5. Reference official documentation when appropriate

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (latest LTS)
- **Framework:** Fastify (chosen for modern API, performance, and built-in validation)
- **Scraping:** Cheerio + Axios
- **Data Storage:** JSON files (intentional choice - see Architecture Decisions below)

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** TailwindCSS
- **Maps:** Leaflet + React-Leaflet
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Analytics:** PostHog SDK

### Deployment
- **Backend:** Railway or Render
- **Frontend:** Vercel
- **Analytics:** PostHog Cloud (free tier)

---

## 🏗️ Architecture Decisions

### Why JSON Files Instead of PostgreSQL?

**Decision:** Use JSON file storage for team and applicant data.

**Rationale:**
- **Static Data:** Team member data is scraped periodically with no user writes
- **No Relational Queries:** All data access is simple key-value or array filtering
- **Simplicity:** Faster development, simpler deployment (no managed database service)
- **Performance:** In-memory caching makes reads incredibly fast
- **Cost:** Zero database costs for deployment
- **Appropriate Scale:** ~50-100 team members doesn't require database overhead

**When We Would Use PostgreSQL:**
- User-generated content (comments, ratings, guest book)
- Frequent writes and updates
- Complex joins and relational queries
- Multi-user concurrent writes
- Data that needs ACID guarantees

**Comedic Feature:** The app includes a "Save to Favorites" ⭐ button on employee cards that playfully acknowledges this decision:
- User clicks "Save to Favorites" on a team member
- Button shows loading state (simulating database operation)
- Error modal appears with humorous message explaining why it can't work with JSON files
- Demonstrates self-awareness about architectural choices
- Shows personality and PostHog culture fit
- All interactions tracked with PostHog analytics

**Error Message Concept:**
```
❌ OPERATION FAILED

You tried to save a favorite, but this app runs on:
📄 Plain old JSON files
❌ Not a fancy PostgreSQL database

Why? Team data is static (no writes needed)
Over-engineering isn't engineering. It's procrastination.

Want to really show support? Click the HIRE button! 😉

📊 This failed attempt was tracked by PostHog.
```

**Alternative Schema Design (If We Used PostgreSQL):**
```sql
-- What the schema would look like if needed:
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_location ON team_members(location);
CREATE INDEX idx_name ON team_members(name);
```

---

## 📁 Project Structure

```
posthog-population+1/
├── backend/                    # Fastify API server
│   ├── src/
│   │   ├── server.js          # Main Fastify application
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic (scraper, etc.)
│   │   └── utils/             # Helper functions
│   ├── data/
│   │   ├── team.json          # Scraped PostHog team data
│   │   └── applicant.json     # Alexandre's profile data
│   ├── .env                   # Environment variables (git-ignored)
│   └── package.json
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   ├── .env                   # Environment variables (git-ignored)
│   └── package.json
│
├── docs/                       # Project documentation
│   ├── BUILD_INSTRUCTIONS.md  # Quick build guide
│   ├── PROJECT_INSTRUCTIONS.md # Detailed instructions
│   └── fastify-guide.md       # Fastify reference for this project
│
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md              # This file - project memory
│   └── settings.json          # Shared project settings
│
├── .gitignore
└── README.md                   # Project description
```

---

## 💻 Development Conventions

### Code Style
- **JavaScript:** ES6+ syntax, async/await for promises
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes for strings, double quotes in JSX
- **Semicolons:** Use them consistently
- **Naming:**
  - camelCase for variables and functions
  - PascalCase for React components
  - UPPER_SNAKE_CASE for constants and env variables

### File Organization
- One component per file
- Group related components in subdirectories
- Keep components small and focused (< 200 lines ideally)
- Extract complex logic into custom hooks or utility functions

### Git Workflow
- Descriptive commit messages
- Commit frequently with logical units of work
- Never commit `.env` files or secrets
- Keep commits focused on single features/fixes

---

## 🔧 Common Commands

### Backend (Fastify)
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start development server (with auto-reload)
npm run scrape          # Run PostHog team scraper
npm start               # Start production server
npm test                # Run tests (when implemented)
```

### Frontend (React + Vite)
```bash
cd frontend
npm install             # Install dependencies
npm run dev             # Start development server (usually http://localhost:5173)
npm run build           # Build for production
npm run preview         # Preview production build locally
npm run lint            # Run ESLint
```

---

## 📝 Important Notes

### Personal Information to Update
Before deployment, replace all placeholders:
- `YOUR NAME` → Alexandre Alvaro
- `your.email@example.com` → Your actual email
- `https://github.com/yourusername` → Your GitHub URL
- `https://yourportfolio.com` → Your portfolio URL
- Profile stats (commits, hours spent, etc.)

### Environment Variables

**Backend `.env`:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_POSTHOG_KEY=your_posthog_project_key
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

### Security Considerations
- Never commit `.env` files
- Validate all API inputs (use Fastify's built-in validation)
- Sanitize scraped data before displaying
- Use CORS properly to restrict API access
- Be mindful of rate limiting when scraping

---

## 🎨 Design Guidelines

### PostHog Brand Colors
```javascript
{
  yellow: '#F9BD2B',   // Primary brand color
  blue: '#1D4AFF',     // Secondary
  red: '#F54E00',      // Accent
  purple: '#B62AD9',   // Accent
}
```

### UI/UX Principles
- **Be playful:** PostHog appreciates creativity and humor
- **Be transparent:** Show your process and reasoning
- **Be quirky:** Add personality and unexpected interactions
- **Be data-driven:** Everything should be tracked and measured
- **Mobile-first:** Ensure responsive design

---

## 🚀 Development Phases

### Phase 1: Backend Foundation ✅
1. Initialize Fastify project
2. Create scraper for posthog.com/people
3. Build REST API endpoints
4. Test with sample data

### Phase 2: Frontend Core ⏳
1. Initialize React + Vite project
2. Set up Tailwind CSS
3. Build Map component with Leaflet
4. Create EmployeeCard component
5. Integrate PostHog analytics

### Phase 3: Interactive Features ⏳
1. Build NewApplicant section
2. Create HireButtons with evasion logic
3. Build Doomsday404 page
4. Add animations with Framer Motion

### Phase 4: Polish & Deploy ⏳
1. Test all features thoroughly
2. Optimize performance
3. Deploy backend (Railway)
4. Deploy frontend (Vercel)
5. Verify analytics tracking

---

## 📚 Learning Resources

When explaining concepts, reference:
- [Fastify Official Docs](https://fastify.dev/)
- [React Docs](https://react.dev/)
- [PostHog Docs](https://posthog.com/docs)
- [Leaflet Docs](https://leafletjs.com/)

---

## 🔄 This Document

This CLAUDE.md file should be updated as the project evolves:
- Mark phases as complete
- Add new conventions or patterns discovered
- Document decisions and rationale
- Add troubleshooting tips learned along the way

**Last Updated:** 2025-11-05
**Current Phase:** Phase 1 - Backend Foundation
