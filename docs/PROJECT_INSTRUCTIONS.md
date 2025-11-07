# 🦔 PostHog Population +1 - Project Instructions

**An Interactive Cover Letter Application**

---

## 📋 Project Overview

Build an interactive web application showcasing PostHog's team on a world map, with a creative "New Applicant" section (you!), funny hire/don't hire button interactions, and full PostHog analytics integration.

**Timeline:** 3-4 days of focused work  
**Goal:** Create a memorable, data-driven cover letter that demonstrates frontend, backend, and analytics skills

---

## 🎯 Core Features

### Must-Have (Days 1-3)
- [x] Web scraper for PostHog team data
- [x] Interactive world map with team member markers
- [x] Employee detail cards on marker click
- [x] "New Applicant" section with your profile (Lisbon & Brasília)
- [x] Hire vs Don't Hire buttons with interactions
- [x] Doomsday 404 page for "Don't Hire" clicks
- [x] PostHog analytics tracking all user interactions
- [x] Deployed and publicly accessible

### Nice-to-Have (Day 4+)
- [ ] Analytics dashboard showing user behavior
- [ ] Team visualization filters (by department, tenure, etc.)
- [ ] Animated team growth timeline
- [ ] Easter eggs (Konami code, hidden features)
- [ ] Advanced animations and transitions
- [ ] Session replay showcase

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** (fast, modern build tool)
- **React Router v6** (navigation)
- **Leaflet + React-Leaflet** (map library)
- **Framer Motion** (smooth animations)
- **Recharts** (charts for analytics)
- **TailwindCSS** (utility-first styling)
- **Axios** (HTTP requests)

### Backend
- **Node.js** with **Express** (REST API)
- **Cheerio** (web scraping)
- **Axios** (HTTP requests for scraping)
- **node-cron** (optional: scheduled data updates)

### Database
- **JSON files** (simple, works for static scraped data)
- **Alternative:** Supabase free tier (if you need more features)

### Analytics
- **PostHog Cloud** (free tier: 1M events/month)

### Hosting (All Free)
- **Frontend:** Vercel or Netlify
- **Backend:** Railway or Render free tier
- **Domain:** Use provided subdomain or connect custom domain

---

## 📁 Project Structure

```
posthog-cover-letter/
├── backend/
│   ├── server.js              # Express server
│   ├── scraper.js             # Web scraping logic
│   ├── data/
│   │   └── team.json          # Scraped team data
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── Map.jsx                # Leaflet map component
│   │   │   ├── EmployeeCard.jsx       # Team member card
│   │   │   ├── NewApplicant.jsx       # Your profile section
│   │   │   ├── HireButtons.jsx        # Interactive buttons
│   │   │   └── Doomsday404.jsx        # 404 error page
│   │   ├── pages/
│   │   │   ├── TeamPage.jsx           # Main team view
│   │   │   └── AnalyticsPage.jsx      # Analytics dashboard
│   │   ├── hooks/
│   │   │   └── usePostHog.js          # PostHog initialization
│   │   └── utils/
│   │       └── api.js                 # API utility functions
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── PROJECT_INSTRUCTIONS.md    # This file
└── README.md                  # Project description
```

---

## 🚀 Phase 1: Initial Setup

### Step 1.1: Create Project Directories

```bash
# Create main project folder
mkdir posthog-cover-letter
cd posthog-cover-letter

# Backend setup
mkdir backend
cd backend
npm init -y
npm install express cors cheerio axios dotenv
npm install -D nodemon

# Frontend setup
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom leaflet react-leaflet recharts framer-motion axios posthog-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 1.2: Configure Tailwind CSS

**File: `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        posthog: {
          yellow: '#F9BD2B',
          blue: '#1D4AFF',
          red: '#F54E00',
          purple: '#B62AD9',
        }
      }
    },
  },
  plugins: [],
}
```

**File: `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 1.3: Create Environment Files

**File: `backend/.env`**

```env
PORT=3001
NODE_ENV=development
```

**File: `frontend/.env`**

```env
VITE_API_URL=http://localhost:3001/api
VITE_POSTHOG_KEY=YOUR_POSTHOG_PROJECT_KEY_HERE
```

**File: `backend/.gitignore`**

```
node_modules/
.env
.DS_Store
```

**File: `frontend/.gitignore`**

```
node_modules/
dist/
.env
.env.local
.DS_Store
```

---

## 🕷️ Phase 2: Web Scraping Setup

### Step 2.1: Understand PostHog's Team Page

**BEFORE CODING:** Inspect https://posthog.com/people

1. Open Chrome DevTools (F12)
2. Navigate to Elements tab
3. Find the structure of team member cards
4. Note the CSS selectors for:
   - Name
   - Role/Title
   - Location
   - Avatar image
   - Bio/Description
   - Any other relevant data

### Step 2.2: Create Scraper

**File: `backend/scraper.js`**

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Scrape PostHog team member data from their public team page
 */
