/**
 * Team Data Processor
 *
 * This script takes the geocoded results and creates the final team.json file
 * with all team members including their coordinates for map visualization.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const teamJsonPath = path.join(__dirname, '../../../teamJSON.txt');
const geocodeResultsPath = path.join(__dirname, '../../../geocode_results.json');
const outputPath = path.join(__dirname, '../data/team.json');

/**
 * Process and format team data with coordinates
 */
function processTeamData() {
  console.log('🔧 Processing PostHog Team Data...\n');
  console.log('═'.repeat(60));

  try {
    // Read original team data
    const teamData = JSON.parse(fs.readFileSync(teamJsonPath, 'utf-8'));
    const teamMembers = teamData.team.teamMembers;

    // Read geocoding results
    const geocodeResults = JSON.parse(fs.readFileSync(geocodeResultsPath, 'utf-8'));
    const locationMap = new Map();

    // Build location lookup map
    geocodeResults.allResults.forEach(result => {
      if (result.success && result.geocoded) {
        const key = `${result.location}|${result.country}`;
        locationMap.set(key, {
          latitude: result.geocoded.lat,
          longitude: result.geocoded.lng,
          formattedAddress: result.geocoded.formattedAddress
        });
      }
    });

    console.log(`📍 Loaded ${locationMap.size} geocoded locations\n`);

    // Process each team member
    let processed = 0;
    let skipped = 0;

    const processedMembers = teamMembers.map(member => {
      const locationKey = `${member.location}|${member.country}`;
      const coords = locationMap.get(locationKey);

      if (coords) {
        processed++;
        return {
          id: member.squeakId,
          name: `${member.firstName} ${member.lastName}`,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.companyRole,
          location: member.location,
          country: member.country,
          latitude: coords.latitude,
          longitude: coords.longitude,
          formattedAddress: coords.formattedAddress,
          avatar: member.avatar?.url || null,
          biography: member.biography,
          color: member.color,
          pronouns: member.pronouns,
          pineappleOnPizza: member.pineappleOnPizza,
          startDate: member.startDate,
          teams: member.teams?.data?.map(t => ({
            id: t.id,
            name: t.attributes?.name,
            slug: t.attributes?.slug
          })) || [],
          leadTeams: member.leadTeams?.data?.map(t => ({
            name: t.attributes?.name
          })) || []
        };
      } else {
        skipped++;
        console.warn(`⚠️  No coordinates found for: ${member.firstName} ${member.lastName} (${member.location}, ${member.country})`);
        return null;
      }
    }).filter(m => m !== null);

    console.log(`✅ Processed ${processed} team members`);
    if (skipped > 0) {
      console.log(`⚠️  Skipped ${skipped} team members (no coordinates)\n`);
    } else {
      console.log('✅ All team members have coordinates!\n');
    }

    // Create final data structure
    const finalData = {
      metadata: {
        totalMembers: processedMembers.length,
        lastUpdated: new Date().toISOString(),
        source: 'posthog.com/people',
        dataVersion: '1.0'
      },
      team: processedMembers
    };

    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    console.log('═'.repeat(60));
    console.log(`\n💾 Team data saved to: ${outputPath}\n`);

    // Print statistics
    console.log('📊 Data Statistics:\n');
    console.log(`   Total team members: ${processedMembers.length}`);

    const countries = [...new Set(processedMembers.map(m => m.country))];
    console.log(`   Countries represented: ${countries.length}`);

    const roles = [...new Set(processedMembers.map(m => m.role))];
    console.log(`   Unique roles: ${roles.length}`);

    const withAvatar = processedMembers.filter(m => m.avatar).length;
    console.log(`   Members with avatars: ${withAvatar}/${processedMembers.length} (${((withAvatar/processedMembers.length)*100).toFixed(1)}%)`);

    const withBio = processedMembers.filter(m => m.biography).length;
    console.log(`   Members with bio: ${withBio}/${processedMembers.length} (${((withBio/processedMembers.length)*100).toFixed(1)}%)`);

    // Sample locations by region
    console.log(`\n🌍 Sample locations by region:\n`);
    const regions = {
      'North America': processedMembers.filter(m => m.country === 'US' || m.country === 'CA'),
      'Europe': processedMembers.filter(m => ['GB', 'DE', 'FR', 'ES', 'NL', 'BE', 'PL', 'NO', 'DK', 'AT', 'FI', 'IE', 'CZ', 'HR', 'HU', 'BG', 'GR'].includes(m.country)),
      'South America': processedMembers.filter(m => ['BR', 'AR', 'UY', 'CL', 'CO'].includes(m.country)),
      'Other': processedMembers.filter(m => !['US', 'CA', 'GB', 'DE', 'FR', 'ES', 'NL', 'BE', 'PL', 'NO', 'DK', 'AT', 'FI', 'IE', 'CZ', 'HR', 'HU', 'BG', 'GR', 'BR', 'AR', 'UY', 'CL', 'CO'].includes(m.country))
    };

    Object.entries(regions).forEach(([region, members]) => {
      console.log(`   ${region}: ${members.length} members`);
    });

    console.log('\n═'.repeat(60));
    console.log('\n✨ Ready for the API!\n');
    console.log('🎯 Next steps:');
    console.log('   1. Create API routes to serve team data');
    console.log('   2. Create applicant.json with your profile');
    console.log('   3. Test the API endpoints\n');

  } catch (error) {
    console.error('❌ Error processing data:', error.message);
    console.error(error.stack);
  }
}

// Run the processor
processTeamData();
