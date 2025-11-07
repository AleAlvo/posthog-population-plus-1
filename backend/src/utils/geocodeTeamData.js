/**
 * Team Data Geocoder with Verification
 *
 * This script:
 * 1. Reads team data and identifies all unique locations
 * 2. Flags potentially problematic locations
 * 3. Geocodes each location to get coordinates
 * 4. Reverse geocodes to verify accuracy
 * 5. Reports any mismatches for manual review
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NodeGeocoder from 'node-geocoder';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const teamJsonPath = path.join(__dirname, '../../../teamJSON.txt');

// Initialize geocoder (using OpenStreetMap - free, no API key needed)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
  // Be nice to the free API - add delays between requests
  timeout: 5000,
  httpAdapter: 'https',
});

// Delay helper to respect rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if a location looks problematic
 */
function isPotentiallyProblematic(location) {
  if (!location || location === 'null') return true;

  const lowerLocation = location.toLowerCase();
  const problematicKeywords = [
    'world',
    'earth',
    'remote',
    'nomad',
    'digital nomad',
    'everywhere',
    'nowhere',
    'n/a',
    'tbd',
    'various'
  ];

  return problematicKeywords.some(keyword => lowerLocation.includes(keyword));
}

/**
 * Clean and normalize location strings for better geocoding
 */
function normalizeLocation(location, country) {
  // Handle null or world -> North Pole
  if (!location || location === 'null' || location.toLowerCase() === 'world') {
    return 'North Pole';
  }

  let normalized = location.trim();

  // Remove redundant "UK" suffix when country is already GB
  if (country === 'GB' && normalized.includes(', UK')) {
    normalized = normalized.replace(', UK', '');
  }

  // Handle "Greater [City] Area" -> just use the city
  if (normalized.includes('Greater') && normalized.includes('Area')) {
    // "Greater Seattle Area, WA" -> "Seattle, WA"
    normalized = normalized.replace(/Greater\s+/i, '').replace(/\s+Area/i, '');
  }

  // Remove redundant country name when we have country code
  // "Olsztyn, Poland" -> "Olsztyn" (when country is already PL)
  if (country && normalized.includes(',')) {
    const countryNames = {
      'PL': 'Poland',
      'GB': 'United Kingdom',
      'US': 'United States',
      'CA': 'Canada',
      'DE': 'Germany',
      'FR': 'France',
      'ES': 'Spain',
      'IT': 'Italy',
      'NL': 'Netherlands',
      'BE': 'Belgium',
    };

    const countryName = countryNames[country];
    if (countryName && normalized.toLowerCase().includes(countryName.toLowerCase())) {
      normalized = normalized.split(',')[0].trim();
    }
  }

  return normalized;
}

/**
 * Main geocoding function
 */
