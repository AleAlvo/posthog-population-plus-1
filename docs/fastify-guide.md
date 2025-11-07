# Fastify Guide for PostHog Population +1

This guide explains Fastify concepts specifically for this project, assuming you're coming from an Express background or are new to Node.js backend frameworks.

---

## 📖 What is Fastify?

Fastify is a modern, fast web framework for Node.js. Think of it as Express's faster, more feature-rich younger sibling.

**Key differences from Express:**
- 2-3x faster performance
- Built-in input validation using JSON Schema
- Better async/await support
- Plugin-based architecture
- TypeScript-friendly (even in JavaScript projects)

---

## 🚀 Basic Fastify Concepts

### 1. Creating a Fastify Instance

```javascript
// Express way
const express = require('express');
const app = express();

// Fastify way
const fastify = require('fastify');
const app = fastify({
  logger: true  // Built-in request logging (awesome for debugging!)
});
```

**What's happening:**
- `fastify()` creates a new server instance
- `logger: true` automatically logs all requests (method, URL, status, response time)
- The logger uses `pino` under the hood (one of the fastest Node.js loggers)

---

### 2. Defining Routes

```javascript
// Express
app.get('/api/team', (req, res) => {
  res.json({ members: [] });
});

// Fastify - Callback style (similar to Express)
app.get('/api/team', (request, reply) => {
  reply.send({ members: [] });
});

// Fastify - Async/Await style (RECOMMENDED)
app.get('/api/team', async (request, reply) => {
  return { members: [] };  // Auto-serializes to JSON!
});
```

**Key differences:**
- `req` → `request`, `res` → `reply` (just naming convention)
- `reply.send()` instead of `res.json()` (but both work)
- With async functions, you can just `return` data - Fastify auto-converts to JSON
- Errors thrown in async routes are automatically caught and handled

---

### 3. Request and Reply Objects

```javascript
app.get('/api/team/:id', async (request, reply) => {
  // URL parameters
  const memberId = request.params.id;

  // Query parameters (/api/team?filter=active)
  const filter = request.query.filter;

  // Request body (POST/PUT)
  const data = request.body;

  // Headers
  const auth = request.headers.authorization;

  // Set status code
  reply.code(200);

  // Return data (auto-serializes to JSON)
  return { id: memberId, filter };
});
```

**Important:** Request/reply are consistent across all routes, unlike Express where sometimes you have `req.params`, `req.query`, etc.

---

### 4. Middleware vs. Hooks

In Express, you use middleware. Fastify uses **hooks** (more powerful).

```javascript
// Express middleware
app.use((req, res, next) => {
  console.log('Request received');
  next();
});

// Fastify hook (equivalent)
app.addHook('onRequest', async (request, reply) => {
  console.log('Request received');
  // No need for next() - async/await handles flow
});
```

**Common hooks:**
- `onRequest` - Runs at the beginning of the request
- `preHandler` - Runs before the route handler
- `onSend` - Runs before sending the response
- `onResponse` - Runs after the response is sent

**For this project, you'll mainly use:**
- CORS plugin (built-in, no custom middleware needed!)
- Static file serving (if needed)

---

### 5. CORS in Fastify

```javascript
// Express way
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' }));

// Fastify way (using official plugin)
await app.register(require('@fastify/cors'), {
  origin: 'http://localhost:5173'
});
```

**What `register` does:**
- Loads a plugin into Fastify
- Plugins extend Fastify's functionality
- Must use `await` or it won't work properly (common gotcha!)

---

### 6. JSON Schema Validation (Fastify Superpower!)

This is where Fastify really shines - built-in request validation:

```javascript
app.post('/api/team', {
  // Define the expected request structure
  schema: {
    body: {
      type: 'object',
      required: ['name', 'role'],
      properties: {
        name: { type: 'string', minLength: 1 },
        role: { type: 'string' },
        location: { type: 'string' }
      }
    }
  }
}, async (request, reply) => {
  // If we get here, the body is valid!
  const { name, role, location } = request.body;
  return { success: true };
});
```

**Benefits:**
- Automatic validation before your handler runs
- Auto-generated error messages if validation fails
- Documents your API (the schema IS the documentation)
- TypeScript can infer types from schemas

**For this project:**
You probably won't need much validation since you're mostly serving static data, but it's great to know!

---

### 7. Error Handling

