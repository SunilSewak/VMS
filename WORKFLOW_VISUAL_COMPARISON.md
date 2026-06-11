# Workflow Stage Visual Comparison

## Sales Head View

### Meeting Request Card - Before Fix
```
┌──────────────────────────────────────────┐
│  Annual Leadership Summit    [BOOKED]    │
│  # REQ-001  •  📍 Mumbai                 │
│  [📅 15–18 Oct]  [👤 150 pax]             │
│  ──────────────────────────────────────── │
│  ●──●──●──◉──○──○                        │
│  Req Venue Avail Book Inv Pay             │  ← Shows Invoice & Payment
│  ──────────────────────────────────────── │
│  [View]          [View Booking ▶]        │
└──────────────────────────────────────────┘
```

### Meeting Request Card - After Fix ✅
```
┌──────────────────────────────────────────┐
│  Annual Leadership Summit    [BOOKED]    │
│  # REQ-001  •  📍 Mumbai                 │
│  [📅 15–18 Oct]  [👤 150 pax]             │
│  ──────────────────────────────────────── │
│  ●──●──●──◉                              │
│  Req Venue Avail Book                     │  ← Only relevant stages
│  ──────────────────────────────────────── │
│  [View]          [View Booking ▶]        │
└──────────────────────────────────────────┘
```

---

## Admin View (Unchanged)

### Meeting Request Card
```
┌──────────────────────────────────────────┐
│  Annual Leadership Summit    [PAID]      │
│  # REQ-001  •  📍 Mumbai                 │
│  [📅 15–18 Oct]  [👤 150 pax]             │
│  ──────────────────────────────────────── │
│  ●──●──●──●──●──◉                        │
│  Req Venue Avail Book Inv Pay             │  ← All 6 stages visible
│  ──────────────────────────────────────── │
│  [View]          [Manage Booking ▶]      │
└──────────────────────────────────────────┘
```

---

## Stage Progression Examples

### Scenario 1: Request in DRAFT Status
**Sales Head View:**
```
◉──○──○──○
Req Venue Avail Book
```

**Admin View:**
```
◉──○──○──○──○──○
Req Venue Avail Book Inv Pay
```

---

### Scenario 2: Request with VENUES_SHORTLISTED Status
**Sales Head View:**
```
●──◉──○──○
Req Venue Avail Book
```

**Admin View:**
```
●──◉──○──○──○──○
Req Venue Avail Book Inv Pay
```

---

### Scenario 3: Request BOOKED
**Sales Head View:**
```
●──●──●──◉
Req Venue Avail Book
```

**Admin View:**
```
●──●──●──◉──○──○
Req Venue Avail Book Inv Pay
```

---

### Scenario 4: Request with INVOICE_RECEIVED Status
**Sales Head View:**
```
●──●──●──◉
Req Venue Avail Book    ← Shows as "Booking" complete
```

**Admin View:**
```
●──●──●──●──◉──○
Req Venue Avail Book Inv Pay    ← Shows at "Invoice" stage
```

---

### Scenario 5: Request COMPLETED/PAID
**Sales Head View:**
```
●──●──●──◉
Req Venue Avail Book    ← Final stage for Sales Head
```

**Admin View:**
```
●──●──●──●──●──◉
Req Venue Avail Book Inv Pay    ← Final stage showing Payment
```

---

## Key Observations

1. **Sales Head Experience**
   - Cleaner, more focused workflow
   - Only sees stages relevant to their responsibility
   - Final stage is "Booking" - their primary deliverable
   - No confusion about invoice/payment stages they don't manage

2. **Admin Experience**
   - Unchanged and complete
   - Full visibility across entire workflow
   - Can track invoice and payment stages
   - Maintains operational oversight

3. **Status Mapping Intelligence**
   - Backend status remains unchanged (single source of truth)
   - Presentation layer adapts based on role
   - No data duplication or inconsistency
   - Type-safe implementation

---

## Legend
```
◉  Current stage (active)
●  Completed stage
○  Upcoming stage
── Connector line
```

---

**Document Version**: 1.0  
**Last Updated**: June 11, 2026
