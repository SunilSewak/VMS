# VMS Module Architecture

## Purpose
This document defines the frontend architecture for the Venue Management System (VMS). It serves as the authoritative source for:
- Navigation Design
- Page Structure
- Module Boundaries
- Event Workspace Design
- Dashboard Design
- User Experience Architecture

This document describes what should exist in the application before implementation begins.
---

## Architectural Principles
### Principle 1
**Event is the center of the application.**
Users should work through Events.
Not through Hotels.
Not through Halls.
Not through Invoices.
---
### Principle 2
**Event Workspace is the primary operational screen.**
Users should complete most activities inside the Event Workspace.
---
### Principle 3
**Master Data and Transactions must remain separated.**
*Example:*
Hotels are maintained in Masters.
Bookings are maintained in Events.
---
### Principle 4
**Navigation should reflect the business process.**
the application should feel like an operations platform, not an ERP or a database editor.
---

## Application Structure
### Primary Navigation
- Dashboard
- Planning
- Events
- Masters
- Finance
- Analytics
- Administration
---
## Module 1: Dashboard 
### Purpose:
Provide operational visibility.
### Primary Users:
• VMS Admin 
• VMS Executive 
• Management 
### Dashboard Components:
#### KPI Cards Display:
to show:
total Events, Upcoming Events, Events Requiring Action, Ongoing Events, Closed Events.
#### Action Center:
tasks requiring attention such as Alternative Venue Requests, Pending Rooming Lists, Pending Invoices, Pending Audits.
#### Event Pipeline:
events by lifecycle stage e.g., Planned, Venue Proposed, Booked, Rooming Pending, Invoice Pending.
#### Upcoming Events:
display next 30 days' events.
#### Recent Activities:
display latest workflow actions like Booking Confirmed, Rooming Finalized, Audit Completed.
---
## Module 2: Planning 
### Purpose:
managing planning activities.
### Functions:
aCreate Annual Plan,
eEdit Annual Plan,
eApprove Annual Plan,
eArchive Annual Plan;
and generate Monthly Plans with options to generate, edit and finalize monthly plans;
and display upcoming meetings and activity summaries on Planning Dashboard.
'these include functions for managing annual and monthly planning processes.'
defaults to a detailed overview of each function's purpose and capabilities.'
defaults to a detailed overview of each function's purpose and capabilities.'
defaults to a detailed overview of each function's purpose and capabilities.'