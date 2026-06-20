# VMS React Implementation Roadmap

## Purpose
This document defines the implementation roadmap for building the Venue Management System (VMS) using:
- React
- TypeScript
- Vite
- Supabase
- PostgreSQL

The roadmap establishes:
- Build Sequence
- Dependencies
- Milestones
- MVP Scope
- Production Readiness Criteria

This roadmap must be followed during implementation.
Architecture should not be discovered during development.
________________________________________

## Guiding Principles
### Principle 1: Build Foundations First.
Do not build business modules before:
- Authentication
- Roles
- Database
- Navigation
are established.
________________________________________
### Principle 2: Database Before Screens.
Schema design precedes UI development.
________________________________________
### Principle 3: Event Workspace First.
The Event Workspace is the operational heart of the application.
________________________________________
### Principle 4: Build In Layers.
Foundation ↓ Masters ↓ Events ↓ Finance ↓ Analytics
________________________________________

## Phase 0: Project Initialization
### Objective
Create technical foundation.
________________________________________
### Deliverables
**React Setup**
vite, React, TypeScript 
**UI Foundation**
tailwindCSS, Layout System, Theme System, Navigation Framework 
**Supabase Foundation**
database connection, Authentication, Storage, Environment Variables 
**Development Standards**
eSlint, Prettier, Folder Structure 
### Exit Criteria
the application starts successfully. Authentication works. Supabase connected.
________________________________________
## Phase 1: Security & Governance
### Objective
Implement RBAC foundation.
________________________________________
### Deliverables
**Authentication:** Login, Logout, Session Persistence 
**User Management:** Users, Roles, Permissions 
**Route Protection:** Examples: Finance Only, Admin Only, Sales Head Only 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. 
defaults to role-based access control and route protection. ____________________________________________________ **Supabase RLS:** Implement User Visibility Rules Role Visibility Rules Module Restrictions ____________________________________________________ **Exit Criteria:** Users can access only authorized modules. ________________________________________ ## Phase 2: Master Data Center Objective Build all foundational master data. ________________________________________ Deliverables Organization Masters Clusters Divisions Zones States Cities Event Masters Meeting Types Seating Styles Occupancy Types Venue Masters Hotels Halls Categories Contacts Finance Masters Cost Centers GL Codes Payment Status ________________________________________ Exit Criteria All master records manageable from UI. ________________________________________ ## Phase 3: Planning Module Objective Implement planning foundation. ________________________________________ Deliverables Annual Calendar Features: Create Edit Archive Monthly Planning Features: Generate Edit Finalize Planning Dashboard Display: Planned Events Expected PAX Calendar View ________________________________________ Exit Criteria Events can be generated from plans. ________________________________________ ## Phase 4: Event Core Objective Create operational event foundation. ________________________________________ Deliverables Event Registry Features: Create Event Edit Event Search Events Filter Events Event Lifecycle Statuses: Draft Planned Venue Proposed Approved Booked Closed Activity Log Track User Action Timestamp ________________________________________ Exit Criteria Event lifecycle operational. ________________________________________ ## Phase 5: Event Workspace Objective Create primary operational screen. ________________________________________ Deliverables - Event Summary Tab - Venue Allocation Tab - Booking Tab - Accommodation Tab - Rooming Tab - Invoice Tab - Audit Tab - SAP Closure Tab - Activity Log Tab ________________________________________ Exit Criteria Users can complete major event operations from one workspace. ________________________________________ ## Phase 6: Venue Allocation Engine Objective Automate venue evaluation. ________________________________________ Deliverables Venue Availability Engine Validate Hotel Hall Date Range Recommendation Engine Evaluate Hall Capacity Accommodation Capacity Cost Availability Venue Proposal Workflow Support Proposal Review Approval Exit Criteria Venue allocation workflow operational. ________________________________________ ## Phase 7: Room Blocking Engine Objective Automate room estimation. ________________________________________ Deliverables Occupancy Rules SO → Triple DM → Triple RSM → Double DSM → Double NSM → Double CH → Single IBH → Suite Calculator Input Designation Counts Output • Triple Rooms • Double Rooms • Single Rooms • Suites Exit Criteria Room requirements generated automatically. ________________________________________ ## Phase 8: Rooming Module Objective Manage participant planning.