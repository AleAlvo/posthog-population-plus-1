import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const applicantDataPath = path.join(__dirname, '../data/applicant.json');

let applicantData = null;

function loadApplicantData() {
  if (!applicantData) {
    const rawData = fs.readFileSync(applicantDataPath, 'utf-8');
    applicantData = JSON.parse(rawData);
  }
  return applicantData;
}

export default async function applicantRoutes(fastify, options) {
  fastify.get('/applicant', async (request, reply) => {
    const data = loadApplicantData();
    return {
      success: true,
      data
    };
  });
}
