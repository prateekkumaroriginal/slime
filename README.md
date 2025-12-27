# Slime

A Chrome extension that fills form/input fields with custom rules and dynamic values. Perfect for testing, development, or repetitive form filling.

## Features

- **Rule-based filling** — Create rules that match specific URLs and fill multiple fields at once
- **Field matching** — Match input fields by `name` or `id` attribute
- **Dynamic templates** — Use placeholders for auto-incrementing numbers, random strings, dates, and more
- **Multiple rules** — Create different fill profiles (e.g., Admin, User, Tester) and switch between them
- **URL patterns** — Rules can be scoped to specific sites or apply globally

## Template Syntax

Use these placeholders in your field values for dynamic content:

| Syntax | Description | Example Output |
|--------|-------------|----------------|
| `{{inc}}` | Auto-incrementing number | 1, 2, 3... |
| `{{inc:100}}` | Increment starting from value | 100, 101, 102... |
| `{{random:5}}` | Random alphanumeric string of length | xK9pL |
| `{{pick:a,b,c}}` | Random pick from comma-separated list | b |
| `{{date:YYYY-MM-DD}}` | Current date/time formatted | 2025-12-27 |
| `{{regex:[A-Z]{2}\d{3}}}` | Generate string from regex pattern | AB123 |

### Date Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | 2025 |
| `YY` | 2-digit year | 25 |
| `MM` | Month (zero-padded) | 01-12 |
| `DD` | Day (zero-padded) | 01-31 |
| `HH` | Hour 24h (zero-padded) | 00-23 |
| `mm` | Minutes (zero-padded) | 00-59 |
| `ss` | Seconds (zero-padded) | 00-59 |

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm (or npm/yarn)

### Build from Source

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd filler-ext
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the extension**
   ```bash
   pnpm build
   ```
   This creates a `dist/` folder with the built extension.

### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project
5. The Slime extension should now appear in your toolbar

## Usage

1. **Click the Slime icon** in the toolbar to open the popup
2. **Click "Manage Rules"** to open the options page
3. **Create a new rule:**
   - Give it a name (e.g., "Test User")
   - Set a URL pattern (`*` for all sites, or `*://example.com/*` for specific sites)
   - Add field mappings with selectors and values
4. **Fill forms:** Navigate to a matching page, click the extension, and select your rule

### Example Rule

Create a rule to fill a signup form:

| Match By | Selector | Value |
|----------|----------|-------|
| Name | `email` | `user_{{inc}}@test.com` |
| Name | `username` | `testuser{{random:4}}` |
| Name | `password` | `Test@123` |
| ID | `country` | `{{pick:US,UK,CA,AU}}` |

## Development

```bash
# Start dev server (for UI development)
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint
```

After making changes, run `pnpm build` and reload the extension in Chrome (`chrome://extensions/` → click the refresh icon on Slime).

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3