async function scrapePostHogTeam() {
  try {
    console.log('🦔 Fetching PostHog team page...');
    
    const { data } = await axios.get('https://posthog.com/people');
    const $ = cheerio.load(data);
    
    const teamMembers = [];
    
    // TODO: ADJUST THESE SELECTORS BASED ON ACTUAL PAGE STRUCTURE
    // Inspect the page first to find correct selectors
    $('.team-member-card').each((index, element) => {
      const $element = $(element);
      
      const member = {
        id: index,
        name: $element.find('.member-name').text().trim(),
        role: $element.find('.member-role').text().trim(),
        location: $element.find('.member-location').text().trim(),
        avatar: $element.find('img').attr('src'),
        bio: $element.find('.member-bio').text().trim(),
        github: $element.find('a[href*="github"]').attr('href'),
        twitter: $element.find('a[href*="twitter"]').attr('href'),
      };
      
      // Only add if we got a name (to filter out empty entries)
      if (member.name) {
        // Add coordinates
        member.coordinates = getCoordinatesForLocation(member.location);
        teamMembers.push(member);
      }
    });
    
    console.log(`✅ Successfully scraped ${teamMembers.length} team members`);
    
    // Save to JSON file
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const outputData = {
      members: teamMembers,
      lastUpdated: new Date().toISOString(),
      totalCount: teamMembers.length
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'team.json'),
      JSON.stringify(outputData, null, 2)
    );
    
    console.log('💾 Data saved to data/team.json');
    return teamMembers;
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    throw error;
  }
}

/**
 * Map location strings to geographic coordinates
 * Add more locations as you discover them in the data
 */
