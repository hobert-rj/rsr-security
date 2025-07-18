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