import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import teamRoutes from './routes/team.js';
import applicantRoutes from './routes/applicant.js';

dotenv.config();

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
});

await fastify.register(teamRoutes, { prefix: '/api' });
await fastify.register(applicantRoutes, { prefix: '/api' });

fastify.get('/api/health', async () => {
  return {
    status: 'ok',
    message: 'PostHog Population +1 API is running! 🦔',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };
});

fastify.get('/', async () => {
  return {
    message: 'Welcome to PostHog Population +1 API',
    documentation: 'Visit /api/health to check server status',
    version: '1.0.0'
  };
});

const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
╔════════════════════════════════════════════════════════╗
║  🚀 Server is running!                                 ║
║                                                        ║
║  Local:   http://localhost:${port}                       ║
║  Health:  http://localhost:${port}/api/health            ║
║                                                        ║
║  Press Ctrl+C to stop                                  ║
╚════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
