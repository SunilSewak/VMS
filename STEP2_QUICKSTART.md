# Step 2: Quick Start Guide

## 🚀 Getting Started

### Access the Venue Management Workspace

1. **Login** to AVEMS
2. Navigate to **Administration** → **Masters** → **Venues**
3. Click on any hotel row to open its workspace
4. Or directly visit: `/administration/masters/venues/{hotel-id}`

---

## 📍 Workspace Overview

```
┌─────────────────────────────────────────┐
│  ← Back    Hotel Name      Edit Hotel   │  ← Header
├─────────────────────────────────────────┤
│  Venue Readiness: 65% (Partially Ready) │  ← Score Card
│  ◐▬▬▬▬▬▬▬▬▬ (circular progress)         │
├─────────────────────────────────────────┤
│ Overview  Halls  Accommodation  Occupancy  │  ← Tabs
├─────────────────────────────────────────┤
│                                         │
│  [Tab Content Here]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 Tab Guide

### 1. **Overview** Tab
**Purpose**: Quick view of hotel profile and statistics

**What You'll See**:
- Hotel name, city, address, status
- Contact info (phone, email, website)
- Operational details (total rooms, check-in/out times)
- Statistics (number of halls, room types, occupancy rules)

**Actions**: None (read-only)

---

### 2. **Halls** Tab
**Purpose**: Manage meeting spaces

**What You'll See**:
- Card grid showing all configured halls
- Each card displays:
  - Hall name and type
  - Indoor/Outdoor indicator
  - Seating capacities (Theatre, Classroom, Round Table, Cocktail, General)
  - Dimensions and area
  - Status indicator

**Actions**:
- **Add Hall**: Click "+ Add Hall" button
- **Edit**: Click "Edit" on any hall card
- **Delete**: Click "Delete" on any hall card (with confirmation)

**Example Hall Card**:
```
┌─ Ballroom ─────────────────┐
│ BALLROOM  |  INDOOR        │
├────────────────────────────┤
│ Theatre: 800  │ Classroom: 600 │
│ Round Table: 400 │ Cocktail: 500 │
│ Area: 2500 sq.ft            │
│ Dimensions: 50 × 50         │
│ Height: 14 ft               │
├────────────────────────────┤
│  [Edit]  [Delete]          │
└────────────────────────────┘
```

---

### 3. **Accommodation** Tab
**Purpose**: Manage room inventory

**What You'll See**:
- Table with room types
- Total rooms configured (with validation against hotel total)
- Columns:
  - Room Category
  - Total Rooms
  - Available Rooms
  - Occupancy (persons per room)
  - Rate/Night (required for completion)
  - Status
  - Actions

**Actions**:
- **Edit**: Click "Edit" to modify room details
- **Save**: After editing, click "Save" to commit
- **Delete**: Click "Delete" to remove room type
- **Validation**: Total rooms cannot exceed hotel's total_rooms

**Example**:
```
| Room Category | Total | Available | Occupancy | Rate/Night | Status | Actions |
|---|---|---|---|---|---|---|
| Standard | 50 | 45 | 2 | ₹3,000 | ACTIVE | Edit Delete |
| Deluxe | 30 | 28 | 2 | ₹5,000 | ACTIVE | Edit Delete |
| Suite | 10 | 10 | 4 | ₹8,000 | ACTIVE | Edit Delete |
```

---

### 4. **Occupancy Rules** Tab
**Purpose**: Map sales designations to occupancy types

**What You'll See**:
- Completion status (e.g., 3/5 configured)
- List of 5 designations:
  - SO (Sales Officer)
  - DM (Division Manager)
  - RSM (Regional Sales Manager)
  - CH (Corporate Head)
  - IBH (In-house Booking Head)

- For each designation, the mapped occupancy type:
  - SINGLE
  - DOUBLE
  - TRIPLE
  - QUAD

**Actions**:
- **Edit**: Click "Edit" next to any designation
- **Change**: Select new occupancy type from dropdown
- **Save**: Click "Save" to confirm

**Default Mapping**:
```
SO  → TRIPLE
DM  → DOUBLE
RSM → SINGLE
CH  → SINGLE
IBH → SINGLE
```

⚠️ **Note**: All 5 designations must be configured for "Venue Ready" status.

---

### 5. **Photos** Tab
**Purpose**: Photo management (coming in Step 3)

**Status**: Placeholder - full photo upload and management coming in next phase

---

## 📊 Venue Readiness Score

### What It Measures

**5 Categories** (100 points total):

| Category | Points | Requirements |
|----------|--------|--------------|
| Hotel Profile | 25 | Name, Address, Contact, Rooms, Check-in/out |
| Halls | 25 | ≥1 hall with capacity & dimensions & type |
| Accommodation | 25 | ≥1 room type with rates |
| Occupancy Rules | 15 | ≥3 rules configured |
| *Reserved* | 10 | Future use |

### Status Levels

```
0-39%    → NOT_READY (Red) - Needs significant setup
40-69%   → PARTIAL (Amber) - Making progress
70-99%   → READY (Green) - Nearly complete
100%     → OPTIMIZED (Cyan) - Fully configured
```

### How to Improve Score

1. **Add Hotel Profile Info**: Update hotel details (phone, email, check times)
2. **Add Halls**: Configure at least 1 hall with capacities
3. **Add Rooms**: Define room inventory with rates
4. **Configure Occupancy**: Set all 5 designation rules

---

## 🔧 Common Tasks

### Add a New Hall

1. Go to **Halls** tab
2. Click **+ Add Hall**
3. Fill in:
   - Hall Name (required)
   - Hall Type (required)
   - Indoor/Outdoor (required)
   - Capacities (at least one)
   - Dimensions (optional but recommended)
4. Click **Save**

### Edit Room Rates

1. Go to **Accommodation** tab
2. Find your room type
3. Click **Edit**
4. Update "Rate/Night"
5. Click **Save**

### Complete Occupancy Configuration

1. Go to **Occupancy Rules** tab
2. For each missing designation, click **Edit**
3. Select occupancy type from dropdown
4. Click **Save**
5. When all 5 are done → Status shows "✓ Complete"

### Check Readiness Progress

1. Look at the **Readiness Score** card at top of workspace
2. Percentage shows overall completion
3. Status label indicates what still needs work
4. Circular indicator visualizes progress
5. Review missing items in recommendations

---

## ⚠️ Important Notes

### Validation Rules
- ✅ Accommodation total rooms cannot exceed hotel's total rooms
- ✅ At least one hall must have capacity defined
- ✅ All room types need rates for completion
- ✅ All 5 designations must be configured for "READY" status

### Data Persistence
- All changes auto-save to database
- No "Save All" button needed
- Each edit commits individually
- Reload page to verify persistence

### If Something Goes Wrong
1. Check for validation warnings (usually in red/yellow boxes)
2. Review the specific field with error
3. Correct the issue and try again
4. If error persists, refresh page and retry

---

## 🎯 Quick Checklist for Setup

### Get Your Hotel to "READY" Status

- [ ] Overview tab - Hotel profile visible and complete
- [ ] Accommodation tab - At least 1 room type with rate defined
- [ ] Halls tab - At least 1 hall with capacity > 0
- [ ] Occupancy Rules tab - All 5 designations configured
- [ ] Refresh page and check readiness score shows 70%+

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Accommodation total exceeds hotel total | Edit room quantities, or update hotel's total_rooms |
| Can't click Edit button | Make sure you're not already editing another field |
| Changes not saving | Check for validation warnings, refresh and retry |
| Tab not responding | Refresh the page completely |
| Readiness score not updating | Refresh page after making changes |

---

## 📞 Support

For questions or issues:
1. Refer to detailed guide: **STEP2_VENUE_MANAGEMENT_WORKSPACE_COMPLETE.md**
2. Check inline help in UI components
3. Review error messages for specific guidance

---

## ✨ Pro Tips

1. **Start with Overview**: Review what's already configured
2. **Complete Accommodation First**: Easier to get quick wins
3. **Add Halls Next**: Major contributor to readiness score
4. **Configure Occupancy Last**: Quickest final step
5. **Monitor Score**: Watch readiness percentage climb as you complete each section

---

**Ready to get started? Open a hotel and click any tab!**

---

*Step 2: Venue Management Workspace*  
*Quick Start Guide*  
*June 2026*
