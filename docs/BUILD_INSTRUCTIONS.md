# 🦔 PostHog Cover Letter - Quick Build Guide

**Goal:** Build an interactive cover letter app for PostHog in 3-4 days

---

## 📋 Quick Start Checklist

### Day 1: Backend & Data ✅
- [ ] Initialize backend with Express
- [ ] Create scraper for posthog.com/people
- [ ] Test scraper and fix selectors
- [ ] Create applicant.json with YOUR info
- [ ] Deploy backend to Railway

### Day 2: Frontend Core ✅
- [ ] Initialize React + Vite project
- [ ] Setup Tailwind CSS
- [ ] Build Map component with Leaflet
- [ ] Create EmployeeCard component
- [ ] Integrate PostHog analytics

### Day 3: Fun Interactions ✅
- [ ] Build NewApplicant section
- [ ] Create HireButtons with evasion logic
- [ ] Build Doomsday404 page
- [ ] Add Framer Motion animations
- [ ] Deploy to Vercel

### Day 4: Polish (Optional) ⭐
- [ ] Analytics dashboard
- [ ] Advanced visualizations
- [ ] Easter eggs
- [ ] Performance optimization

---

## 🚀 Essential Commands

```bash
# Backend
cd backend
npm install express cors cheerio axios dotenv
npm run scrape              # Scrape team data
npm run dev                 # Start server

# Frontend
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom leaflet react-leaflet framer-motion axios posthog-js recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev                 # Start dev server

# Deployment
vercel                      # Deploy frontend
```

---

## 🔑 Critical Files to Update

### 1. Your Profile Data (`backend/data/applicant.json`)
```json
{
  "name": "YOUR FULL NAME HERE",
  "role": "Product Engineer (Aspiring PostHog Misfit)",
  "email": "your.email@example.com",
  "github": "https://github.com/yourusername",
  "locations": [
    {
      "city": "Lisbon",
      "country": "Portugal",
      "flag": "🇵🇹",
      "coordinates": { "lat": 38.7223, "lng": -9.1393 },
      "percentage": 60
    },
    {
      "city": "Brasília",
      "country": "Brazil", 
      "flag": "🇧🇷",
      "coordinates": { "lat": -15.8267, "lng": -47.9218 },
      "percentage": 40
    }
  ],
  "bio": "Your compelling bio here...",
  "whyPostHog": "Why you want to work at PostHog..."
}
```

### 2. Environment Variables

**Backend `.env`:**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_POSTHOG_KEY=phc_YOUR_KEY_HERE
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 🎯 Core Features Explained

### 1. Team Map
- Shows PostHog team members on world map
- Clickable markers with employee details
- Scraped from posthog.com/people

### 2. New Applicant Section
- Your profile with 2 locations (Lisbon & Brasília)
- Stats: commits, coffee consumed, fit probability
- Skills, fun facts, "why PostHog"

### 3. Hire/Don't Hire Buttons
- **Hire button**: Big, green, easy to click → redirects to analytics
- **Don't hire button**: Small, moves away on hover, changes text
- Tracks all interaction attempts with PostHog

### 4. Doomsday 404
- Dark, glitchy page showing "alternative universe"
- Lists consequences of not hiring you
- Button to go back and fix the timeline

### 5. PostHog Analytics
- Tracks every interaction
- Page views, button clicks, time on page
- Shows funnel: Visit → View Profile → Hire

---

## 🚨 Common Issues & Quick Fixes

### Scraper Returns Empty Data
```bash
# Inspect posthog.com/people in browser DevTools first
# Update selectors in scraper.js to match actual HTML structure
```

### Map Doesn't Display
```javascript
// Make sure to import Leaflet CSS in component:
import 'leaflet/dist/leaflet.css';

// Verify coordinates are valid numbers (not strings or null)
```

### PostHog Not Tracking
```javascript
// Check browser console for errors
// Verify API key is correct
// Make sure PostHog initializes before tracking events
console.log('PostHog loaded:', window.posthog);
```

