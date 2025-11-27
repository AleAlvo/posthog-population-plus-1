import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamDataPath = path.join(__dirname, '../data/team.json');

let teamData = null;

function loadTeamData() {
  if (!teamData) {
    const rawData = fs.readFileSync(teamDataPath, 'utf-8');
    teamData = JSON.parse(rawData);
  }
  return teamData;
}

export default async function teamRoutes(fastify, options) {
  fastify.get('/team', async (request, reply) => {
    const data = loadTeamData();
    return {
      success: true,
      data: {
        metadata: data.metadata,
        team: data.team
      }
    };
  });

  fastify.get('/team/:id', async (request, reply) => {
    const { id } = request.params;
    const data = loadTeamData();

    const member = data.team.find(m => m.id === parseInt(id));

    if (!member) {
      return reply.code(404).send({
        success: false,
        error: 'Team member not found'
      });
    }

    return {
      success: true,
      data: member
    };
  });
}
