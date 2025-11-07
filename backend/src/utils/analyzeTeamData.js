/**
 * Team Data Analyzer
 *
 * This script reads the teamJSON.txt file and provides a detailed
 * analysis of the team data structure without reading the entire
 * content into memory or Claude's context.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the team JSON file
const teamJsonPath = path.join(__dirname, '../../../teamJSON.txt');

/**
 * Analyze the team data structure
 */
function analyzeTeamData() {
  console.log('🔍 Analyzing PostHog team data...\n');

  try {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(teamJsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    // Get basic stats
    const fileSize = (fs.statSync(teamJsonPath).size / 1024).toFixed(2);
    console.log(`📊 File Size: ${fileSize} KB`);

    // Analyze structure
    console.log(`\n📁 Root Structure:`);
    console.log(`   Keys: ${Object.keys(data).join(', ')}`);

    // Check if we have team members array
    let teamMembers = [];
    if (data.team && data.team.teamMembers) {
      teamMembers = data.team.teamMembers;
      console.log(`\n👥 Team Members: ${teamMembers.length} total`);
    } else if (Array.isArray(data)) {
      teamMembers = data;
      console.log(`\n👥 Team Members: ${teamMembers.length} total`);
    } else {
      console.log('\n⚠️  Unknown data structure - investigating...');
      console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
      return;
    }

    // Analyze first team member to understand structure
    if (teamMembers.length > 0) {
      const sample = teamMembers[0];
      console.log(`\n📋 Available Fields Per Team Member:`);
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        const preview = type === 'object' && value !== null
          ? `{${Object.keys(value).join(', ')}}`
          : type === 'array'
            ? `[${value.length} items]`
            : JSON.stringify(value).substring(0, 30);
        console.log(`   - ${key}: ${type} ${preview}`);
      });

      console.log(`\n🔍 First Team Member Sample:`);
      console.log(JSON.stringify(sample, null, 2).substring(0, 800) + '...\n');
    }

    // Check for geographic data
    console.log(`\n🌍 Geographic Data Check:`);
    const membersWithLocation = teamMembers.filter(m => m.location || m.country);
    const membersWithCoordinates = teamMembers.filter(m =>
      (m.latitude && m.longitude) ||
      (m.coordinates && m.coordinates.lat && m.coordinates.lng)
    );
    console.log(`   - Members with location/country: ${membersWithLocation.length}`);
    console.log(`   - Members with coordinates: ${membersWithCoordinates.length}`);

    // Check location format
    if (membersWithLocation.length > 0) {
      const locationSample = membersWithLocation.slice(0, 5).map(m => ({
        name: m.firstName || m.name,
        location: m.location,
        country: m.country,
        coords: m.latitude ? `${m.latitude},${m.longitude}` : 'none'
      }));
      console.log(`\n   Location samples:`);
      locationSample.forEach(s => {
        console.log(`   - ${s.name}: ${s.location} (${s.country}) [${s.coords}]`);
      });
    }

    // Check for roles
    console.log(`\n💼 Role Data:`);
    const membersWithRole = teamMembers.filter(m => m.role || m.companyRole);
    console.log(`   - Members with role info: ${membersWithRole.length}`);
    if (membersWithRole.length > 0) {
      const roles = [...new Set(membersWithRole.map(m => m.role || m.companyRole))];
      console.log(`   - Unique roles: ${roles.length}`);
      console.log(`   - Sample roles: ${roles.slice(0, 10).join(', ')}`);
    }

    // Check for avatars/images
    console.log(`\n🖼️  Avatar Data:`);
    const membersWithAvatar = teamMembers.filter(m => {
      if (typeof m.avatar === 'string') return true;
      if (m.avatar && m.avatar.url) return true;
      if (m.image || m.photo) return true;
      return false;
    });
    console.log(`   - Members with avatar/image: ${membersWithAvatar.length}`);

    // Data completeness report
    console.log(`\n✅ Data Completeness for Map App:`);
    const requiredFields = {
      'Name': teamMembers.filter(m => m.name || m.firstName).length,
      'Location': membersWithLocation.length,
      'Role': membersWithRole.length,
      'Avatar': membersWithAvatar.length,
      'Bio/Biography': teamMembers.filter(m => m.bio || m.biography).length
    };

    Object.entries(requiredFields).forEach(([field, count]) => {
      const percentage = ((count / teamMembers.length) * 100).toFixed(1);
      const status = percentage > 80 ? '✅' : percentage > 50 ? '⚠️' : '❌';
      console.log(`   ${status} ${field}: ${count}/${teamMembers.length} (${percentage}%)`);
    });

    // What we need for the app
    console.log(`\n📝 Missing for Map Application:`);
    if (membersWithCoordinates.length < membersWithLocation.length) {
      console.log(`   ⚠️  Need to geocode ${membersWithLocation.length - membersWithCoordinates.length} locations`);
      console.log(`       (We have location names but need lat/lng coordinates)`);
    }
    if (membersWithCoordinates.length === teamMembers.length) {
      console.log(`   ✅ All team members have coordinates - ready for map!`);
    }

    // Summary
    console.log(`\n📦 Summary:`);
    console.log(`   - Total team members: ${teamMembers.length}`);
    console.log(`   - Data structure is ${membersWithLocation.length > 0 ? 'GOOD' : 'NEEDS WORK'} for map visualization`);
    console.log(`   - ${membersWithCoordinates.length > 0 ? 'Has' : 'Missing'} coordinate data`);
    console.log(`\n✨ Ready to process this data into team.json!\n`);

  } catch (error) {
    console.error('❌ Error analyzing data:', error.message);
    console.error(error.stack);
  }
}

// Run the analysis
analyzeTeamData();
