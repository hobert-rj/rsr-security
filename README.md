# RSR-Security Compiler

This project compiles various adblock and IP blocklists into a unified ruleset (`rsr-security.srs`) for use with Sing-box.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

## What it Blocks

This project compiles various lists to block a comprehensive range of undesirable network elements, focusing on:

*   **Domains** commonly associated with advertising, tracking, and phishing activities.
*   **IP addresses (both IPv4 and IPv6)** identified as sources of spam or other malicious traffic.

This results in a unified ruleset (`rsr-security.srs`) for blocking these types of unwanted connections.

## Usage

To compile the ruleset, run:

```bash
node compile-rules.js
```

This will generate `compiled-rules.json`. To convert it to a Sing-box compatible binary ruleset (`.srs` file), run:

```bash
sing-box rule-set compile --output rsr-security.srs compiled-rules.json
```

The `rsr-security.srs` file can then be used with Sing-box. You can find the latest compiled `rsr-security.srs` in the [GitHub Releases](https://github.com/hobert-rj/rsr-security/releases/latest/download/rsr-security.srs).

## Sing-box Guide

To use the compiled `rsr-security.srs` with Sing-box, add a rule set configuration similar to the following in your Sing-box configuration file (e.g., `config.json`):

```json
{
  "tag": "rsr-security-rules",
  "type": "remote",
  "format": "binary",
  "url": "https://github.com/hobert-rj/rsr-security/releases/latest/download/rsr-security.srs",
  "download_detour": "direct",
  "update_interval": "1h"
}
```

This configuration will instruct Sing-box to download and update the ruleset every 1 hours.