# Venue Repository Reconciliation Audit

**Date:** June 13, 2026  
**Status:** AUDIT ONLY - NO MODIFICATIONS  
**Objective:** Reconcile live database schema with approved venue architecture

---

## Executive Summary

The live database contains partial implementations of Zone Master and Occupancy Management. Before proceeding with Step 2 (Hotel Enhancements) or additional migrations, a complete audit is required to:

1. Document existing table structures
2. Identify gaps vs. approved architecture
3. Detect redundant/conflicting components
4. Plan reconciliation without data loss

---

## INSTRUCTIONS FOR AUDIT EXECUTION

### Step 1: Run Audit Queries in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy entire contents from `VENUE_REPOSITORY_AUDIT_QUERIES.sql`
3. Execute the queries
4. Document the results in sections below

### Step 2: Fill Results in This Document

Use query results to populate sections:
- Section 1: Current Database Structure
- Section 2: Differences
- Section 3: Missing Components
- Section 4: Redundant Components
- Section 5: Reconciliation Plan

---

## Section 1: Current Database Structure

### 1.1 Zones Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'zones']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM zones]
- Result: ___

---

### 1.2 Cities Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'cities']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM cities]
- Result: ___

**Cities without Zone Assignment:**
```
(pending audit - execute: SELECT COUNT(*) FROM cities WHERE zone_id IS NULL)
```

---

### 1.3 Hotels Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'hotels']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM hotels]
- Result: ___

---

### 1.4 Halls Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'halls']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM halls]
- Result: ___

---

### 1.5 Hotel Accommodation Inventory Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'hotel_accommodation_inventory']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM hotel_accommodation_inventory]
- Result: ___

---

### 1.6 Hotel Occupancy Rules Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'hotel_occupancy_rules']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Foreign Keys:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM hotel_occupancy_rules]
- Result: ___

---

### 1.7 Default Occupancy Rules Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'default_occupancy_rules']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Indexes:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM default_occupancy_rules]
- Result: ___

---

### 1.8 Venue Import History Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'venue_import_history']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM venue_import_history]
- Result: ___

---

### 1.9 Venue Photos Table

**Query Result:** [Execute: SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'venue_photos']

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| (pending audit) | | | |

**Constraints:**
```
(pending audit)
```

**Data Count:** [Execute: SELECT COUNT(*) FROM venue_photos]
- Result: ___

---

## Section 2: Function Audit

### 2.1 update_hotel_suitability Function