```javascript
// Express
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Fastify - Async errors are caught automatically!
app.get('/api/team', async (request, reply) => {
  throw new Error('Something went wrong');  // Fastify catches this!
});

// Custom error handler
app.setErrorHandler(async (error, request, reply) => {
  request.log.error(error);  // Uses built-in logger
  reply.code(500).send({ error: error.message });
});
```

**Key point:** In async routes, thrown errors are automatically caught. No need for try/catch unless you want custom handling.

---

### 8. Starting the Server

```javascript
// Express
app.listen(3001, () => {
  console.log('Server running on port 3001');
});

// Fastify
const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on port 3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

**Important:**
- Fastify's `listen()` returns a Promise, so use `await`
- `host: '0.0.0.0'` allows external connections (important for deployment)
- Wrap in try/catch for startup errors

---

## 🎯 Fastify Structure for This Project

### Recommended File Structure

```
backend/
├── src/
│   ├── server.js           # Main app file
│   ├── routes/
│   │   └── team.js         # Team-related routes
│   ├── services/
│   │   └── scraper.js      # Scraping logic
│   └── plugins/
│       └── cors.js         # CORS configuration
├── data/
│   ├── team.json           # Scraped data
│   └── applicant.json      # Your profile
├── .env
└── package.json
```

### Basic server.js Template

```javascript
const fastify = require('fastify');
const path = require('path');

// Create Fastify instance
const app = fastify({
  logger: true,  // Enable request logging
});

// Register plugins
async function registerPlugins() {
  // CORS
  await app.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  // Static files (if needed)
  await app.register(require('@fastify/static'), {
    root: path.join(__dirname, '../data'),
    prefix: '/data/'
  });
}

// Define routes
app.get('/api/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

// Route with file reading
const fs = require('fs').promises;

app.get('/api/team', async (request, reply) => {
  try {
    const teamData = await fs.readFile(
      path.join(__dirname, '../data/team.json'),
      'utf8'
    );
    return JSON.parse(teamData);
  } catch (error) {
    reply.code(500);
    return { error: 'Failed to load team data' };
  }
});

// Start server
const start = async () => {
  try {
    await registerPlugins();

    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });

    console.log(`🚀 Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

---

## 📦 Essential Fastify Plugins for This Project

Install these:

```bash
npm install fastify @fastify/cors
```

**Optional but useful:**

```bash
npm install @fastify/static    # Serve static files
npm install @fastify/env       # Environment variable validation
```

---

## 🐛 Common Fastify Gotchas

### 1. Forgetting `await` on `register()`

```javascript
// ❌ WRONG - won't work!
app.register(require('@fastify/cors'));

// ✅ CORRECT
await app.register(require('@fastify/cors'));
```

### 2. Not using `host: '0.0.0.0'` for deployment

```javascript
// ❌ WRONG - won't work on Railway/Render
await app.listen({ port: 3001 });

// ✅ CORRECT
await app.listen({ port: 3001, host: '0.0.0.0' });
```

### 3. Mixing callback and async styles

```javascript
// ❌ WRONG - confusing!
app.get('/api/team', async (request, reply) => {
  reply.send({ data: [] });  // Don't mix reply.send() with return
  return { data: [] };
});

// ✅ CORRECT - pick one style
app.get('/api/team', async (request, reply) => {
  return { data: [] };  // Just return!
});
```

---

## 🔗 Official Resources

- [Fastify Documentation](https://fastify.dev/)
- [Fastify Plugins](https://fastify.dev/ecosystem/)
- [Fastify Examples](https://github.com/fastify/fastify/tree/main/examples)

---

## 💡 Quick Reference for This Project

### Reading a JSON file:
```javascript
const fs = require('fs').promises;
const path = require('path');

app.get('/api/team', async (request, reply) => {
  const data = await fs.readFile(
    path.join(__dirname, '../data/team.json'),
    'utf8'
  );
  return JSON.parse(data);
});
```

### Getting a single item by ID:
```javascript
app.get('/api/team/:id', async (request, reply) => {
  const { id } = request.params;
  const data = await fs.readFile(/* ... */);
  const team = JSON.parse(data);

  const member = team.members.find(m => m.id === parseInt(id));

  if (!member) {
    reply.code(404);
    return { error: 'Member not found' };
  }

  return member;
});
```

### CORS for multiple origins:
```javascript
await app.register(require('@fastify/cors'), {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://your-app.vercel.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
});
```

---

**Remember:** Fastify is async-first. Embrace `async/await` and you'll have a great time! 🚀