async function geocodeTeamData() {
  console.log('🌍 PostHog Team Location Geocoder\n');
  console.log('═'.repeat(60));

  try {
    // Read and parse team data
    const rawData = fs.readFileSync(teamJsonPath, 'utf-8');
    const data = JSON.parse(rawData);
    const teamMembers = data.team.teamMembers;

    console.log(`📊 Total team members: ${teamMembers.length}\n`);

    // Step 1: Collect all unique locations
    console.log('📍 STEP 1: Analyzing unique locations...\n');

    const locationMap = new Map();
    teamMembers.forEach(member => {
      const location = member.location;
      const country = member.country;
      const key = `${location}|${country}`;

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          location,
          country,
          count: 0,
          members: []
        });
      }

      const locData = locationMap.get(key);
      locData.count++;
      locData.members.push(`${member.firstName} ${member.lastName}`);
    });

    console.log(`Found ${locationMap.size} unique locations\n`);

    // Step 2: Flag problematic locations
    console.log('🚩 STEP 2: Identifying potentially problematic locations...\n');

    const problematic = [];
    const normal = [];

    locationMap.forEach((data, key) => {
      if (isPotentiallyProblematic(data.location)) {
        problematic.push({ key, ...data });
      } else {
        normal.push({ key, ...data });
      }
    });

    if (problematic.length > 0) {
      console.log(`⚠️  Found ${problematic.length} potentially problematic locations:\n`);
      problematic.forEach(loc => {
        console.log(`   🚩 "${loc.location}" (${loc.country})`);
        console.log(`      - ${loc.count} team member(s): ${loc.members.slice(0, 3).join(', ')}${loc.count > 3 ? '...' : ''}`);
      });
      console.log('');
    } else {
      console.log('✅ No obviously problematic locations found!\n');
    }

    console.log(`✅ ${normal.length} normal locations ready for geocoding\n`);
    console.log('═'.repeat(60));
    console.log('');

    // Step 3: Geocode all locations (with delay to respect rate limits)
    console.log('🗺️  STEP 3: Geocoding all locations...\n');
    console.log('⏳ This will take a few minutes (respecting API rate limits)...\n');

    const geocodeResults = new Map();
    let successCount = 0;
    let failCount = 0;

    // Process all locations (problematic + normal)
    const allLocations = [...problematic, ...normal];

    for (let i = 0; i < allLocations.length; i++) {
      const loc = allLocations[i];

      // Normalize the location for better geocoding results
      const normalizedLocation = normalizeLocation(loc.location, loc.country);

      const searchQuery = loc.country && loc.country !== 'world'
        ? `${normalizedLocation}, ${loc.country}`
        : normalizedLocation;

      try {
        // Progress indicator
        process.stdout.write(`\r   Geocoding ${i + 1}/${allLocations.length}: ${searchQuery.padEnd(50).substring(0, 50)}...`);

        const results = await geocoder.geocode(searchQuery);

        if (results && results.length > 0) {
          const result = results[0];
          geocodeResults.set(loc.key, {
            ...loc,
            geocoded: {
              lat: result.latitude,
              lng: result.longitude,
              formattedAddress: result.formattedAddress,
              city: result.city,
              country: result.country,
              countryCode: result.countryCode
            },
            success: true
          });
          successCount++;
        } else {
          geocodeResults.set(loc.key, {
            ...loc,
            success: false,
            error: 'No results found'
          });
          failCount++;
        }

        // Respect rate limits (1 request per second)
        await delay(1000);

      } catch (error) {
        geocodeResults.set(loc.key, {
          ...loc,
          success: false,
          error: error.message
        });
        failCount++;
        await delay(1000);
      }
    }

    console.log('\n');
    console.log(`✅ Geocoding complete: ${successCount} successful, ${failCount} failed\n`);
    console.log('═'.repeat(60));
    console.log('');

    // Step 4: Reverse geocoding verification
    console.log('🔄 STEP 4: Verifying coordinates with reverse geocoding...\n');
    console.log('⏳ Verifying a sample of locations...\n');

    const verificationsNeeded = Array.from(geocodeResults.values())
      .filter(r => r.success)
      .slice(0, 10); // Verify first 10 to avoid too many API calls

    const mismatches = [];

    for (let i = 0; i < verificationsNeeded.length; i++) {
      const loc = verificationsNeeded[i];

      try {
        process.stdout.write(`\r   Verifying ${i + 1}/${verificationsNeeded.length}...`);

        const reverseResults = await geocoder.reverse({
          lat: loc.geocoded.lat,
          lon: loc.geocoded.lng
        });

        if (reverseResults && reverseResults.length > 0) {
          const reverse = reverseResults[0];

          // Check if reverse geocoded location roughly matches original
          const originalLower = loc.location.toLowerCase();
          const reverseLower = reverse.formattedAddress.toLowerCase();

          // Simple check: does the reverse address contain the original location name?
          const matches = reverseLower.includes(originalLower) ||
                         originalLower.includes(reverse.city?.toLowerCase() || '');

          if (!matches) {
            mismatches.push({
              original: loc.location,
              originalCountry: loc.country,
              coordinates: `${loc.geocoded.lat}, ${loc.geocoded.lng}`,
              reverseGeocodedTo: reverse.formattedAddress,
              membersAffected: loc.count
            });
          }
        }

        await delay(1000);

      } catch (error) {
        // Reverse geocoding failed, but that's okay for verification
      }
    }

    console.log('\n');

    if (mismatches.length > 0) {
      console.log(`⚠️  Found ${mismatches.length} potential mismatches in sample:\n`);
      mismatches.forEach(m => {
        console.log(`   📍 Original: "${m.original}" (${m.originalCountry})`);
        console.log(`      Coords: ${m.coordinates}`);
        console.log(`      Reverse: "${m.reverseGeocodedTo}"`);
        console.log(`      Affects: ${m.membersAffected} team member(s)\n`);
      });
    } else {
      console.log('✅ All verified locations match their coordinates!\n');
    }

    console.log('═'.repeat(60));
    console.log('');

    // Step 5: Summary Report
    console.log('📊 FINAL SUMMARY\n');
    console.log(`Total locations: ${allLocations.length}`);
    console.log(`Successfully geocoded: ${successCount} (${((successCount/allLocations.length)*100).toFixed(1)}%)`);
    console.log(`Failed to geocode: ${failCount}`);
    console.log(`Potentially problematic: ${problematic.length}`);
    console.log(`Verification mismatches (in sample): ${mismatches.length}\n`);

    // List failures
    if (failCount > 0) {
      console.log('❌ Failed locations:\n');
      geocodeResults.forEach(result => {
        if (!result.success) {
          console.log(`   - "${result.location}" (${result.country}): ${result.error}`);
          console.log(`     Affects: ${result.members.slice(0, 3).join(', ')}${result.count > 3 ? '...' : ''}\n`);
        }
      });
    }

    console.log('═'.repeat(60));
    console.log('');

    // Save results for review
    const outputPath = path.join(__dirname, '../../../geocode_results.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        summary: {
          total: allLocations.length,
          successful: successCount,
          failed: failCount,
          problematic: problematic.length,
          verificationMismatches: mismatches.length
        },
        problematicLocations: problematic.map(p => ({
          location: p.location,
          country: p.country,
          count: p.count,
          members: p.members
        })),
        failedGeocode: Array.from(geocodeResults.values())
          .filter(r => !r.success)
          .map(r => ({
            location: r.location,
            country: r.country,
            error: r.error,
            count: r.count,
            members: r.members
          })),
        verificationMismatches: mismatches,
        allResults: Array.from(geocodeResults.values())
      }, null, 2)
    );

    console.log(`💾 Detailed results saved to: geocode_results.json\n`);
    console.log('🎯 Next steps:');
    console.log('   1. Review geocode_results.json for any issues');
    console.log('   2. Decide how to handle failed/problematic locations');
    console.log('   3. Run the final data processing script\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the geocoder
geocodeTeamData();