function getCoordinatesForLocation(location) {
  if (!location) return { lat: 0, lng: 0 };
  
  const locationMap = {
    // North America
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Toronto': { lat: 43.6532, lng: -79.3832 },
    'Vancouver': { lat: 49.2827, lng: -123.1207 },
    
    // Europe
    'London': { lat: 51.5074, lng: -0.1278 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
    'Madrid': { lat: 40.4168, lng: -3.7038 },
    'Lisbon': { lat: 38.7223, lng: -9.1393 },
    'Dublin': { lat: 53.3498, lng: -6.2603 },
    'Stockholm': { lat: 59.3293, lng: 18.0686 },
    'Copenhagen': { lat: 55.6761, lng: 12.5683 },
    'Warsaw': { lat: 52.2297, lng: 21.0122 },
    'Prague': { lat: 50.0755, lng: 14.4378 },
    
    // South America
    'Brasília': { lat: -15.8267, lng: -47.9218 },
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Buenos Aires': { lat: -34.6037, lng: -58.3816 },
    
    // Asia
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Seoul': { lat: 37.5665, lng: 126.9780 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    
    // Oceania
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Melbourne': { lat: -37.8136, lng: 144.9631 },
    'Auckland': { lat: -36.8485, lng: 174.7633 },
  };
  
  // Try to match location string to known cities
  for (const [city, coords] of Object.entries(locationMap)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  
  // If no match found, log it for manual review
  console.warn(`⚠️  Unknown location: "${location}" - needs manual mapping`);
  return { lat: 0, lng: 0 };
}

// Allow running as standalone script
if (require.main === module) {
  scrapePostHogTeam()
    .then(() => {
      console.log('✅ Scraping complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    });
}

module.exports = { scrapePostHogTeam };
```

### Step 2.3: Update package.json Scripts

**File: `backend/package.json`** - Add to scripts section:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "scrape": "node scraper.js"
  }
}
```

### Step 2.4: Run Initial Scrape

```bash
cd backend
npm run scrape
```

**IMPORTANT:** After first scrape, manually review `backend/data/team.json`:
- Fix any incorrect data
- Add missing coordinates
- Clean up names/roles
- Remove any test/duplicate entries

---

## 🔧 Phase 3: Backend API

### Step 3.1: Create Express Server

**File: `backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'PostHog Cover Letter API is running! 🦔'
  });
});

app.get('/api/team', (req, res) => {
  try {
    const teamDataPath = path.join(__dirname, 'data', 'team.json');
    
    if (!fs.existsSync(teamDataPath)) {
      return res.status(404).json({ 
        error: 'Team data not found. Run npm run scrape first.' 
      });
    }
    
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
    res.json(teamData);
  } catch (error) {
    console.error('Error loading team data:', error);
    res.status(500).json({ 
      error: 'Failed to load team data',
      message: error.message 
    });
  }
});

app.get('/api/team/:id', (req, res) => {
  try {
    const teamDataPath = path.join(__dirname, 'data', 'team.json');
    const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));
    
    const member = teamData.members.find(m => m.id === parseInt(req.params.id));
    
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    res.json(member);
  } catch (error) {
    console.error('Error loading team member:', error);
    res.status(500).json({ 
      error: 'Failed to load team member',
      message: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
```

### Step 3.2: Test Backend

```bash
cd backend
npm run dev

# In another terminal, test the API:
curl http://localhost:3001/api/health
curl http://localhost:3001/api/team
```

---

## ⚛️ Phase 4: Frontend - Core Components

### Step 4.1: API Utility

**File: `frontend/src/utils/api.js`**

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API methods
export const api = {
  // Get all team members
  getTeam: async () => {
    try {
      const response = await apiClient.get('/team');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch team:', error);
      throw error;
    }
  },

  // Get single team member
  getMember: async (id) => {
    try {
      const response = await apiClient.get(`/team/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch member ${id}:`, error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};

export default api;
```

### Step 4.2: PostHog Hook

**File: `frontend/src/hooks/usePostHog.js`**

```javascript
import { useEffect } from 'react';
import posthog from 'posthog-js';

export function usePostHog() {
  useEffect(() => {
    // Initialize PostHog
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://us.i.posthog.com', // or 'https://eu.i.posthog.com'
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('✅ PostHog loaded');
        }
      },
      autocapture: true, // Automatically capture clicks, pageviews, etc.
      capture_pageview: true,
      capture_pageleave: true,
    });

    // Make PostHog available globally
    window.posthog = posthog;

    // Cleanup
    return () => {
      posthog.reset();
    };
  }, []);

  return posthog;
}
```

### Step 4.3: Map Component

**File: `frontend/src/components/Map.jsx`**

```javascript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import EmployeeCard from './EmployeeCard';

// Fix Leaflet default marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom hedgehog marker icon
const createHedgehogIcon = (isNew = false) => {
  const color = isNew ? '#F54E00' : '#F9BD2B'; // Orange for new, yellow for existing
  
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="${color}" stroke="#000" stroke-width="2"/>
        <circle cx="12" cy="14" r="2" fill="#000"/>
        <circle cx="20" cy="14" r="2" fill="#000"/>
        <path d="M 10 20 Q 16 24 22 20" stroke="#000" stroke-width="2" fill="none"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const hedgehogIcon = createHedgehogIcon(false);
const newHedgehogIcon = createHedgehogIcon(true);

export default function Map({ members, newMembers = [] }) {
  const allMarkers = [
    ...members.map(m => ({ ...m, isNew: false })),
    ...newMembers.map(m => ({ ...m, isNew: true }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '600px', width: '100%' }}
        className="rounded-lg shadow-xl"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {allMarkers.map((member, index) => {
          // Skip if no valid coordinates
          if (!member.coordinates || 
              member.coordinates.lat === 0 && member.coordinates.lng === 0) {
            return null;
          }

          return (
            <Marker
              key={`${member.id}-${index}`}
              position={[member.coordinates.lat, member.coordinates.lng]}
              icon={member.isNew ? newHedgehogIcon : hedgehogIcon}
              eventHandlers={{
                click: () => {
                  window.posthog?.capture('map_marker_clicked', {
                    member_name: member.name,
                    member_role: member.role,
                    is_new_applicant: member.isNew
                  });
                }
              }}
            >
              <Popup>
                <EmployeeCard member={member} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </motion.div>
  );
}
```

### Step 4.4: Employee Card Component

**File: `frontend/src/components/EmployeeCard.jsx`**

```javascript
import { motion } from 'framer-motion';

export default function EmployeeCard({ member }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 max-w-xs"
    >
      {member.avatar && (
        <img
          src={member.avatar}
          alt={member.name}
          className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-posthog-yellow"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.style.display = 'none';
          }}
        />
      )}
      
      <h3 className="font-bold text-lg text-center text-gray-900">
        {member.name}
      </h3>
      
      <p className="text-sm text-gray-600 text-center mt-1">
        {member.role}
      </p>
      
      <p className="text-xs text-gray-500 text-center mt-1 flex items-center justify-center gap-1">
        <span>📍</span>
        <span>{member.location}</span>
      </p>
      
      {member.bio && (
        <p className="text-sm mt-3 text-gray-700 leading-relaxed">
          {member.bio}
        </p>
      )}
      
      {(member.github || member.twitter) && (
        <div className="flex gap-2 justify-center mt-3">
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              GitHub
            </a>
          )}
          {member.twitter && (
            <a
              href={member.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              Twitter
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
```

### Step 4.5: New Applicant Component

**File: `frontend/src/components/NewApplicant.jsx`**

```javascript
import { motion } from 'framer-motion';
import HireButtons from './HireButtons';

export default function NewApplicant() {
  // TODO: Replace with your actual information
  const myProfile = {
    name: 'YOUR NAME',
    role: 'Frontend Engineer (Aspiring PostHog Misfit)',
    email: 'your.email@example.com',
    github: 'https://github.com/yourusername',
    portfolio: 'https://yourportfolio.com',
    locations: [
      { 
        city: 'Lisbon', 
        country: 'Portugal', 
        flag: '🇵🇹', 
        percentage: 60,
        coordinates: { lat: 38.7223, lng: -9.1393 }
      },
      { 
        city: 'Brasília', 
        country: 'Brazil', 
        flag: '🇧🇷', 
        percentage: 40,
        coordinates: { lat: -15.8267, lng: -47.9218 }
      }
    ],
    stats: {
      daysSinceDiscovery: Math.floor(
        (Date.now() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24)
      ),
      commits: 42, // TODO: Update with actual number
      coffeeConsumed: 23, // TODO: Update with actual number
      hoursSpent: 18, // TODO: Update with actual number
      fitProbability: 99.7
    },
    funFacts: [
      'Built this entire app just for this application',
      'Obsessed with clean code and smooth UX',
      'Timezone-agnostic workaholic',
      'Believes in radical transparency'
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-2xl p-8 border-4 border-posthog-yellow"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
          className="inline-block"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
            🎯 New Applicant Detected!
          </h2>
        </motion.div>
        <p className="text-gray-600 text-lg">A wild hedgehog approaches...</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Profile Info */}
        <div className="space-y-4">
          {/* Main Profile Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              {myProfile.name}
            </h3>
            <p className="text-gray-600 mb-4">{myProfile.role}</p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                Locations
              </h4>
              {myProfile.locations.map((loc, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="font-medium">{loc.city}, {loc.country}</span>
                  </span>
                  <span className="text-sm text-gray-500 font-semibold">
                    {loc.percentage}%
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={myProfile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                GitHub
              </a>
              <a
                href={myProfile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Portfolio
              </a>
              <a
                href={`mailto:${myProfile.email}`}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Email
              </a>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h4 className="font-bold mb-4 text-gray-900">Quick Stats 📊</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Days since discovering PostHog:</span>
                <span className="font-bold text-posthog-blue">
                  {myProfile.stats.daysSinceDiscovery}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Commits on this project:</span>
                <span className="font-bold text-posthog-blue">
                  {myProfile.stats.commits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coffee consumed:</span>
                <span className="font-bold text-posthog-blue">
                  {myProfile.stats.coffeeConsumed} cups ☕
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hours spent perfecting:</span>
                <span className="font-bold text-posthog-blue">
                  {myProfile.stats.hoursSpent}h
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <span className="text-gray-600 font-semibold">Probability of good fit:</span>
                <span className="font-bold text-green-600 text-lg">
                  {myProfile.stats.fitProbability}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h4 className="font-bold mb-4 text-gray-900">Fun Facts 🦔</h4>
            <ul className="space-y-2">
              {myProfile.funFacts.map((fact, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-posthog-yellow">▸</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Right Column: Decision Buttons */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center"
        >
          <HireButtons />
        </motion.div>
      </div>
    </motion.div>
  );
}
```

### Step 4.6: Hire Buttons Component

**File: `frontend/src/components/HireButtons.jsx`**

```javascript
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function HireButtons() {
  const navigate = useNavigate();
  const [dontHireAttempts, setDontHireAttempts] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Track component view
    window.posthog?.capture('hire_buttons_viewed');
  }, []);

  const handleHireClick = () => {
    // Track hire button click
    window.posthog?.capture('hire_button_clicked', {
      timestamp: new Date().toISOString()
    });
    
    // Show confetti
    setShowConfetti(true);
    
    // Navigate after a short delay
    setTimeout(() => {
      navigate('/analytics');
    }, 1500);
  };

  const handleDontHireHover = () => {
    const newAttempts = dontHireAttempts + 1;
    setDontHireAttempts(newAttempts);
    
    // Track evasion attempts
    window.posthog?.capture('dont_hire_evaded', { 
      attempt: newAttempts,
      timestamp: new Date().toISOString()
    });
    
    // Move button randomly (gets harder to catch each time)
    const maxMove = 50 + (newAttempts * 30);
    const randomX = (Math.random() - 0.5) * maxMove;
    const randomY = (Math.random() - 0.5) * maxMove;
    
    setButtonPosition({ x: randomX, y: randomY });
  };

  const handleDontHireClick = () => {
    // Track actual click (they finally caught it!)
    window.posthog?.capture('dont_hire_clicked', { 
      attempts: dontHireAttempts,
      timestamp: new Date().toISOString()
    });
    
    // Navigate to doomsday page
    navigate('/doomsday');
  };

  // Button text changes based on attempts
  const getDontHireText = () => {
    if (dontHireAttempts === 0) return "don't hire";
    if (dontHireAttempts === 1) return "are you sure? 🥺";
    if (dontHireAttempts === 2) return "think about it...";
    if (dontHireAttempts === 3) return "please reconsider";
    if (dontHireAttempts >= 4) return "NOOOOO 😭";
    return "don't hire";
  };

  return (
    <div className="relative flex flex-col items-center gap-8 p-8 min-h-[400px]">
      {/* Confetti effect (simple version) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-ping">🎉</div>
        </div>
      )}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          The Decision
        </h3>
        <p className="text-gray-600">Choose wisely...</p>
      </motion.div>

      {/* Hire Button - Big and Inviting */}
      <motion.button
        onClick={handleHireClick}
        onMouseEnter={() => {
          window.posthog?.capture('hire_button_hovered');
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-16 py-5 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-3">
          ✅ HIRE THIS PERSON
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>

      {/* Don't Hire Button - Small, Sad, and Evasive */}
      <div className="relative" style={{ minHeight: '100px' }}>
        <motion.button
          onMouseEnter={handleDontHireHover}
          onClick={handleDontHireClick}
          animate={{ 
            x: buttonPosition.x, 
            y: buttonPosition.y,
            scale: Math.max(0.7, 1 - (dontHireAttempts * 0.05))
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="px-6 py-3 text-sm text-gray-500 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors shadow-md"
        >
          {getDontHireText()}
        </motion.button>
      </div>

      {/* Attempt Counter */}
      {dontHireAttempts > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 mb-2">
            "Don't Hire" escape attempts: <span className="font-bold">{dontHireAttempts}</span>
          </p>
          {dontHireAttempts >= 3 && (
            <p className="text-xs text-red-600 italic">
              Maybe the universe is trying to tell you something... 🤔
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
```

### Step 4.7: Doomsday 404 Page

**File: `frontend/src/components/Doomsday404.jsx`**

```javascript
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Doomsday404() {
  const navigate = useNavigate();

  useEffect(() => {
    // Track doomsday page view
    window.posthog?.capture('doomsday_page_viewed', {
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleReturn = () => {
    window.posthog?.capture('doomsday_return_clicked');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-950 to-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Glitch effect background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-red-500 animate-pulse" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative bg-red-950 border-4 border-red-600 rounded-2xl p-8 max-w-2xl text-center shadow-2xl"
        style={{ boxShadow: '0 0 100px rgba(239, 68, 68, 0.5)' }}
      >
        {/* Error title */}
        <motion.h1
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: [
              '0 0 20px rgba(239, 68, 68, 0.8)',
              '0 0 40px rgba(239, 68, 68, 1)',
              '0 0 20px rgba(239, 68, 68, 0.8)',
            ]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-7xl font-black text-red-500 mb-6"
        >
          ⚠️ ERROR 418 ⚠️
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-red-300 mb-6"
        >
          Alternative Universe Detected
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-red-200 text-lg mb-6"
        >
          In this timeline, you didn't hire <span className="font-bold text-red-400">[YOUR NAME]</span>.
        </motion.p>
        
        {/* Consequences list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/60 backdrop-blur-sm p-6 rounded-xl mb-6 text-left border border-red-800"
        >
          <p className="text-red-300 font-mono mb-4 font-bold">
            Here's what happened in this dark timeline:
          </p>
          <ul className="space-y-3">
            {[
              { icon: '📉', text: "PostHog's bounce rate:", value: '↑ 847%' },
              { icon: '😢', text: 'Developer happiness:', value: '↓ 99%' },
              { icon: '🦔', text: 'Hedgehogs:', value: 'sad and disappointed' },
              { icon: '☕', text: 'Coffee consumption:', value: 'dangerously low' },
              { icon: '🚫', text: 'This page:', value: 'still broken' },
              { icon: '🌍', text: 'World:', value: 'slightly worse place' },
              { icon: '💔', text: 'Your company culture:', value: 'less quirky' },
              { icon: '📊', text: 'Data-driven decisions:', value: '404 not found' },
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-red-200 flex items-start gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <span className="font-medium">{item.text}</span>{' '}
                  <span className="text-red-400 font-bold">{item.value}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* ASCII Art Sad Hedgehog */}
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-red-400 text-xs mb-6 font-mono"
        >
{`
    ⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⡀
    ⢸    SAD HEDGEHOG    ⢸
    ⢸  (you made him cry) ⢸
    ⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁
          ⢀⣠⣤⣤⣀⡀
        ⣠⠞⠁    ⠈⠳⣄
       ⡜⠁   ⣀⣀   ⠈⢧
      ⢸   ⣿⣿⣿   ⢸
       ⠘⣆  ⠉⠉⠉  ⢀⡜
        ⠈⠑⠢⣀⣀⡠⠔⠊
`}
        </motion.pre>

        {/* Return button */}
        <motion.button
          onClick={handleReturn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
        >
          ← Go Back and Fix This Timeline
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-red-400 text-sm mt-6 italic"
        >
          (You can't escape destiny. The hire button awaits...)
        </motion.p>
      </motion.div>

      {/* Floating warning signs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-6xl opacity-20"
          initial={{ y: -100, x: Math.random() * window.innerWidth }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: 360,
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 2,
          }}
        >
          ⚠️
        </motion.div>
      ))}
    </div>
  );
}
```

---

## 📄 Phase 5: Main Pages

### Step 5.1: Team Page

**File: `frontend/src/pages/TeamPage.jsx`**

```javascript
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map from '../components/Map';
import NewApplicant from '../components/NewApplicant';
import { api } from '../utils/api';

export default function TeamPage() {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewApplicant, setShowNewApplicant] = useState(false);

  // Your profile data for the map
  const newApplicantLocations = [
    {
      id: 'me-lisbon',
      name: 'YOUR NAME',
      role: 'Frontend Engineer (Aspiring PostHog Misfit)',
      location: 'Lisbon, Portugal',
      coordinates: { lat: 38.7223, lng: -9.1393 },
      isNew: true
    },
    {
      id: 'me-brasilia',
      name: 'YOUR NAME',
      role: 'Frontend Engineer (Aspiring PostHog Misfit)',
      location: 'Brasília, Brazil',
      coordinates: { lat: -15.8267, lng: -47.9218 },
      isNew: true
    }
  ];

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        
        // Track page view
        window.posthog?.capture('team_page_viewed');
        
        const data = await api.getTeam();
        setTeamData(data);
        
        // Show new applicant section after 3 seconds
        setTimeout(() => {
          setShowNewApplicant(true);
          window.posthog?.capture('new_applicant_revealed');
        }, 3000);
        
      } catch (err) {
        console.error('Failed to load team:', err);
        setError(err.message);
        window.posthog?.capture('team_page_error', { error: err.message });
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="text-8xl mb-6"
          >
            🦔
          </motion.div>
          <p className="text-xl text-gray-700 font-medium">
            Loading the PostHog universe...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gathering hedgehogs from around the world
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md"
        >
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-posthog-yellow via-posthog-red to-posthog-purple mb-3">
              The PostHog Universe
            </h1>
            <p className="text-gray-600 text-lg">
              <span className="font-semibold text-posthog-blue">
                {teamData?.members?.length || 0}
              </span>{' '}
              misfits building amazing products around the world
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">
        {/* Team map */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Map 
            members={teamData?.members || []} 
            newMembers={showNewApplicant ? newApplicantLocations : []}
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-gray-500 mt-4"
          >
            Click on any hedgehog to learn more about team members
          </motion.p>
        </motion.section>

        {/* New applicant section */}
        <AnimatePresence>
          {showNewApplicant && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.8 }}
            >
              <NewApplicant />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">
            Built with ❤️ and lots of ☕ by{' '}
            <span className="font-semibold">YOUR NAME</span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by React, Vite, Leaflet, and PostHog analytics
          </p>
        </div>
      </footer>
    </div>
  );
}
```

### Step 5.2: Analytics Page (Optional)

**File: `frontend/src/pages/AnalyticsPage.jsx`**

```javascript
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [celebrating, setCelebrating] = useState(true);

  useEffect(() => {
    window.posthog?.capture('analytics_page_viewed');
    
    // Stop celebrating after 3 seconds
    setTimeout(() => setCelebrating(false), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Success header */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-12"
        >
          <div className="text-8xl mb-6">
            {celebrating ? '🎉' : '✅'}
          </div>
          <h1 className="text-5xl font-black text-green-700 mb-4">
            Excellent Choice!
          </h1>
          <p className="text-xl text-gray-700">
            The hedgehogs are pleased with your decision.
          </p>
        </motion.div>

        {/* Analytics embed info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-2xl p-8 mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            📊 Behind the Scenes
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            This entire application is being tracked with PostHog analytics! 
            Every click, hover, and interaction is captured to show you 
            real-time insights into how recruiters engage with this cover letter.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-3 text-green-800">
                What's Being Tracked:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Page views and time spent</li>
                <li>✓ Map interactions and clicks</li>
                <li>✓ Employee card views</li>
                <li>✓ Button hover and click events</li>
                <li>✓ "Don't hire" escape attempts</li>
                <li>✓ Navigation patterns</li>
                <li>✓ Device and browser info</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-3 text-blue-800">
                PostHog Features Used:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Custom event tracking</li>
                <li>✓ User journey mapping</li>
                <li>✓ Conversion funnels</li>
                <li>✓ Session recording (optional)</li>
                <li>✓ Real-time dashboards</li>
                <li>✓ User segmentation</li>
              </ul>
            </div>
          </div>

          {/* PostHog dashboard embed */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              <strong>TODO:</strong> Embed your PostHog dashboard here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              In PostHog, go to Dashboards → Share → Get embed code
            </p>
            <a
              href="https://app.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-posthog-yellow text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
            >
              View Live Dashboard in PostHog →
            </a>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-posthog-yellow to-posthog-red text-white rounded-xl shadow-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make This Official?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Let's build amazing things together at PostHog!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:your.email@example.com"
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              📧 Email Me
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              💻 View GitHub
            </a>
            <a
              href="https://yourportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              🌐 Portfolio
            </a>
          </div>
        </motion.div>

        {/* Back button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to team map
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 5.3: Main App Component

**File: `frontend/src/App.jsx`**

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { usePostHog } from './hooks/usePostHog';
import TeamPage from './pages/TeamPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Doomsday404 from './components/Doomsday404';

function App() {
  // Initialize PostHog
  usePostHog();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeamPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/doomsday" element={<Doomsday404 />} />
        <Route path="*" element={<Doomsday404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🚀 Phase 6: PostHog Setup

### Step 6.1: Create PostHog Account

1. Go to https://posthog.com/
2. Click "Get started - free"
3. Choose US or EU cloud
4. Create your account
5. Complete onboarding

### Step 6.2: Get Your Project API Key

1. In PostHog dashboard, click your project name
2. Go to "Project Settings"
3. Copy your "Project API Key" (starts with `phc_`)
4. Add to `frontend/.env`:
   ```
   VITE_POSTHOG_KEY=phc_your_key_here
   ```

### Step 6.3: Create Custom Dashboard (Optional but Recommended)

1. In PostHog, go to "Dashboards"
2. Click "New Dashboard"
3. Name it "Cover Letter Analytics"
4. Add insights:
   - **Total Page Views** (trend of `$pageview` events)
   - **Hire Button Clicks** (trend of `hire_button_clicked` events)
   - **Don't Hire Attempts** (trend of `dont_hire_evaded` events)
   - **Conversion Funnel**: Page View → New Applicant Viewed → Hire Clicked
   - **User Journey**: Path analysis from landing to decision
   - **Top Employee Cards**: Most clicked team members

### Step 6.4: Test PostHog Integration

```bash
cd frontend
npm run dev

# Open browser, check console for "PostHog loaded"
# Interact with the app
# Go to PostHog dashboard and verify events are appearing
```

---

## 📦 Phase 7: Deployment

### Step 7.1: Prepare for Deployment

**Update `backend/server.js` CORS:**

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:3000']
}));
```

**Add to `backend/.env`:**
```
FRONTEND_URL=https://your-app.vercel.app
```

### Step 7.2: Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway auto-detects Node.js
7. Set root directory to `/backend`
8. Add environment variables:
   - `PORT` → 3001
   - `NODE_ENV` → production
   - `FRONTEND_URL` → (will add after frontend deploy)
9. Deploy!
10. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Step 7.3: Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? posthog-cover-letter
# - Directory? ./
# - Override settings? No

# Set environment variables in Vercel dashboard:
# 1. Go to vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings → Environment Variables
# 4. Add:
#    - VITE_API_URL → your Railway URL + /api
#    - VITE_POSTHOG_KEY → your PostHog key

# Deploy to production
vercel --prod
```

### Step 7.4: Update Backend CORS

After frontend is deployed:
1. Go to Railway dashboard
2. Add environment variable:
   - `FRONTEND_URL` → your Vercel URL
3. Redeploy backend

### Step 7.5: Test Production

1. Visit your Vercel URL
2. Test all features:
   - Map loads
   - Employee cards work
   - New applicant appears
   - Buttons work
   - Navigation works
   - PostHog events are tracked
3. Check PostHog dashboard for events

---

## ✅ Testing Checklist

### Functionality
- [ ] Backend scraper runs successfully
- [ ] Backend API returns team data
- [ ] Frontend loads without errors
- [ ] Map displays with markers
- [ ] Clicking markers shows employee cards
- [ ] Employee card data is correct
- [ ] New applicant section appears after delay
- [ ] Hire button redirects to analytics page
- [ ] Don't hire button moves on hover
- [ ] Don't hire button text changes with attempts
- [ ] Doomsday page displays correctly
- [ ] Return button works from doomsday page
- [ ] Navigation between pages works

### PostHog Analytics
- [ ] PostHog loads without errors
- [ ] Page view events are captured
- [ ] Custom events are captured
- [ ] Events have correct properties
- [ ] Events appear in PostHog dashboard

### Performance & UX
- [ ] Page loads in < 3 seconds
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works on different browsers
- [ ] Images load correctly
- [ ] Error states work

### Deployment
- [ ] Backend is live and accessible
- [ ] Frontend is live and accessible
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Production URLs work
- [ ] SSL/HTTPS works

---

## 🐛 Troubleshooting

### Scraper Issues

**Problem:** Scraper returns empty data
**Solution:** 
1. Inspect https://posthog.com/people with DevTools
2. Update CSS selectors in `scraper.js`
3. Check if page structure changed
4. Try different selectors (.class, #id, [data-attribute])

**Problem:** Location coordinates are wrong
**Solution:**
1. Add more cities to `locationMap` in scraper
2. Manually review and fix `team.json`
3. Consider using geocoding API (optional)

### Backend Issues

**Problem:** CORS errors in browser console
**Solution:**
1. Check backend CORS config includes frontend URL
2. Verify environment variables are set
3. Check browser network tab for actual error
4. Try adding `credentials: 'include'` to fetch requests

**Problem:** Backend crashes on startup
**Solution:**
1. Check `data/team.json` exists
2. Run `npm run scrape` first
3. Check all dependencies installed: `npm install`
4. Check logs for specific error

### Frontend Issues

**Problem:** Map doesn't render
**Solution:**
1. Check Leaflet CSS is imported
2. Verify coordinates are valid (lat/lng)
3. Check console for Leaflet errors
4. Ensure container has height set

**Problem:** PostHog not tracking
**Solution:**
1. Verify API key is correct in `.env`
2. Check PostHog console for initialization
3. Verify events in PostHog dashboard (may take a few minutes)
4. Check browser network tab for PostHog requests
5. Disable ad blockers that might block analytics

**Problem:** Buttons don't work
**Solution:**
1. Check console for JavaScript errors
2. Verify React Router is set up correctly
3. Test with `console.log` in event handlers
4. Check if navigation paths match Route components

### Deployment Issues

**Problem:** Backend deployed but not responding
**Solution:**
1. Check Railway logs for errors
2. Verify PORT environment variable
3. Check if backend is actually running
4. Test with direct API call to health endpoint

**Problem:** Frontend can't reach backend
**Solution:**
1. Verify VITE_API_URL is correct in Vercel
2. Check CORS configuration in backend
3. Verify backend is deployed and running
4. Check network tab in browser DevTools

**Problem:** Environment variables not working
**Solution:**
1. In Vercel: Redeploy after adding variables
2. In Railway: Restart service after changes
3. Verify variable names match code exactly
4. Check for typos in variable names

---

## 📝 TODO List

### Must Complete Before Submission
- [ ] Replace "YOUR NAME" placeholders with your actual name
- [ ] Update email, GitHub, portfolio links
- [ ] Update profile stats (commits, hours, etc.)
- [ ] Add your profile photo/avatar
- [ ] Review and clean scraped team data
- [ ] Test all features locally
- [ ] Deploy to production
- [ ] Verify PostHog tracking works
- [ ] Test on mobile devices
- [ ] Share with friends for feedback

### Optional Enhancements
- [ ] Add team filter buttons (by department, location)
- [ ] Create animated team growth timeline
- [ ] Add more easter eggs
- [ ] Implement session replay showcase
- [ ] Add custom PostHog dashboard embed
- [ ] Create "About This Project" modal
- [ ] Add more animations and transitions
- [ ] Optimize images and assets
- [ ] Add dark mode toggle
- [ ] Create shareable link with UTM parameters

### Polish & Optimization
- [ ] Lazy load components
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add error boundaries
- [ ] Improve accessibility (ARIA labels)
- [ ] Add meta tags for SEO
- [ ] Create favicon and app icons
- [ ] Add smooth scroll behavior
- [ ] Test with slow network simulation
- [ ] Add analytics for load times

---

## 📚 Resources

### Documentation
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Leaflet](https://leafletjs.com/)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [PostHog](https://posthog.com/docs)
- [Cheerio](https://cheerio.js.org/)
- [Express](https://expressjs.com/)

### Deployment
- [Vercel](https://vercel.com/docs)
- [Railway](https://docs.railway.app/)
- [PostHog Cloud](https://posthog.com/docs/getting-started/cloud)

### Inspiration
- [PostHog Handbook](https://posthog.com/handbook)
- [PostHog Blog](https://posthog.com/blog)
- [PostHog GitHub](https://github.com/PostHog/posthog)

---

## 🎉 Final Steps Before Submission

1. **Test Everything:** Go through the entire app as a user would
2. **Fix Bugs:** Address any issues you find
3. **Get Feedback:** Show to 2-3 friends and incorporate feedback
4. **Polish:** Add final touches, fix typos, optimize performance
5. **Document:** Add README.md with screenshots
6. **Prepare Email:** Write compelling email to PostHog team
7. **Submit:** Send application with link to live demo

---

## 💌 Example Application Email

```
Subject: Frontend Engineer Application + Interactive Demo

Hi PostHog Team,

I'm [YOUR NAME], a frontend engineer who's been following PostHog's journey and absolutely loves your transparent, quirky culture and developer-first approach.

Rather than sending a traditional cover letter, I built an interactive web application that showcases your team on a world map (with a special "new applicant" section featuring me!). It demonstrates my frontend skills, shows I understand PostHog's product, and proves I can build data-driven experiences.

🔗 Live Demo: [YOUR VERCEL URL]

The app features:
- Real-time PostHog analytics tracking user behavior
- Interactive world map with team member details
- Fun hire/don't hire button interactions
- Full deployment with backend scraping and REST API

Tech stack: React, Vite, Node.js, Express, Leaflet, PostHog SDK, deployed on Vercel + Railway.

I'd love to discuss how I can contribute to PostHog's mission of increasing the number of successful products in the world.

Best regards,
[YOUR NAME]
[YOUR EMAIL]
[YOUR GITHUB]
[YOUR PORTFOLIO]
```

---

## 🦔 Remember

- **Be authentic:** PostHog values genuine personality
- **Show, don't tell:** This project shows your skills better than any resume
- **Have fun:** The joy you put into building this will show
- **Stay quirky:** PostHog appreciates creativity and humor
- **Be transparent:** Like PostHog, be open about your process

---

**Good luck! You've got this! 🚀🦔**

---

## Version History

- **v1.0** - Initial project instructions
- **v1.1** - Added troubleshooting section
- **v1.2** - Enhanced deployment instructions
- **v1.3** - Added example email template

---

*Last updated: [DATE]*
*Author: [YOUR NAME]*
*Project: PostHog Population +1*
