## VMS Database Blueprint 

## Purpose 

This document defines the logical database architecture for the Venue Management System (VMS). 

It serves as the authoritative source for: 

- Supabase Schema Design 

- Entity Relationships 

- API Design 

- Row Level Security Design 

- Migration Planning 

This document describes the business data model. 

Physical database implementation must align with this blueprint. 

## Database Design Principles 

## Principle 1 

Event is the primary business entity. 

All major operational entities must ultimately relate to an Event. 

## Principle 2 

UUIDs are the source of truth. 

Names are display values only. 

Relationships must use IDs. 

## Principle 3 

Historical records must remain auditable. 

No design should prevent historical reconstruction of: 

- Commercials 

- Bookings 

- Rooming Lists 

- Invoices 

- Audits 

## Principle 4 

Operational transactions and master data must remain separated. 

Master tables should not contain transactional information. 

## High Level Entity Groups 

## Security 

- Users 

- Roles 

- Permissions 

## Organization 

- Clusters 

- Divisions 

- Zones 

- States 

- Cities 

## Planning 

- Annual Calendar 

- Monthly Plans 

## Event Operations 

- Events 

- Venue Allocations 

- Bookings 

- Room Blocking 

##  Rooming 

## Venue Management 

- Hotels 

- Halls 

- Inventory 

- Contacts 

## Commercial Management 

- Approved Commercials 

- Commercial Versions 

## Finance 

- Invoices 

- Invoice Audits 

- Variances 

- SAP Closure 

## Analytics 

- Reporting Views 

- KPI Views 

## Security Domain 

## users 

Purpose: 

Application users. 

Key Fields: 

- id 

- employee_code 

- employee_name 

- email 

- role_id 

- active_flag 

## roles 

Purpose: 

Role definitions. 

Initial Roles: 

- SUPER_ADMIN 

- VMS_ADMIN 

- VMS_EXECUTIVE 

- SALES_HEAD 

- FINANCE 

- MANAGEMENT 

## permissions 

Purpose: 

Permission catalog. 

## role_permissions 

Purpose: 

Role-to-permission mapping. 

## Organization Domain 

## clusters 

Purpose: 

Business clusters. 

## divisions 

Purpose: 

Business divisions. 

Relationship: 

Cluster → Many Divisions 

## zones 

Purpose: 

Geographical zones. 

## states 

Relationship: 

Zone → Many States 

## cities 

Relationship: 

State → Many Cities 

## Planning Domain 

## annual_calendars 

Purpose: 

Annual planning schedule. 

Fields: 

- division_id 

- meeting_name 

- month 

- preferred_city_id 

- expected_pax 

## monthly_plans 

Purpose: 

Monthly planning derived from annual calendar. 

Fields: 

- annual_calendar_id 

- month 

- meeting_name 

- city_id 

- expected_pax 

- status 

## Event Domain 

## events 

Purpose: 

Primary business entity. 

Fields: 

- event_code 

- event_name 

- division_id 

- city_id 

- start_date 

- end_date 

- expected_pax 

- lifecycle_status 

Event Statuses: 

- Draft 

- Planned 

- Venue Proposed 

- Alternative Requested 

- Approved 

- Booked 

- Rooming Submitted 

- Rooming Finalized 

- Event Executed 

- Invoice Received 

- Audited 

- SAP Uploaded 

- Closed 

## event_activity_log 

Purpose: 

Complete audit trail of event actions. 

Examples: 

- Venue Proposed 

- Venue Approved 

- Rooming Finalized 

- Invoice Audited 

## Venue Domain 

## hotels 

Purpose: 

Hotel master. 

Hotel Status: 

- Approved 

- Under Evaluation 

- Inactive 

- Blacklisted 

Fields: 

- hotel_name 

- city_id 

- category_id 

 status 

## hotel_contacts 

Purpose: 

Hotel contacts. 

Relationship: 

Hotel → Many Contacts 

## hotel_categories 

Purpose: 

Hotel classification. 

Examples: 

- Premium 

- Business 

- Budget 

## halls 

Purpose: 

Hall master. 

Fields: 

- hotel_id 

- hall_name 

- capacity 

- sq_ft 

- dimensions 

