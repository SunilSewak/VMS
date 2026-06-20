## VMS Decision Log 

## Purpose 

This document records all major decisions related to VMS architecture, workflows, governance, data model, security, and implementation. 

All significant changes must be documented before implementation. 

The objective is to prevent: 

- Hidden decisions 

- Knowledge loss 

- Repeated discussions 

- Architecture drift 

- Conflicting implementations 

## Decision Format 

Every decision should follow: 

Decision ID: Category: Date: Status: Decision: Rationale: Implications: 

Status Values: 

- Proposed 

- Approved 

- Deprecated 

- Superseded 

## SECTION 1 — FOUNDATIONAL BUSINESS DECISIONS 

VMS-001 

Category 

Business Definition 

Status 

Approved 

Date 

2026-06-20 

Decision 

VMS is not a Venue Booking System. 

VMS is a Venue Management & Conference Operations System. 

## Rationale 

Venue booking is only one step within a larger operational workflow. 

The business process includes: 

Planning → Venue Allocation → Booking → Rooming → Invoice Audit → SAP Closure 

Implications 

All future architecture must support the complete lifecycle. 

## VMS-002 

Category 

Core Entity 

Status 

Approved 

Date 

2026-06-20 

Decision 

Event is the primary business entity. 

Rationale 

Every major operational process originates from an Event. 

Examples: 

- Venue Allocation 

- Booking 

- Rooming 

- Invoice 

- SAP Closure 

## Implications 

All major relationships should ultimately connect to Event. 

Hotels are supporting entities. 

## VMS-003 

## Category 

Operational Governance 

Status 

Approved 

Date 

2026-06-20 

## Decision 

Rooming List is the most important operational document. 

Rationale 

Rooming List serves as: 

- Participant List 

- Accommodation Plan 

- Attendance Reference 

- Audit Reference 

## Implications 

Downstream processes must support Rooming List linkage. 

## SECTION 2 — WORKFLOW DECISIONS 

## VMS-004 

Category 

Planning Workflow 

Status 

Approved 

Date 

2026-06-20 

Decision 

Planning begins with Annual Calendar. 

Workflow 

Annual Calendar ↓ Monthly Plan ↓ Event Creation 

Implications 

Events are generated from planning activities. 

## VMS-005 

Category 

Venue Governance 

Status 

Approved 

Date 

2026-06-20 

Decision 

Sales Head may review venue proposals. 

Final authority remains with VMS. 

## Sales Head Rights 

- Accept Venue 

- Request Alternative Venue 

- Submit Rooming List 

- Finalize Rooming List 

## Sales Head Restrictions 

- No Commercial Negotiation 

- No Booking Confirmation 

- No Invoice Audit 

## Implications 

Role permissions must enforce these restrictions. 

## VMS-006 

Category 

Venue Availability 

Status 

Approved 

Date 

2026-06-20 

Decision 

Venue availability validation is mandatory. 

Validation Criteria 

Hotel 

- Hall 

- Date Range 

## Implications 

Double booking prevention must be enforced at application level and database level. 

## VMS-007 

Category 

Hotel Eligibility 

Status 

Approved 

Date 

2026-06-20 

Decision 

Only approved hotels can participate in venue allocation. 

Allowed Statuses 

- Approved 

- Under Evaluation 

- Inactive 

- Blacklisted 

Implications 

Allocation screens must filter non-approved hotels. 

## SECTION 3 — COMMERCIAL DECISIONS 

## VMS-008 

Category 

Commercial Governance 

Status 

Approved 

Date 

2026-06-20 

## Decision 

## Commercial negotiation remains a VMS responsibility. 

## Implications 

Sales Head cannot modify commercial records. 

## VMS-009 

Category 

Commercial Source of Truth 

Status 

Approved 

Date 

2026-06-20 

Decision 

Approved Commercial becomes the financial source of truth. 

Audit Formula 

Approved Commercial 

- Final Rooming List 

- Invoice 

## Implications 

Invoice audit must not rely solely on invoice values. 

## VMS-010 

Category 

Commercial Versioning 

Status 

Approved 

## Date 

2026-06-20 

## Decision 

Commercials must support historical versioning. 

Rationale 

Rates change over time. 

Historical events must remain auditable. 

Implications 

Commercial tables require: 

- Effective From 

- Effective To 

- Status 

- Version Tracking 

## SECTION 4 — EVENT OPERATIONS DECISIONS 

VMS-011 

Category 

Room Blocking 

Status 

Approved 

Date 

2026-06-20 

Decision 

Room blocking is calculated from designation counts. 

Current Mapping 

SO → Triple Occupancy 

DM → Triple Occupancy 

RSM → Double Occupancy 

DSM → Double Occupancy 

NSM → Double Occupancy 

CH → Single Occupancy IBH → Suite 

Implications 

Room Blocking Engine must remain configurable. 

VMS-012 

Category 

Rooming Standardization Status 

Approved Date 2026-06-20 Decision 

One common rooming format shall be used across all divisions. 

Implications 

Division-specific rooming formats are not allowed. 

## SECTION 5 — SYSTEM ARCHITECTURE DECISIONS 

VMS-013 

Category 

Technology Stack 

Status 

Approved 

Date 

2026-06-20 

Decision 

Preferred Stack: 

Frontend 

- React 

- TypeScript 

- Vite 

Backend 

- Supabase 

Database 

 PostgreSQL 

Authentication 

- Supabase Auth 

Storage 

- Supabase Storage 

Implications 

Alternative technologies require explicit approval. 

VMS-014 

Category 

Application Architecture 

Status 

Approved 

## Date 

2026-06-20 

## Decision 

VMS will use Event Workspace architecture. 

## Workspace Tabs 

- Event Summary 

- Venue 

- Accommodation 

- Rooming 

- Invoice 

- Audit 

- SAP Closure 

## Implications 

Event Workspace becomes the primary operational screen. 

## SECTION 6 — SECURITY & ROLE DECISIONS 

## VMS-015 

Category 

Role Model 

Status 

Approved 

Date 

2026-06-20 

Decision 

Initial role structure: 

- SUPER_ADMIN 

- VMS_ADMIN 

- VMS_EXECUTIVE 

- SALES_HEAD 

- FINANCE 

- MANAGEMENT 

Implications 

Supabase RLS must be aligned to role responsibilities. 

## SECTION 7 — REPORTING DECISIONS 

## VMS-016 

Category 

Analytics 

Status 

Approved 

Date 

2026-06-20 

Decision 

Reporting shall include: 

- Spend Analytics 

- Savings Analytics 

- Venue Utilization 

- Vendor Performance 

Implications 

Historical data retention is mandatory. 

## Future Decisions 

Add all future approved decisions below this section using the same format. 

No major architecture, schema, workflow, or security changes should occur without a corresponding decision log entry. 

