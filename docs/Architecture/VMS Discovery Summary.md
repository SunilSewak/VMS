# VMS Discovery Summary

## Purpose

This document captures the key discoveries made during the VMS discovery
and workflow analysis phase.

The purpose is to preserve institutional knowledge and prevent
rediscovery during future architecture, development, and enhancement
activities.

# 1. What is VMS?

VMS is not a Venue Booking System.

VMS is a:

**Venue Management & Conference Operations System**

that manages:

Planning → Venue Allocation → Booking → Rooming → Invoice Audit → SAP
Closure

# 2. Current Team Structure

## VMS Team

Currently operated by a small centralized team.

Responsibilities:

-   Prepare Annual Calendar
-   Prepare Monthly Plan
-   Maintain Approved Hotel List
-   Allocate Venues
-   Negotiate Commercials
-   Confirm Bookings
-   Coordinate with Hotels
-   Receive Invoices
-   Audit Invoices
-   Maintain SAP Records
-   Maintain Historical Records

VMS Team is the primary operational user of the system.

## Sales Head

Responsibilities:

-   Review Monthly Plan
-   Review Proposed Venue
-   Request Alternative Venue
-   Submit Final Rooming List
-   Finalize Participant List

Sales Head does not:

-   Negotiate Hotels
-   Confirm Bookings
-   Audit Invoices

# 3. Core Business Flow

Annual Planning

VMS ↓ Annual Calendar ↓ Cluster Head Approval

Monthly Planning

VMS ↓ Monthly Plan ↓ Sales Head Review

Monthly Plan contains:

-   Meeting
-   Dates
-   City
-   Proposed Venue

Venue Review

Sales Head can:

-   Accept Venue
-   Request Alternate Approved Hotel
-   Request Other Venue with Justification

Final authority remains with VMS.

Venue Booking

VMS ↓ Commercial Negotiation ↓ Booking Confirmation

Only VMS can book venues.

# 4. Event Planning Logic

Planning is based on Active Employee Count.

Example:

CDC South 58 Active Employees

This becomes:

Expected PAX

Expected PAX drives:

-   Hall Planning
-   Room Blocking
-   Venue Booking

# 5. Rooming List Process

Rooming List is the most important operational document.

Current Reality:

Venues are booked months in advance.

Final Rooming List arrives only a few days before the event.

Rooming List contains:

-   Employee Name
-   Designation
-   Division
-   State
-   Region (Optional)
-   Occupancy
-   Check-In
-   Check-Out
-   NRC

Rooming List functions as:

-   Participant List
-   Accommodation Plan
-   Attendance Reference
-   Audit Reference

Future Principle:

One standardized Rooming List format across all divisions.

# 6. Venue Availability Logic

Venue availability checking is mandatory.

System must validate:

Hotel

-   Hall

-   Date Range

against existing bookings.

If conflict exists:

Display:

Already Booked Not Available

# 7. Venue Hierarchy

Zone ↓ State ↓ City ↓ Hotel ↓ Hall

Example:

South ↓ Karnataka ↓ Bangalore ↓ Fortune Celestial ↓ Buckingham 1

# 8. Masters Identified

Organization Masters

-   Cluster Master
-   Division Master
-   Zone Master
-   State Master
-   City Master

Event Masters

-   Meeting Type Master
-   Seating Style Master
-   Conference Type Master
-   Occupancy Type Master

Venue Masters

-   Hotel Master
-   Hotel Contact Master
-   Hall Master
-   Hotel Category Master

Commercial Masters

-   Vendor Master
-   Rate Card Master

Finance Masters

-   Cost Center Master
-   GL Code Master
-   Payment Status Master

Security

-   Role Master
-   Permission Matrix

# 9. Major Discoveries

Discovery 1

Event is the core entity.

Not Hotel.

Discovery 2

Rooming List is the most important operational document.

Discovery 3

Venue Availability Validation must be built into the system.

Discovery 4

Knowledge currently stored in spreadsheets and individual experience
should become institutional knowledge within VMS.
