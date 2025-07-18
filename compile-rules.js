const axios = require('axios');
const fs = require('fs/promises');
const net = require('net');

// --- Configuration ---
const AXIOS_TIMEOUT = 20000;
let OUTPUT_FILENAME = 'compiled-rules.json';

// Define different source configurations
const allSources = [
    {
        "tag": "oisd-domains",
        "url": "https://raw.githubusercontent.com/sjhgvr/oisd/main/domainswild2_big.txt",
    },
    {
        "tag": "hagezi-tif-domains",
        "url": "https://raw.githubusercontent.com/hagezi/dns-blocklists/main/adblock/tif.txt",
    },
    {
        "tag": "phishing-army-domains",
        "url": "https://phishing.army/download/phishing_army_blocklist_extended.txt",
    },
    {
        "tag": "spamhaus-drop-ips",
        "url": "https://www.spamhaus.org/drop/drop.txt",
    },
    {
        "tag": "spamhaus-dropv6-ips",
        "url": "https://www.spamhaus.org/drop/dropv6.txt",
    }
];

const lightSources = [
    allSources[0], // oisd-domains
];

const mediumSources = [
    allSources[0], // oisd-domains
    allSources[1], // hagezi-tif-domains
    allSources[2], // phishing-army-domains
];

const fullSources = allSources;

// 1. Define the list of sources from your input
// This will be dynamically set based on command line arguments
let sources = [];

// Regular expressions to clean entries
const adblockHostRegex = /^(?:0\\.0\\.0\\.0|127\\.0\\.0\\.1)\\s+([^\\s]+)/;

// A new function dedicated to parsing a single line
function parseLine(line, domainSet, ipSet) {
    // 1. Clean and normalize the line
    // This combined regex is slightly more efficient than multiple .split() calls
    const cleanedLine = line.split(/[#;]/)[0].trim().toLowerCase();

    if (!cleanedLine || cleanedLine.startsWith('!')) {
        return false; // Indicate no entry was found
    }

    // 2. Check for IP/CIDR
    const ipAddress = cleanedLine.split('/')[0];
    if (net.isIP(ipAddress) > 0) {
        ipSet.add(cleanedLine);
        return true;
    }

    // 3. Check for hosts format (e.g., 0.0.0.0 example.com)
    const hostMatch = cleanedLine.match(/^(?:0\\.0\\.0\\.0|127\\.0\\.0\\.1)\\s+([^\s]+)/);
    if (hostMatch) {
        domainSet.add(hostMatch[1]);
        return true;
    }

    // 4. Check for Adblock Plus format (e.g., ||example.com^)
    const abpMatch = cleanedLine.match(/^\|\|([a-z0-9_.-]+)\^?$/);
    if (abpMatch) {
        domainSet.add(abpMatch[1]);
        return true;
    }

    // 5. Fallback for plain domain lists (stricter validation)
    // This regex ensures it's a valid-looking hostname and not a URL with a path
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanedLine)) {
        domainSet.add(cleanedLine);
        return true;
    }

    return false; // No valid entry found
}

/**
 * Main function to download, parse, and compile the ruleset.
 */
async function compileRuleSet() {
    const args = process.argv.slice(2);
    let version = 'full'; // Default version

    if (args.length > 0) {
        const versionArg = args[0].split('=');
        if (versionArg[0] === '--version' && versionArg.length === 2) {
            version = versionArg[1].toLowerCase();
        } else {
            console.error("Usage: node compile-rules.js [--version=<light|medium|full>]");
            process.exit(1);
        }
    }

    switch (version) {
        case 'light':
            sources = lightSources;
            OUTPUT_FILENAME = 'compiled-rules-light.json';
            break;
        case 'medium':
            sources = mediumSources;
            OUTPUT_FILENAME = 'compiled-rules-medium.json';
            break;
        case 'full':
            sources = fullSources;
            OUTPUT_FILENAME = 'compiled-rules-full.json';
            break;
        default:
            console.error(`Invalid version: ${version}. Choose from light, medium, or full.`);
            process.exit(1);
    }

    console.log(`🚀 Starting compilation process for ${version} version...`);

    const domainSuffixes = new Set();
    const ipCidrs = new Set();

    const downloadPromises = sources.map(source => {
        console.log(`📥 Downloading ${source.tag}...`);
        return axios.get(source.url, { timeout: AXIOS_TIMEOUT })
        .then(response => ({
            tag: source.tag,
            data: response.data
        }))
        .catch(error => {
            console.error(`❌ Failed to download ${source.tag} from ${source.url}: ${error.message}`);
            return null;
        });
    });

    const results = await Promise.all(downloadPromises);

    console.log('🌀 Processing downloaded lists...');

    for (const result of results) {
        if (!result) continue;

        const lines = result.data.split('\n');
        let parsedCount = 0;

        for (const rawLine of lines) {
            if (parseLine(rawLine, domainSuffixes, ipCidrs)) {
                parsedCount++;
            }
        }
        console.log(`✔️ Processed ${result.tag}: Found ${parsedCount} potential entries.`);
    }

    const sortedDomains = [...domainSuffixes].sort();
    const sortedIps = [...ipCidrs].sort();

    console.log('\n📊 Compilation Summary:');
    console.log(`  - Processed ${results.filter(r => r).length} out of ${sources.length} lists successfully.`);
    console.log(`  - ${sortedDomains.length} unique domains/suffixes.`);
    console.log(`  - ${sortedIps.length} unique IP/CIDRs (IPv4 & IPv6).`);

    const ruleSet = {
        version: 1,
        rules: [{
            domain_suffix: sortedDomains,
            ip_cidr: sortedIps,
        }, ],
    };

    await fs.writeFile(OUTPUT_FILENAME, JSON.stringify(ruleSet, null, 2));

    console.log(`\n✅ Successfully created rule set source file: ${OUTPUT_FILENAME}`);
    console.log(`\n👉 Next, compile it into a binary .srs file using the Sing-box command.`);
}

compileRuleSet().catch(error => {
    console.error("\nAn unexpected error occurred:", error);
});