# AVEMS Demo Mode Architecture

## Overview

Demo Mode is a development-only feature that enables complete application testing without writing to Supabase. When active, all data operations are redirected to browser localStorage using realistic seed data.

## Key Design Principles

1. **Zero Production Impact**: Demo Mode is only available in development builds (`import.meta.env.DEV === true`)
2. **Non-Breaking**: All existing screens work unchanged when Demo Mode is active
3. **No RBAC Changes**: Role-based access control remains unchanged
4. **Repository Pattern**: Single repository for all demo data operations

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AVEMS Application                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼───────┐ ┌────▼───────┐ ┌────▼────────┐
            │  Demo Mode    │ │ Production │ │   Manual    │
            │  (localStorage)│ │ (Supabase) │ │ Override    │
            └───────────────┘ └────────────┘ └─────────────┘
                    │               │
                    └───────┬───────┘
                            │
              ┌─────────────▼─────────────┐
              │     Service Router        │
              │    (meetingService/       │
              │     venueService)         │
              └───────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   Demo Repository         │
              │   (single source of truth)│
              └───────────────────────────┘
```

## Repository Pattern

### File Structure

```
src/
├── contexts/
│   └── DemoContext.tsx        # Provider, toggle, banner
├── lib/
│   └── demoMode.ts            # Control API (enable/disable/toggle)
├── demo/
│   ├── demoStorage.ts         # localStorage key-value store
│   ├── demoSeed.ts            # Realistic seed data
│   ├── demoRepository.ts      # Single repository for all demo data
│   ├── demoExport.ts          # Export demo data to JSON
│   └── demoImport.ts          # Import demo data from JSON
└── features/
    ├── meetings/
    │   └── meetingService.ts  # Router (Supabase or Demo)
    └── venues/
        └── venueService.ts    # Router (Supabase or Demo)
```

### Repository Implementation

**`src/demo/demoRepository.ts`** - Single source of truth for all demo data:

```typescript
export const demoRepository: DemoRepository = {
  getDivisions() { return demoGet(DEMO_COLLECTIONS.DIVISIONS); },
  getCities() { return demoGet(DEMO_COLLECTIONS.CITIES); },
  getMeetingRequests(userId, role) { /* ... */ },
  getHotels() { return demoGet(DEMO_COLLECTIONS.HOTELS); },
  // ... all other methods
};
```

### Service Router Pattern

**`src/features/meetings/meetingService.ts`**:

```typescript
const supabaseRepo = { /* supabaseApi methods */ };
const demoRepo = { /* demoRepository methods */ };

function getRepository() {
  return isDemoModeActive() ? demoRepo : supabaseRepo;
}

export const getDivisions = () => getRepository().getDivisions();
export const getMeetingRequests = async (user) => {
  const data = await getRepository().getMeetingRequests(user.id, user.role);
  return convertToMeetingRequest(data);
};
```

## Service Abstraction Layer

Each service simply:
1. Creates `supabaseRepo` with wrapped Supabase API calls
2. Uses `demoRepository` for demo data
3. Routes based on `isDemoModeActive()`
4. Converts demo types to domain types

### Adding New Modules

To add Demo Mode support to a new feature:

1. **Create a service router** (`features/*/service.ts`):
```typescript
import { isDemoModeActive } from '../../lib/demoMode';
import * as supabaseApi from './api';
import { demoRepository } from '../../demo/demoRepository';

const supabaseRepo = { /* wrap supabaseApi */ };
const demoRepo = { /* use demoRepository */ };

function getRepository() {
  return isDemoModeActive() ? demoRepo : supabaseRepo;
}

export const getItems = () => getRepository().getItems();
```

2. **Update hooks** to import from service instead of api:
```typescript
// Before
import * as api from './api';

// After
import * as api from './service';
```

## Demo Mode Controls

### Enable Demo Mode
```typescript
import { enableDemoMode } from '../lib/demoMode';
enableDemoMode();
```

### Check if Active
```typescript
import { isDemoModeActive } from '../lib/demoMode';
if (isDemoModeActive()) {
  // Demo mode active
}
```

### Use Demo Context Hook
```tsx
import { useDemo } from '../contexts/DemoContext';

const { isDemoMode, toggleDemoMode, resetDemoData, exportDemoData, importDemoData } = useDemo();
```

## Seed Data

### Available Collections
- `divisions` (3: West, North, South)
- `cities` (5: Mumbai, Delhi, Bengaluru, Hyderabad, Chennai)
- `meeting_types` (3: Cycle Meeting, National Conference, Training Program)
- `hotels` (5: Taj, JW Marriott, Imperial, ITC Gardenia, Novotel)
- `halls` (6: Grand Ballroom, Crystal Hall, Convention Centre, etc.)
- `meeting_requests` (4: Q1 Cycle Meeting, National Sales Conference, etc.)
- `quotations` (3: PENDING, PENDING, APPROVED)
- `bookings` (1: Confirmed)
- `invoices` (1: Pending)
- `payments` (1: Confirmed)

### Seeding
```typescript
import { seedDemoData } from '../demo/demoSeed';
seedDemoData(); // no-ops if already seeded
seedDemoData(true); // force re-seed
```

## Persistent State

Demo mode toggle is persisted in localStorage:
```typescript
localStorage.getItem('avems_demo_mode') // 'true' or null
```

Demo data is stored under `avems_demo_*` keys:
```typescript
avems_demo_meetings
avems_demo_divisions
avems_demo_cities
// ... other collections
```

## Development Workflow

### 1. Enable Demo Mode
- Navigate to Administration → Demo Tools (when available)
- Click "Enable Demo Mode"
- Seed data is automatically populated

### 2. Test Application
- All CRUD operations work without touching Supabase
- Data persists across page reloads (via localStorage)
- Reset button clears all demo data

### 3. Export/Import Data
- Export: Download JSON snapshot of all demo data
- Import: Restore from JSON snapshot

## Future Modules

New modules follow the same pattern:

1. Create service router (`features/*/service.ts`)
2. Use `demoRepository` for all operations
3. Convert demo types to domain types
4. Update hooks to import from service instead of api

## Environment Variables

No environment variables are required for Demo Mode to work. It's automatically active in development builds.

## Production Safety

Demo Mode is automatically disabled in production builds:
```typescript
export const IS_DEMO_AVAILABLE: boolean = (import.meta as any).env?.DEV === true;
```

## Migration Path

For existing features to support Demo Mode:

1. Create service abstraction file (`*Service.ts`)
2. Update hooks to import from service instead of api
3. Update pages to use service instead of api

## Benefits of Repository Pattern

1. **Single Source of Truth**: All demo data operations go through one repository
2. **Easy to Maintain**: Add new entities by adding collection keys, not duplicate API files
3. **Type Safety**: Demo types can be converted to domain types at service layer
4. **Future-Proof**: New modules just use the existing repository
5. **Clean Separation**: Data access is separated from business logic
