# PostHog Population +1 - Project TODO

**Last Updated:** 2025-11-07

---

## 🎯 Project Goal
Interactive map-based application showing PostHog's global team (146 members) + me as the newest applicant.

---

## ✅ Phase 1: Backend Foundation - COMPLETE

- [x] Initialize Fastify project
- [x] Install dependencies (Fastify, CORS, dotenv)
- [x] Create basic server with health check
- [x] Analyze team data structure
- [x] Geocode all team locations (100% success - 30 countries)
- [x] Process and save team.json with coordinates
- [x] Initialize git repository
- [x] Push to GitHub (AleAlvo/posthog-population-plus-1)

---

## 🔄 Phase 2: Backend API - IN PROGRESS

### 2.1 Applicant Profile
- [ ] Create `backend/data/applicant.json` with my profile:
  - Name, role, bio, skills
  - Dual locations (Lisbon + Brasília) with coordinates
  - GitHub, portfolio links
  - Fun facts, stats (commits, coffee consumed, etc.)
  - "Why PostHog" section

### 2.2 API Routes
- [ ] Create `backend/src/routes/team.js`
  - GET `/api/team` - return all team members
  - GET `/api/team/:id` - return single member
  - Add pagination/filtering if needed

- [ ] Create `backend/src/routes/applicant.js`
  - GET `/api/applicant` - return my profile

- [ ] Integrate routes into server.js

### 2.3 Testing
- [ ] Test API endpoints locally
- [ ] Verify CORS works
- [ ] Test with frontend once built

---

## 📦 Phase 3: Frontend Core - NOT STARTED

### 3.1 Project Setup
- [ ] Initialize React + Vite in `frontend/` directory
- [ ] Install dependencies:
  - react-router-dom
  - leaflet + react-leaflet
  - framer-motion
  - axios
  - posthog-js
  - tailwindcss

- [ ] Configure TailwindCSS
- [ ] Setup PostHog brand colors in config
- [ ] Create basic project structure

### 3.2 Map Component
- [ ] Create `MapView` component with Leaflet
- [ ] Add team member markers (146 pins)
- [ ] Add applicant markers (2 pins - Lisbon & Brasília)
- [ ] Implement marker clustering for dense areas
- [ ] Add custom marker icons/colors
- [ ] Animate marker appearance (stagger effect)

### 3.3 Team Member Cards
- [ ] Create `TeamMemberCard` component
- [ ] Display on marker click:
  - Avatar, name, role
  - Location
  - Bio (collapsed/expandable)
  - Teams they're on
  - Fun facts (pineapple on pizza, etc.)

### 3.4 Applicant Section
- [ ] Create `NewApplicant` component
- [ ] Display profile prominently:
  - Dual location indicators
  - Stats (commits, hours, etc.)
  - Skills showcase
  - "Why PostHog" section
- [ ] Pulse/highlight effect on applicant markers
- [ ] Make it visually distinct from team members

---

## 🎮 Phase 4: Interactive Features - NOT STARTED

### 4.1 Hire Buttons
- [ ] Create `HireButtons` component
- [ ] **Hire Button** (easy to click):
  - Large, green, inviting
  - Click → redirect to analytics/success page
  - Confetti animation on click

- [ ] **Don't Hire Button** (evasive):
  - Small, red
  - Moves away on hover
  - Changes text ("Wait...", "Are you sure?", "Really?")
  - Gets smaller over time
  - Eventually becomes nearly impossible to click
  - If clicked → redirect to Doomsday404 page

### 4.2 Doomsday 404 Page
- [ ] Create dark/glitchy error page
- [ ] Show "alternative timeline" consequences
- [ ] List humorous negative outcomes
- [ ] "Fix Timeline" button → go back
- [ ] Glitch effects with CSS/Framer Motion

### 4.3 PostHog Analytics Integration
- [ ] Initialize PostHog SDK
- [ ] Track events:
  - `app_loaded`
  - `team_page_viewed`
  - `team_member_clicked` (with member name)
  - `applicant_section_viewed`
  - `hire_button_clicked`
  - `dont_hire_hover_attempt` (count attempts)
  - `dont_hire_clicked` (if they manage it)
  - `doomsday_page_viewed`
  - `timeline_fixed_clicked`
- [ ] Setup funnel analysis
- [ ] Optional: Analytics dashboard view

### 4.4 Animations
- [ ] Map markers: stagger appearance
- [ ] Applicant markers: pulse effect
- [ ] Cards: slide in on click
- [ ] Page transitions with Framer Motion
- [ ] Hire button: confetti effect
- [ ] Don't hire button: evasion animations

---

## 🎨 Phase 5: Polish & UX - NOT STARTED

### 5.1 Responsive Design
- [ ] Test on mobile devices
- [ ] Adjust map controls for touch
- [ ] Make cards mobile-friendly
- [ ] Ensure buttons work on mobile

### 5.2 Loading States
- [ ] Add loading spinner while fetching data
- [ ] Skeleton screens for cards
- [ ] Map loading placeholder

### 5.3 Error Handling
- [ ] API error handling
- [ ] Failed to load map fallback
- [ ] No data fallback

### 5.4 Performance
- [ ] Optimize map rendering (virtual markers if needed)
- [ ] Lazy load images
- [ ] Code splitting
- [ ] Bundle size optimization

### 5.5 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Alt text for images
- [ ] Focus indicators

---

## 🚀 Phase 6: Deployment - NOT STARTED

### 6.1 Backend Deployment (Railway/Render)
- [ ] Create Railway/Render account
- [ ] Configure deployment
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Test deployed API

### 6.2 Frontend Deployment (Vercel)
- [ ] Build production bundle
- [ ] Create Vercel project
- [ ] Configure environment variables (API URL, PostHog key)
- [ ] Deploy frontend
- [ ] Test production site

### 6.3 Final Configuration
- [ ] Update CORS to allow production frontend URL
- [ ] Verify analytics working in production
- [ ] Test all features end-to-end
- [ ] Check mobile responsiveness

### 6.4 Documentation
- [ ] Update README with:
  - Project description
  - Live demo link
  - Screenshots/GIFs
  - Tech stack
  - Setup instructions
  - Credits
- [ ] Optional: Write blog post about the project

---

## 🎁 Phase 7: Easter Eggs & Extras (Optional)

- [ ] "Save to Favorites" ⭐ button with humorous error (as per CLAUDE.md)
- [ ] Hidden features on team member cards
- [ ] Konami code easter egg
- [ ] Dark mode toggle
- [ ] Team stats visualization
- [ ] Country distribution charts

---

## 📝 Notes

### Current Blockers
- None! Ready to continue with Phase 2.

### Tech Stack Summary
- **Backend:** Node.js + Fastify
- **Frontend:** React + Vite + TailwindCSS
- **Maps:** Leaflet + React-Leaflet
- **Animations:** Framer Motion
- **Analytics:** PostHog
- **Deployment:** Railway (backend) + Vercel (frontend)

### Important Decisions Made
- Using JSON files instead of PostgreSQL (static data, no writes needed)
- North Pole for "world" location (PostHog AI)
- Geocoded 100% of locations successfully

---

## 🎯 Next Immediate Steps

1. **Create applicant.json** with Alexandre's profile
2. **Build API routes** for team and applicant data
3. **Test API endpoints**
4. **Commit backend API changes**
5. **Initialize frontend project**

---

_Track progress by checking off items as you complete them!_
