# SRS-Security Compiler

This project compiles various adblock and IP blocklists into a unified ruleset (`srs-security.srs`) for use with Sing-box.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

## What it Blocks

This project compiles various lists to block a comprehensive range of undesirable network elements, focusing on:

*   **Domains** commonly associated with advertising, tracking, and phishing activities.
*   **IP addresses (both IPv4 and IPv6)** identified as sources of spam or other malicious traffic.

This results in a unified ruleset (`srs-security.srs`) for blocking these types of unwanted connections.

## Rule Set Versions

The project offers three distinct rule set versions, each tailored to different levels of blocking aggressiveness and coverage:

*   **Light Version**: This version includes only the `oisd-domains` blocklist. It provides essential ad, tracking, and basic malware protection with a focus on minimizing false positives and maintaining broad compatibility.
*   **Medium Version**: Building upon the Light Version, this includes `oisd-domains`, `hagezi-tif-domains`, and `phishing-army-domains`. This offers enhanced protection against phishing and known malicious infrastructure while still aiming for a balanced approach.
*   **Full Version (Default)**: This is the most comprehensive rule set, incorporating all available blocklists: `oisd-domains`, `hagezi-tif-domains`, `phishing-army-domains`, `spamhaus-drop-ips`, and `spamhaus-dropv6-ips`. It provides maximum protection against a wide range of threats, including advanced malware, spam-related IP addresses, and extensive phishing coverage. This version might lead to more false positives due to its aggressive nature.

For details on what each individual blocklist targets, please refer to the "Detailed Blocklist Information" section.

## Detailed Blocklist Information

Here's a breakdown of what each domain and IP blocklist targets:

*   **oisd-domains**: This comprehensive blocklist targets a wide array of unwanted content, including general advertisements, mobile app advertisements, phishing attempts, malvertising, malware, spyware, ransomware, cryptojacking, and unnecessary telemetry/analytics/tracking domains.
*   **hagezi-tif-domains**: Provided by HaGeZi, this Threat Intelligence Feeds (TIF) list is designed to block domains actively involved in distributing malware, executing phishing scams, and hosting command-and-control (C2) servers for various cybercrime activities.
*   **phishing-army-domains**: This list is specifically curated to combat phishing by blocking domains and their subdomains identified as being part of phishing campaigns.
*   **spamhaus-drop-ips**: This list contains IPv4 network ranges (netblocks) that are considered highly dangerous. These are IP addresses that have been hijacked or leased by professional spam operations and cybercriminals for activities such as distributing malware, trojan downloaders, and botnet command and control. Its purpose is to advise dropping all traffic to and from these ranges.
*   **spamhaus-dropv6-ips**: Similar to `spamhaus-drop-ips`, this list focuses on IPv6 network ranges (netblocks) that are associated with professional spam and cybercrime operations, recommending that all traffic to these IPv6 addresses be dropped.

## Usage

To compile the ruleset, you can choose from different versions:

*   **Light Version**: Includes essential domain blocklists.
    ```bash
    node compile-rules.js --version=light
    ```
    This will generate `compiled-rules-light.json`. To convert it to a Sing-box compatible binary ruleset (`.srs` file), run:
    ```bash
    sing-box rule-set compile --output srs-security-light.srs compiled-rules-light.json
    ```

*   **Medium Version**: Includes a broader set of domain and phishing blocklists.
    ```bash
    node compile-rules.js --version=medium
    ```
    This will generate `compiled-rules-medium.json`. To convert it to a Sing-box compatible binary ruleset (`.srs` file), run:
    ```bash
    sing-box rule-set compile --output srs-security-medium.srs compiled-rules-medium.json
    ```

*   **Current Version (Default)**: Includes all available domain and IP blocklists.
    ```bash
    node compile-rules.js --version=full
    # or simply
    node compile-rules.js
    ```
    This will generate `compiled-rules-full.json`. To convert it to a Sing-box compatible binary ruleset (`.srs` file), run:
    ```bash
    sing-box rule-set compile --output srs-security-full.srs compiled-rules-full.json
    ```

## Sing-box Guide

To use the compiled `.srs` files with Sing-box, add a rule set configuration similar to the following in your Sing-box configuration file (e.g., `config.json`). You can choose the version that best suits your needs:

### Light Version
```json
{
  "tag": "srs-security-light-rules",
  "type": "remote",
  "format": "binary",
  "url": "https://github.com/hobert-rj/srs-security/releases/latest/download/srs-security-light.srs",
  "download_detour": "direct",
  "update_interval": "1h"
}
```

### Medium Version
```json
{
  "tag": "srs-security-medium-rules",
  "type": "remote",
  "format": "binary",
  "url": "https://github.com/hobert-rj/srs-security/releases/latest/download/srs-security-medium.srs",
  "download_detour": "direct",
  "update_interval": "1h"
}
```

### Current Version
```json
{
  "tag": "srs-security-full-rules",
  "type": "remote",
  "format": "binary",
  "url": "https://github.com/hobert-rj/srs-security/releases/latest/download/srs-security-full.srs",
  "download_detour": "direct",
  "update_interval": "1h"
}
```

These configurations will instruct Sing-box to download and update the rulesets every 1 hour.