**Exists:** [Execute: SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_hotel_suitability']
- Result: ___

**Definition:**
```sql
(pending audit - get function code)
```

**Purpose:** ___

**Called By:** [Check triggers and application code]
- ___

---

### 2.2 increment_venue_usage Function

**Exists:** [Execute: SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'increment_venue_usage']
- Result: ___

**Definition:**
```sql
(pending audit - get function code)
```

**Purpose:** ___

**Called By:** [Check triggers and application code]
- ___

---

## Section 3: Trigger Audit

### 3.1 All Triggers in Database

**Query Result:** [Execute: SELECT trigger_name, event_object_table, event_manipulation, action_timing FROM information_schema.triggers WHERE trigger_schema = 'public']

| Trigger | Table | Event | Timing |
|---------|-------|-------|--------|
| (pending audit) | | | |

---

### 3.2 Triggers on Hotels Table

```
(pending audit - list all triggers)
```

---

### 3.3 Triggers on Halls Table

```
(pending audit - list all triggers)
```

---

### 3.4 Triggers on Hotel Accommodation Inventory Table

```
(pending audit - list all triggers)
```

---

### 3.5 Triggers on Hotel Occupancy Rules Table

```
(pending audit - list all triggers)
```

---

### 3.6 Triggers on Cities Table

```
(pending audit - list all triggers)
```

---

### 3.7 Triggers on Zones Table

```
(pending audit - list all triggers)
```

---

## Section 4: RLS Policy Audit

### 4.1 Zones Table Policies

**RLS Enabled:** [Execute: SELECT rowsecurity FROM pg_tables WHERE tablename = 'zones']
- Result: ___

**Policies:**
```
(pending audit - list policies)
```

---

### 4.2 Hotels Table Policies

**RLS Enabled:** [Execute: SELECT rowsecurity FROM pg_tables WHERE tablename = 'hotels']
- Result: ___

**Policies:**
```
(pending audit - list policies)
```

---

### 4.3 Halls Table Policies

**RLS Enabled:** [Execute: SELECT rowsecurity FROM pg_tables WHERE tablename = 'halls']
- Result: ___

**Policies:**
```
(pending audit - list policies)
```

---

### 4.4 Hotel Accommodation Inventory Table Policies

**RLS Enabled:** [Execute: SELECT rowsecurity FROM pg_tables WHERE tablename = 'hotel_accommodation_inventory']
- Result: ___

**Policies:**
```
(pending audit - list policies)
```

---

### 4.5 Hotel Occupancy Rules Table Policies

**RLS Enabled:** [Execute: SELECT rowsecurity FROM pg_tables WHERE tablename = 'hotel_occupancy_rules']
- Result: ___

**Policies:**
```
(pending audit - list policies)
```

---

## Section 5: Differences Between Live Schema and Approved Architecture

### 5.1 Approved Venue Architecture

```
Zone
├── City
│   ├── Hotel
│   │   ├── Hall
│   │   ├── Accommodation Inventory
│   │   └── Occupancy Rules
│   └── ...
├── Default Occupancy Rules (zone-level)
└── Venue Import History (zone-level)

Separate:
├── Venue Photos (references hotels/halls)
```

### 5.2 What Exists in Live Database

```
(pending audit - describe actual structure)
```

### 5.3 Gaps Identified

- [ ] ___
- [ ] ___
- [ ] ___

### 5.4 Extra Components (Not in Approved Architecture)

- [ ] ___
- [ ] ___

### 5.5 Relationship Mismatches

| Expected | Live | Issue |
|----------|------|-------|
| (pending) | (pending) | (pending) |

---

## Section 6: Missing Components Still Required

Based on approved architecture, the following components are missing or incomplete:

### Missing Tables

- [ ] ___

### Missing Columns

**Table Name:**
- [ ] Column: ___ (Type: ___, Constraints: ___)
- [ ] Column: ___ (Type: ___, Constraints: ___)

### Missing Constraints

**Table Name:**
- [ ] Foreign Key: ___ → ___
- [ ] Check Constraint: ___
- [ ] Unique Constraint: ___

### Missing Indexes

**Table Name:**
- [ ] Index on: ___
- [ ] Index on: ___

### Missing Functions

- [ ] ___
- [ ] ___

### Missing Triggers

**Table Name:**
- [ ] Trigger: ___ (on INSERT/UPDATE/DELETE)
- [ ] Trigger: ___ (on INSERT/UPDATE/DELETE)

### Missing RLS Policies

**Table Name:**
- [ ] Policy: ___
- [ ] Policy: ___

---

## Section 7: Redundant Components

Components that exist but conflict with approved architecture:

### Redundant Tables

- [ ] ___

### Redundant Columns

**Table:** ___
- [ ] Column: ___ (Reason: ___)

### Obsolete Functions

- [ ] Function: ___ (Reason: ___)

### Obsolete Triggers

**Table:** ___
- [ ] Trigger: ___ (Reason: ___)

---

## Section 8: Reconciliation Plan

### Phase 1: Validate Live Schema

**Actions:**
1. [ ] Verify all existing tables have correct structure
2. [ ] Check data integrity in all tables
3. [ ] Confirm foreign key relationships
4. [ ] Validate RLS policies

**Timeline:** ___

**Risk:** Low (read-only audit)

---

### Phase 2: Identify Missing Components

**Actions:**
1. [ ] List all missing columns
2. [ ] List all missing constraints
3. [ ] List all missing indexes
4. [ ] List all missing functions/triggers

**Timeline:** ___

**Risk:** None (analysis only)

---

### Phase 3: Plan Schema Modifications

**Actions:**
1. [ ] Determine which existing tables can be reused
2. [ ] Plan new table creation
3. [ ] Plan column additions
4. [ ] Plan constraint additions
5. [ ] Plan function/trigger creation

**Timeline:** ___

**Risk:** Medium (requires testing)

---

### Phase 4: Execute Reconciliation (FUTURE)

**DO NOT EXECUTE YET**

Planned modifications:
1. Add missing columns to existing tables
2. Create new tables
3. Create missing constraints
4. Create missing indexes
5. Create missing functions/triggers
6. Backfill any required data

---

## Summary Table

| Component | Status | Live Count | Expected | Gap | Notes |
|-----------|--------|-----------|----------|-----|-------|
| Zones | (audit) | ___ | 5 | ___ | ✓/✗ |
| Cities | (audit) | ___ | 100+ | ___ | ✓/✗ |
| Hotels | (audit) | ___ | ? | ___ | ✓/✗ |
| Halls | (audit) | ___ | ? | ___ | ✓/✗ |
| Accommodation Inventory | (audit) | ___ | ? | ___ | ✓/✗ |
| Occupancy Rules | (audit) | ___ | ? | ___ | ✓/✗ |
| Venue Photos | (audit) | ___ | ? | ___ | ✓/✗ |
| Functions | (audit) | ___ | ? | ___ | ✓/✗ |
| Triggers | (audit) | ___ | ? | ___ | ✓/✗ |

---

## Recommendations

Based on audit findings, the recommended next steps are:

1. **Immediate:** Document all schema differences
2. **Short-term:** Create reconciliation migration scripts (non-destructive)
3. **Medium-term:** Execute reconciliation in dev environment first
4. **Long-term:** Validate in staging before production deployment

**DO NOT proceed with Step 2 (Hotel Enhancements) until reconciliation is complete.**

---

## Audit Completion Checklist

- [ ] All query results collected
- [ ] Section 1 (Current Structure) completed
- [ ] Section 2 (Functions) completed
- [ ] Section 3 (Triggers) completed
- [ ] Section 4 (RLS Policies) completed
- [ ] Section 5 (Differences) completed
- [ ] Section 6 (Missing Components) completed
- [ ] Section 7 (Redundant Components) completed
- [ ] Section 8 (Reconciliation Plan) completed
- [ ] Summary Table filled
- [ ] Recommendations documented
- [ ] Reviewed by technical lead

---

**End of Audit Document**

**Status:** Awaiting database query execution and results