- floor 

- boardroom_flag 

- terrace_flag 

- pillar_information 

Relationship: 

Hotel → Many Halls 

## venue_photos 

Purpose: 

Store hotel and hall photographs. 

## hotel_inventories 

Purpose: 

Accommodation inventory. 

Fields: 

- hotel_id 

- single_rooms 

- double_rooms 

- triple_rooms 

- suites 

## Venue Allocation Domain 

## venue_allocations 

Purpose: 

Venue proposals for events. 

Relationship: 

Event → Proposed Hotel → Proposed Hall 

Statuses: 

- Proposed 

- Accepted 

- Alternative Requested 

- Approved 

- Rejected 

## venue_calendar 

Purpose: 

Venue occupancy calendar. 

Used for: 

Hotel 

- Hall 

- Date Range 

availability validation. 

## Booking Domain 

## bookings 

Purpose: Confirmed venue bookings. 

Fields: 

- event_id 

- hotel_id 

- hall_id 

- booking_reference 

- booking_date 

- booking_status 

Booking Status: 

- Pending 

- Confirmed 

- Cancelled 

## Room Blocking Domain 

## room_requirements 

Purpose: 

Store room requirement calculations. 

Fields: 

- so_count 

- dm_count 

- rsm_count 

- dsm_count 

- ch_count 

- ibh_count 

- nsm_count 

Calculated Outputs: 

- triple_rooms 

- double_rooms 

- single_rooms 

- suites 

## Rooming Domain 

## rooming_submissions 

Purpose: 

Container for rooming uploads. 

Reason: 

Multiple revisions may occur before finalization. 

Statuses: 

- Draft 

- Submitted 

- Finalized 

Relationship: 

Event → Many Rooming Submissions 

## rooming_participants 

Purpose: 

Individual participants. 

Fields: 

- employee_name 

- designation 

- division 

- state 

- region 

- occupancy_type 

- check_in 

- check_out 

- nrc_flag 

Relationship: 

Rooming Submission → Many Participants 

## Commercial Domain 

## approved_commercials 

Purpose: 

Commercial agreement header. 

Relationship: 

Hotel → Many Commercial Versions 

## commercial_versions 

Purpose: 

Historical commercial versions. 

Fields: 

- room_rate 

- food_rate 

- hall_rate 

- effective_from 

- effective_to 

- version_number 

- status 

Reason: 

Historical audits must remain reproducible. 

## Finance Domain 

## invoices 

Purpose: 

Hotel invoices. 

Fields: 

- invoice_number 

- invoice_date 

- invoice_amount 

- invoice_status 

## invoice_audits 

Purpose: 

Audit results. 

Fields: 

- expected_cost 

- actual_cost 

- variance_amount 

- audit_status 

## Statuses: 

- Pass 

- Review Required 

- Warning 

- Critical 

## invoice_variances 

Purpose: 

Detailed variance records. 

Variance Types: 

- Room Variance 

- Food Variance 

- Hall Variance 

- NRC Variance 

- Total Variance 

## SAP Domain 

## sap_closures 

Purpose: 

SAP upload tracking. 

Fields: 

- sap_reference 

- upload_date 

- payment_status 

- closure_status 

Payment Status: 

- Pending 

- Processed 

- Paid 

Closure Status: 

- Open 

- Closed 

## Analytics Domain 

## vw_spend_by_hotel 

Purpose: 

Hotel spending analytics. 

## vw_spend_by_division 

Purpose: 

Division spending analytics. 

## vw_venue_utilization 

Purpose: 

Venue utilization analytics. 

## vw_vendor_performance 

Purpose: 

Vendor performance analytics. 

## Future Expansion 

Potential future modules: 

- Event Budgeting 

- Travel Management 

- Attendance Capture 

- Vendor Scorecards 

- Contract Repository 

- Approval Workflows 

- AI Recommendation Engine 

These should be added without violating existing architecture principles. 

## Success Standard 

The database architecture is successful when: 

- Event remains the primary entity 

- Historical audits remain reproducible 

- Venue availability is enforceable 

- Rooming revisions are supported 

- Commercial versioning is preserved 

- Reporting is reliable 

- Operational knowledge becomes institutionalized 

