# VMS Event Lifecycle And Workflow

## Purpose

This document defines the official event lifecycle for the Venue
Management System (VMS).

It establishes:

-   Workflow stages
-   Status transitions
-   Ownership
-   Approval authority
-   Entry criteria
-   Exit criteria
-   Notifications
-   Dashboard behavior

All application workflows must align with this lifecycle.

# Core Principle

VMS is an Event-Centric system.

Every operational activity begins with an Event and progresses through a
controlled lifecycle.

Examples:

-   Venue Allocation
-   Room Blocking
-   Booking
-   Rooming
-   Invoice Audit
-   SAP Closure

All activities must be traceable back to the Event.

# Event Lifecycle Overview

Annual Calendar ↓ Monthly Plan ↓ Event Creation ↓ Venue Allocation ↓
Sales Head Review ↓ Venue Approval ↓ Booking Confirmation ↓ Room
Blocking ↓ Rooming Submission ↓ Rooming Finalization ↓ Event Execution ↓
Invoice Receipt ↓ Invoice Audit ↓ SAP Upload ↓ Closure

# Lifecycle Stage 1

## Annual Calendar

### Purpose

Create annual planning visibility.

### Owner

VMS Team

### Inputs

-   Division
-   Meeting Type
-   Expected Month
-   Expected PAX

### Outputs

Annual Calendar Record

### Exit Criteria

Calendar approved.

### Next Stage

Monthly Plan

# Lifecycle Stage 2

## Monthly Plan

### Purpose

Convert annual plans into executable monthly activities.

### Owner

VMS Team

### Inputs

-   Annual Calendar
-   Updated Business Requirements

### Outputs

Monthly Plan

Contains:

-   Meeting
-   City
-   Tentative Dates
-   Expected PAX

### Exit Criteria

Monthly Plan finalized.

### Next Stage

Event Creation

# Lifecycle Stage 3

## Event Creation

### Purpose

Create operational Event record.

### Owner

VMS Team

### Inputs

-   Approved Monthly Plan

### Outputs

Event

Status:

Planned

### Exit Criteria

Event created.

### Next Stage

Venue Allocation

# Lifecycle Stage 4

## Venue Allocation

### Purpose

Identify suitable venue.

### Owner

VMS Team

### Activities

-   Hotel Evaluation
-   Hall Evaluation
-   Capacity Validation
-   Availability Validation

### Validation Rules

Hotel

-   Hall

-   Date Range

must be available.

Only Approved hotels may be proposed.

### Outputs

Venue Proposal

Status:

Venue Proposed

### Next Stage

Sales Head Review

# Lifecycle Stage 5

## Sales Head Review

### Purpose

Business review of proposed venue.

### Owner

Sales Head

### Available Actions

Accept Venue

OR

Request Alternate Approved Venue

OR

Request New Venue With Justification

### Approval Authority

Final authority remains with VMS.

### Outputs

Venue Decision

### Statuses

Accepted

Alternative Requested

Rejected

### Next Stage

Venue Approval

# Lifecycle Stage 6

## Venue Approval

### Purpose

Finalize selected venue.

### Owner

VMS Admin

### Activities

-   Review recommendation
-   Review alternatives
-   Final venue selection

### Outputs

Approved Venue

Status:

Approved

### Next Stage

Booking Confirmation

# Lifecycle Stage 7

## Booking Confirmation

### Purpose

Secure venue.

### Owner

VMS Team

### Activities

-   Commercial negotiation
-   Booking confirmation
-   Hotel coordination

### Outputs

Confirmed Booking

Status:

Booked

### Next Stage

Room Blocking

# Lifecycle Stage 8

## Room Blocking

### Purpose

Estimate room requirement.

### Owner

VMS Team

### Inputs

Designation Counts

Examples:

-   SO
-   DM
-   RSM
-   DSM
-   CH
-   IBH
-   NSM

### Outputs

Estimated:

-   Triple Rooms
-   Double Rooms
-   Single Rooms
-   Suites

### Purpose

