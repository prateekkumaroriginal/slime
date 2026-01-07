# Slime

A Chrome extension that fills form/input fields with custom rules and dynamic values. Perfect for testing, development, or repetitive form filling.

## Features

- **Rule-based filling** — Create rules that match specific URLs and fill multiple fields at once
- **Flexible field matching** — Match input fields by ID, Name, or Query Selector (with regex support)
- **Dynamic templates** — Use placeholders for auto-incrementing numbers, random strings, dates, and more
- **Smart content generation** — Generate realistic titles and descriptions for textareas
- **Multiple rules** — Create different fill profiles (e.g., Admin, User, Tester) and switch between them
- **URL patterns** — Rules can be scoped to specific sites or apply globally
- **Rule management** — Archive, restore, import/export, and duplicate rules

## Installation

### Download (Recommended)

1. **Download the latest release**
   
   [**Download slime-v1.0.0.zip**](https://github.com/prateekkumaroriginal/slime/releases/download/v1.0.0/slime-v1.0.0.zip)

2. **Extract the zip** to a folder on your computer

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the extracted folder
   - The Slime extension should now appear in your toolbar

### Build from Source

<details>
<summary>Click to expand</summary>

#### Prerequisites

- Node.js (v18+)
- pnpm (or npm/yarn)

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/prateekkumaroriginal/slime.git
   cd slime
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

4. **Load in Chrome** (same steps as above, select the `dist/` folder)

</details>

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

| Match By | Selector | Value Type | Value |
|----------|----------|------------|-------|
| Name | `email` | Template | `user_{{inc}}@test.com` |
| Name | `username` | Template | `testuser{{random:4}}` |
| Name | `password` | Static | `Test@123` |
| ID | `country` | Template | `{{pick:US,UK,CA,AU}}` |
| Name | `bio` | Description | (min: 50, max: 200) |

## Value Types

### Static
Plain text value, used as-is.

### Template
Dynamic content using placeholders:

| Syntax | Description | Example Output |
|--------|-------------|----------------|
| `{{inc}}` | Auto-incrementing number | 1, 2, 3... |
| `{{inc:100}}` | Increment starting from value | 100, 101, 102... |
| `{{random:5}}` | Random alphanumeric string of length | xK9pL |
| `{{pick:a,b,c}}` | Random pick from comma-separated list | b |
| `{{date:YYYY-MM-DD}}` | Current date/time formatted | 2025-01-07 |
| `{{regex:[A-Z]{2}\d{3}}}` | Generate string from regex pattern | AB123 |

#### Date Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `YYYY` | 4-digit year | 2025 |
| `YY` | 2-digit year | 25 |
| `MM` | Month (zero-padded) | 01-12 |
| `DD` | Day (zero-padded) | 01-31 |
| `HH` | Hour 24h (zero-padded) | 00-23 |
| `mm` | Minutes (zero-padded) | 00-59 |
| `ss` | Seconds (zero-padded) | 00-59 |

### Title
Generates meaningful English phrases. Perfect for form titles, subject lines, and headings.

- Optional min/max character limits
- Example: *"Streamlined hybrid framework"*, *"Innovative zero-defect paradigm"*

### Description
Generates Lorem Ipsum paragraphs. Perfect for textareas, bio fields, comments, and descriptions.

- Optional min/max character limits
- Example: *"Voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis."*

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Save rule |
| `Escape` | Cancel / Close sidebar |
| `Ctrl+I` | Toggle syntax help |

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
