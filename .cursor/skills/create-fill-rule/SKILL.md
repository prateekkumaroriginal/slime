---
name: create-fill-rule
description: Generate importable FillRule JSON for the Slime Chrome extension. Use when creating fill rules, form autofill configurations, field mappings, or when the user wants to export/import rules.
---

# Create FillRule

Generate importable FillRule JSON for Slime. Rules define how to auto-fill forms on specific URLs.

## FillRule Structure

```typescript
interface FillRule {
  id: string;                    // Unique ID (use crypto.randomUUID() format)
  name: string;                  // Display name shown in UI
  urlPattern: string;            // URL match pattern: "*://example.com/*"
  fields: FieldMapping[];        // Field definitions
  repeatGroups?: RepeatGroup[];  // Optional: for repeating form rows
  enabled: boolean;              // Whether rule is active
  incrementCounter: number;      // Current {{inc}} value (start at 0)
  isArchived?: boolean;          // Soft delete flag
  collectionId?: string;         // Optional collection grouping
  postActions?: PostAction[];    // Actions after all fields complete
  createdAt: number;             // Unix timestamp ms
  updatedAt: number;             // Unix timestamp ms
}
```

## FieldMapping Structure

```typescript
interface FieldMapping {
  id: string;
  selector: string;              // Target selector
  matchType: 'id' | 'name' | 'querySelector';
  valueType: 'static' | 'template' | 'title' | 'desc' | 'image';
  value: string;                 // Static value or template with {{placeholders}}
  minLength?: number;            // For title/desc: min characters
  maxLength?: number;            // For title/desc: max characters
  imageId?: string;              // For image valueType
  postActions?: PostAction[];    // Actions after this field fills
}
```

## Match Types

| Type | Usage | Selector Example |
|------|-------|------------------|
| `id` | Element ID attribute | `username` (matches `id="username"`) |
| `name` | Element name attribute | `email` (matches `name="email"`) |
| `querySelector` | CSS selector | `input[data-field="phone"]` |

**Regex support** (id/name only): Use `/pattern/` syntax for regex matching.
- `/user.*/` matches `user`, `username`, `user_id`

## Value Types

| Type | Description |
|------|-------------|
| `static` | Fixed value, no processing |
| `template` | Value with `{{placeholder}}` substitutions |
| `title` | AI-generated title for the page |
| `desc` | AI-generated description for the page |
| `image` | Upload image (requires `imageId`) |

## Template Placeholders

Use in `template` valueType:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{inc}}` | Auto-incrementing number | `user{{inc}}` → user1, user2, user3 |
| `{{random:N}}` | Random N-digit number | `{{random:4}}` → 7392 |
| `{{pick:a,b,c}}` | Random from list | `{{pick:red,blue,green}}` → blue |
| `{{date:FORMAT}}` | Formatted date | `{{date:YYYY-MM-DD}}` → 2025-01-30 |
| `{{regex:PATTERN}}` | Generate from regex | `{{regex:[A-Z]{3}[0-9]{3}}}` → ABC123 |

**Date formats**: YYYY, YY, MM, DD, HH, mm, ss

## PostAction Structure

```typescript
interface PostAction {
  id: string;
  type: 'click' | 'focus' | 'pressKey' | 'wait';
  selector?: string;    // For click, focus
  key?: string;         // For pressKey: Enter, Tab, Escape, etc.
  delay?: number;       // For wait: milliseconds
}
```

## RepeatGroup Structure (for multiple rows)

```typescript
interface RepeatGroup {
  id: string;
  name: string;                  // Display name
  rowSelector: string;           // CSS selector for row containers
  fields: RepeatGroupField[];    // Column definitions
  rows: RowData[];               // Data to fill
  postActions?: PostAction[];
}

interface RepeatGroupField {
  id: string;
  label: string;                 // Column display name
  selector: string;              // CSS selector relative to row
  matchType: MatchType;
}

interface RowData {
  id: string;
  values: Record<string, string>;  // fieldId → value
}
```

## Example: Simple Rule

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Login Form",
  "urlPattern": "*://app.example.com/login*",
  "fields": [
    {
      "id": "f1",
      "selector": "username",
      "matchType": "id",
      "valueType": "static",
      "value": "testuser@example.com"
    },
    {
      "id": "f2",
      "selector": "password",
      "matchType": "name",
      "valueType": "static",
      "value": "SecurePass123!"
    }
  ],
  "enabled": true,
  "incrementCounter": 0,
  "createdAt": 1706600000000,
  "updatedAt": 1706600000000
}
```

## Example: Template with Placeholders

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Registration",
  "urlPattern": "*://example.com/register*",
  "fields": [
    {
      "id": "f1",
      "selector": "email",
      "matchType": "name",
      "valueType": "template",
      "value": "test{{inc}}@example.com"
    },
    {
      "id": "f2",
      "selector": "username",
      "matchType": "name",
      "valueType": "template",
      "value": "user_{{random:6}}"
    },
    {
      "id": "f3",
      "selector": "[data-field='code']",
      "matchType": "querySelector",
      "valueType": "template",
      "value": "{{regex:[A-Z]{2}[0-9]{4}}}"
    }
  ],
  "enabled": true,
  "incrementCounter": 0,
  "createdAt": 1706600000000,
  "updatedAt": 1706600000000
}
```

## Example: With PostActions

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "name": "Submit After Fill",
  "urlPattern": "*://form.example.com/*",
  "fields": [
    {
      "id": "f1",
      "selector": "name",
      "matchType": "id",
      "valueType": "static",
      "value": "John Doe",
      "postActions": [
        { "id": "pa1", "type": "pressKey", "key": "Tab" }
      ]
    }
  ],
  "postActions": [
    { "id": "pa2", "type": "wait", "delay": 500 },
    { "id": "pa3", "type": "click", "selector": "button[type='submit']" }
  ],
  "enabled": true,
  "incrementCounter": 0,
  "createdAt": 1706600000000,
  "updatedAt": 1706600000000
}
```

## Example: RepeatGroup

```json
{
  "id": "d4e5f6a7-b8c9-0123-def0-234567890123",
  "name": "Multi-User Form",
  "urlPattern": "*://bulk.example.com/*",
  "fields": [],
  "repeatGroups": [
    {
      "id": "rg1",
      "name": "User Entries",
      "rowSelector": ".user-row",
      "fields": [
        { "id": "rgf1", "label": "Name", "selector": "input[name*='name']", "matchType": "querySelector" },
        { "id": "rgf2", "label": "Email", "selector": "input[name*='email']", "matchType": "querySelector" }
      ],
      "rows": [
        { "id": "r1", "values": { "rgf1": "Alice", "rgf2": "alice@test.com" } },
        { "id": "r2", "values": { "rgf1": "Bob", "rgf2": "bob@test.com" } }
      ]
    }
  ],
  "enabled": true,
  "incrementCounter": 0,
  "createdAt": 1706600000000,
  "updatedAt": 1706600000000
}
```

## URL Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `*://example.com/*` | http and https, any path |
| `https://app.example.com/form` | Exact URL |
| `*://*.example.com/*` | All subdomains |
| `*://example.com/path/*` | Specific path prefix |

## Generating Valid IDs

Use UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

For timestamps, use `Date.now()` for current milliseconds.

## Output Format

When creating rules, output a single JSON object (for one rule) or an array (for multiple rules) that can be directly imported.
