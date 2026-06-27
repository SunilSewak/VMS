# VMS Master Data Taxonomy

This document outlines the Master Data taxonomy required to power the Planning-First Venue Management System (VMS) architecture.

## 1. Geographical Structure
* **Zone**: Highest level geographical region (e.g., North, South, East, West).
* **Cluster**: Grouping of divisions for administrative approval (e.g., Cardiac, Derma).
* **Division**: Business unit mapped to a specific cluster.
* **City**: Target location for events, linked to Zones.

## 2. Organization Structure
* **Team**: The functional group attending an event (e.g., SO, DM, RSM, ZSM).
* **Designation**: Specific roles within a team, critical for Room Blocking rules.

## 3. Training & Event Configuration
* **Training Type**: The category of training (e.g., CBM, G2G, Leadership Workshop). Defines expected duration and applicable teams.

## 4. Venue & Accommodation Data
* **Hotel Category**: Rating system for hotels (e.g., 5 Star, 4 Star).
* **Hotel**: Empaneled property linked to a specific City.
* **Hall**: Specific meeting space within a Hotel, with defined `capacity` and `seating_style` configurations.

## 5. Rooming Rules Engine (Configuration)
The Rooming Rules Engine maps Designations to Room Types and Occupancy logic.
* **Rule Table Structure**:
  * `designation_id`: Foreign key to Designation.
  * `room_type`: Enum (`Single`, `Double`, `Triple`).
  * `occupancy`: Integer (1, 2, or 3).
  
### Example Rule Mapping:
| Designation | Room Type | Occupancy |
|-------------|-----------|-----------|
| SO          | Triple    | 3         |
| DM          | Double    | 2         |
| RSM         | Single    | 1         |
| ZSM         | Single    | 1         |
| CH          | Single    | 1         |

*Note: In the architectural phase, this logic is mocked via `src/lib/roomBlockingEngine.ts`. In production, this must be editable via the Administration module.*