Reserve inventory prior to final participant list.

### Next Stage

Rooming Submission

# Lifecycle Stage 9

## Rooming Submission

### Purpose

Receive participant details.

### Owner

Sales Head

### Inputs

Participant List

### Rooming Fields

-   Employee Name
-   Designation
-   Division
-   State
-   Region
-   Occupancy
-   Check-In
-   Check-Out
-   NRC

### Outputs

Submitted Rooming List

Status:

Rooming Submitted

### Next Stage

Rooming Finalization

# Lifecycle Stage 10

## Rooming Finalization

### Purpose

Lock operational participant list.

### Owner

Sales Head

### Validation

Participant review complete.

### Outputs

Final Rooming List

Status:

Rooming Finalized

### System Behavior

List becomes read-only.

Audit baseline established.

### Next Stage

Event Execution

# Lifecycle Stage 11

## Event Execution

### Purpose

Conduct event.

### Owner

Business Team

### Activities

-   Check-In
-   Accommodation
-   Hall Usage
-   Conference Execution

### Outputs

Completed Event

Status:

Executed

### Next Stage

Invoice Receipt

# Lifecycle Stage 12

## Invoice Receipt

### Purpose

Receive hotel invoice.

### Owner

VMS Team

### Inputs

Hotel Invoice

### Outputs

Invoice Record

Status:

Invoice Received

### Next Stage

Invoice Audit

# Lifecycle Stage 13

## Invoice Audit

### Purpose

Validate invoice accuracy.

### Owner

Finance

### Audit Inputs

Approved Commercial

-   Final Rooming List

-   Invoice

### Outputs

Audit Result

### Possible Results

Pass

Review Required

Warning

Critical

### Status

Audited

### Next Stage

SAP Upload

# Lifecycle Stage 14

## SAP Upload

### Purpose

Create payment reference.

### Owner

Finance

### Outputs

SAP Reference Number

### Status

SAP Uploaded

### Next Stage

Closure

# Lifecycle Stage 15

## Closure

### Purpose

Complete event lifecycle.

### Owner

Finance

### Activities

-   Payment Tracking
-   Closure Validation

### Outputs

Closed Event

Status:

Closed

# Event Status Model

Approved Status Sequence:

Draft

↓

Planned

↓

Venue Proposed

↓

Alternative Requested

↓

Approved

↓

Booked

↓

Rooming Submitted

↓

Rooming Finalized

↓

Executed

↓

Invoice Received

↓

Audited

↓

SAP Uploaded

↓

Closed

# Dashboard Classification

## Upcoming Events

Statuses:

-   Planned
-   Venue Proposed
-   Approved
-   Booked

## Events Requiring Action

Statuses:

-   Alternative Requested
-   Rooming Submitted
-   Invoice Received
-   Review Required

## Ongoing Events

Statuses:

-   Rooming Finalized
-   Executed

## Closed Events

Status:

-   Closed

# Notification Triggers

## Venue Proposed

Notify:

Sales Head

## Alternative Requested

Notify:

VMS Team

## Booking Confirmed

Notify:

Sales Head

## Rooming Pending

Notify:

Sales Head

## Rooming Finalized

Notify:

VMS Team

Finance

## Invoice Uploaded

Notify:

Finance

## Audit Completed

Notify:

VMS Admin

Management

## SAP Uploaded

Notify:

Management

# Audit Requirements

The following lifecycle transitions must be logged:

-   Venue Proposal
-   Venue Approval
-   Booking Confirmation
-   Rooming Finalization
-   Invoice Audit
-   SAP Upload
-   Event Closure

Required Audit Fields:

-   User
-   Timestamp
-   Previous Status
-   New Status
-   Remarks

# Success Standard

The lifecycle is successful when:

-   Every event follows a controlled process
-   Approvals are traceable
-   Venue allocation is governed
-   Rooming is standardized
-   Financial audits are reproducible
-   SAP closure is traceable
-   Operational visibility exists at every stage

The objective is operational governance from planning through closure.
