## VMS Architecture Guiding Principles 

## Purpose 

This document defines the architectural principles governing all future design, development, enhancement, integration, and deployment decisions for the Venue Management System (VMS). 

These principles are mandatory architectural constraints. 

All future proposals must align with these principles. 

If a proposal conflicts with this document, the proposal must be revised or explicitly approved through the VMS Decision Log. 

## Principle 1 

## VMS Is Not a Venue Booking System 

VMS is a: 

## **Venue Management & Conference Operations System** 

Primary business scope: 

Planning → Venue Allocation → Booking → Rooming → Invoice Audit → SAP Closure 

Venue booking is only one stage of a larger operational workflow. 

System design must always support the complete event lifecycle. 

## Principle 2 

## Event Is The Core Business Entity 

The primary business object is: 

Event 

Not: 

 Hotel 

- Hall 

- Booking 

- Invoice 

- Rooming List 

All major workflows originate from an Event. 

Examples: 

Event → Venue Allocation 

Event → Booking 

Event → Rooming Event → Invoice 

Event → SAP Closure 

All major database relationships should ultimately connect back to Event. 

## Principle 3 

## Rooming List Is The Most Important Operational Document 

The Rooming List functions as: 

- Participant List 

- Accommodation Plan 

- Attendance Reference 

- Audit Reference 

The finalized Rooming List becomes the operational source of truth for event execution. 

Downstream processes must reference the finalized Rooming List whenever applicable. 

## Principle 4 

## Venue Availability Validation Is Mandatory 

Venue allocation must always validate: 

Hotel 

- Hall 

- Date Range 

against existing allocations and bookings. 

The system must prevent double booking. 

Availability validation is not optional. 

Availability must be evaluated before: 

- Venue Proposal 

- Venue Approval 

- Booking Confirmation 

## Principle 5 

## Planning Precedes Booking 

Event planning occurs before venue booking. 

The planning hierarchy is: 

Annual Calendar ↓ Monthly Plan ↓ Event Creation ↓ Venue Allocation ↓ Venue Booking 

The system should never begin with venue booking. 

## Principle 6 

## Approved Hotels Only 

Hotels must support lifecycle status management. 

Required statuses: 

- Approved 

- Under Evaluation 

- Inactive 

- Blacklisted 

Only Approved hotels may participate in venue allocation and booking workflows. 

## Principle 7 

## Sales Head Reviews. VMS Controls. 

Sales Head responsibilities: 

- Review Venue Proposal 

- Request Alternative Venue 

- Finalize Participant List 

- Finalize Rooming List 

Sales Head does not: 

- Negotiate Commercials 

- Confirm Bookings 

- Approve Invoices 

- Perform Invoice Audits 

Final operational authority remains with the VMS Team. 

## Principle 8 

## Approved Commercial Is Financial Source Of Truth 

Invoice auditing must compare: 

Approved Commercial 

- Final Rooming List 

- Hotel Invoice 

to determine financial variance. 

Invoice approval must never rely solely on invoice values. 

## Principle 9 

## Commercials Must Be Version Controlled 

Commercials change over time. 

Historical events must continue to reference the commercial valid at the time of booking. 

Commercial records must support: 

- Effective From Date 

- Effective To Date 

- Status 

- Version History 

Historical audits must remain reproducible. 

## Principle 10 

## Master Data Must Be Centrally Governed 

Master Data shall be maintained through controlled administration. Examples: 

Organization Masters 

- Cluster 

- Division 

- Zone 

- State 

- City 

Event Masters 

- Meeting Type 

- Seating Style 

- Occupancy Type 

Venue Masters 

- Hotel 

- Hall 

- Hotel Category 

Finance Masters 

- Cost Center 

- GL Code 

- Payment Status 

Master data should not be duplicated across operational modules. 

## Principle 11 

## Institutional Knowledge Must Be Captured 

The objective of VMS is not merely digitization. 

The objective is to convert: 

- Spreadsheet Knowledge 

- Individual Experience 

- Historical Practices 

into: 

- Standardized Rules 

- Validated Processes 

- System Intelligence 

Knowledge must become organizational assets. 

## Principle 12 

## Event Lifecycle Must Be Enforced 

All events progress through controlled lifecycle states. 

Approved lifecycle: 

Annual Calendar ↓ Monthly Plan ↓ Venue Allocation ↓ Sales Head Review ↓ Venue Booking ↓ Room Blocking ↓ Rooming List Submission ↓ Rooming List Finalization ↓ Event Execution 

↓ Invoice Receipt ↓ Invoice Audit ↓ SAP Upload ↓ Closed 

Lifecycle transitions must be controlled and auditable. 

## Principle 13 

## Event Workspace Is The Operational Center 

Users should work from an Event Workspace. 

The Event Workspace should become the primary operational screen. 

Typical tabs: 

- Event Summary 

- Venue 

- Accommodation 

- Rooming 

- Invoice 

- Audit 

- SAP Closure 

Users should not navigate through disconnected modules to complete event operations. 

## Principle 14 

## Auditability Is Mandatory 

All critical actions must be traceable. 

Examples: 

- Venue Allocation 

- Booking Confirmation 

- Commercial Approval 

- Rooming Finalization 

- Invoice Approval 

- SAP Upload 

The system must maintain audit history for operational accountability. 

## Principle 15 

## Simplicity Over Technical Complexity 

VMS is an internal enterprise application. 

Architecture should prioritize: 

- Maintainability 

- Operational Reliability 

- Ease of Support 

- Business Clarity 

Avoid unnecessary complexity. 

Business value takes precedence over technical sophistication. 

## Success Definition 

VMS is successful when: 

- Event operations are standardized 

- Venue allocation is controlled 

- Rooming is accurate 

- Invoice audits are reliable 

- SAP closure is traceable 

- Institutional knowledge is preserved 

- Operational dependency on individual employees is reduced 

The goal is operational governance, not merely software automation. 