### CORS Errors
```javascript
// In backend/server.js:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

---

## 📊 PostHog Setup

1. Go to https://posthog.com/
2. Sign up for free
3. Create project: "Cover Letter App"
4. Copy Project API Key (starts with `phc_`)
5. Add to frontend `.env` file

**Events to Track:**
- `app_loaded` - Initial page load
- `team_page_viewed` - Main page view
- `team_member_marker_clicked` - Clicked team member
- `new_applicant_section_viewed` - Saw your profile
- `hire_button_clicked` - Clicked hire (success!)
- `dont_hire_hover_attempt` - Tried to click don't hire
- `dont_hire_clicked` - Actually clicked don't hire
- `doomsday_page_viewed` - Reached error page
- `doomsday_return_clicked` - Went back from error page

---

## 🎨 Design Tips

### Colors (PostHog Brand)
```javascript
{
  yellow: '#F9BD2B',
  blue: '#1D4AFF',
  red: '#F54E00',
  purple: '#B62AD9',
}
```

### Animations
- Use Framer Motion for smooth transitions
- Stagger marker appearances on map
- Pulse effect on new applicant markers
- Confetti on hire button click

### Mobile Responsive
- Test on mobile devices
- Use Tailwind's responsive classes (`md:`, `lg:`)
- Ensure map works on touch devices

---

## 🚢 Deployment

### Backend (Railway)
1. Connect GitHub repo
2. Select backend folder
3. Add environment variable: `FRONTEND_URL=https://your-app.vercel.app`
4. Copy deployment URL

### Frontend (Vercel)
1. Run `vercel` in frontend directory
2. Add environment variables in dashboard
3. Update `VITE_API_URL` to Railway URL
4. Redeploy: `vercel --prod`

---

## ✅ Pre-Submission Checklist

- [ ] All personal info updated (name, email, GitHub)
- [ ] PostHog analytics working
- [ ] Tested on mobile
- [ ] No console errors
- [ ] Fast load times (<3 seconds)
- [ ] All buttons work
- [ ] Doomsday page displays correctly
- [ ] Deployed and accessible
- [ ] README created
- [ ] No sensitive data in code

---

## 📧 Application Email Template

```
Subject: Product Engineer Application - Interactive Cover Letter

Hi PostHog team,

I'm applying for the Product Engineer role. Instead of a traditional 
cover letter, I built an interactive web app that:

✅ Maps your team globally (scraped from your /people page)
✅ Introduces me as a "new applicant" with Lisbon/Brasília markers
✅ Has funny hire/don't hire button interactions
✅ Tracks everything with PostHog analytics (meta!)

👉 Check it out: [YOUR VERCEL URL]

Technical highlights:
- Full-stack: React/Node.js
- Web scraping with Cheerio
- Interactive maps with Leaflet
- Analytics with PostHog SDK
- Deployed on Vercel + Railway

I built this to demonstrate not just coding skills, but product 
thinking, creativity, and cultural fit with PostHog's values.

Would love to discuss how I can help increase the number of 
successful products in the world!

Best,
[Your Name]

P.S. Try the "don't hire" button - it's intentionally difficult 😄
```

---

## 🎯 Why This Works

**For PostHog:**
- ✅ Shows product engineering mindset
- ✅ Demonstrates full-stack skills
- ✅ Uses their own product (PostHog)
- ✅ Embraces their culture (quirky, data-driven, transparent)
- ✅ Goes beyond traditional applications

**For You:**
- ✅ Learn web scraping
- ✅ Master interactive maps
- ✅ Practice full-stack development
- ✅ Understand analytics implementation
- ✅ Build portfolio piece

---

## 💡 Success Tips

1. **Start with MVP**: Get basic functionality working first
2. **Test frequently**: Don't wait until the end
3. **Be authentic**: Let your personality shine
4. **Have fun**: Enjoy the building process
5. **Ship it**: Done is better than perfect

---

## 📚 Quick Links

- [Full PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md) - Detailed guide
- [PostHog Docs](https://posthog.com/docs)
- [React Leaflet Docs](https://react-leaflet.js.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)

---

**Ready to build? Let's go! 🚀🦔**

*Reference the detailed PROJECT_INSTRUCTIONS.md for step-by-step code examples and troubleshooting.*
