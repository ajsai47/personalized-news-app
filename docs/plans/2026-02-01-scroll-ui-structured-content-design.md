# Scroll UI & Structured Content Design

## Overview

Restructure the news feed to display articles in their original editorial format (News → Details → Why It Matters) within an illuminated manuscript-style scroll container.

## Goals

1. Parse articles by explicit headers to extract News/Details/Why It Matters sections
2. Store structured content in the database
3. Create a scroll container UI with rolled edges and illuminated manuscript flourishes
4. Display entries with proper section labels and drop caps

---

## Content Parsing & Storage

### Parsing Logic

Articles contain explicit headers. The import script will:

1. Find "News" header → capture content until "Details" header
2. Find "Details" header → capture content until "Why It Matters" header
3. Find "Why It Matters" header → capture remaining content

Header variations to match (case-insensitive):
- "News:", "NEWS", "The News"
- "Details:", "DETAILS", "The Details"
- "Why It Matters:", "WHY IT MATTERS", "Why it matters"

### Database Schema

Add column to segments table:

```sql
ALTER TABLE segments ADD COLUMN structured_content JSONB;
```

Structure:
```json
{
  "news": "The headline summary paragraph with links...",
  "details": "The detailed explanation paragraphs...",
  "whyItMatters": "The significance/impact paragraph..."
}
```

### Fallback Behavior

- If headers not found, `structured_content` = null
- NewsEntry component falls back to current paragraph-chunking display

---

## Scroll Container UI

### Visual Elements

**Scroll structure:**
- Top roll: Decorative curled parchment edge (CSS/SVG)
- Main body: Aged parchment texture containing all entries
- Bottom roll: Matching curled edge
- Ornate border: Thin decorative frame with medieval flourish patterns

**Illuminated manuscript touches:**
- Drop caps: Large decorative first letter on each article's News section
- Section dividers: Ornamental flourishes between entries
- Gold accents: Subtle gold/amber on decorative elements and high-importance markers

**Entry changes:**
- Entries have no individual card backgrounds
- Subtle separator flourishes between entries
- Section labels styled as manuscript margin annotations

---

## Component Architecture

### New Files

**`src/components/ScrollContainer.tsx`**
- Wrapper with scroll rolls and ornate borders
- Parchment background texture
- Receives children (news entries)

### Modified Files

**`src/components/NewsCard.tsx` → `NewsEntry.tsx`**
- Display News/Details/Why It Matters with labels
- Drop cap on first letter of News
- Simplified styling (no card background)
- Ornamental flourish divider

**`src/components/FeedContent.tsx`**
- Wrap content in `<ScrollContainer>`
- Remove section grouping (all entries flow together)
- Keep filtering logic

**`src/app/globals.css`**
- Scroll roll styles (curved edges)
- Drop cap styling
- Ornamental flourish patterns
- Gold accent color variables

### Unchanged

- TopNav (stays sticky above scroll)
- Database queries
- Filter logic

---

## Import Script Changes

**`scripts/import-substack-v3.js`**

New function:
```javascript
function parseStructuredContent(html) {
  // Match section headers case-insensitively
  // Extract content between headers
  // Return { news, details, whyItMatters } or null
}
```

Update insert query to include `structured_content` column.

---

## Implementation Order

1. Database migration (add structured_content column)
2. Update import script with structured parsing
3. Re-import articles to populate structured_content
4. Create ScrollContainer component
5. Refactor NewsCard → NewsEntry with new section display
6. Update FeedContent to use ScrollContainer
7. Add CSS for scroll aesthetics, drop caps, flourishes
