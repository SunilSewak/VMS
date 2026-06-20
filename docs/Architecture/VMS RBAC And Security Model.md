# VMS RBAC And Security Model

## Purpose
This document defines the Role-Based Access Control (RBAC) framework for the Venue Management System (VMS). It establishes:
- User Roles
- Permissions
- Ownership Rules
- Approval Authority
- Visibility Rules
- Security Boundaries
- Supabase RLS Direction

This document serves as the authoritative source for application security design.

---

## Security Principles
### Principle 1
Users should only access information required for their responsibilities.

### Principle 2
Approval authority must be separated from operational execution.

### Principle 3
Financial activities require stronger controls than operational activities.

### Principle 4
All critical actions must be auditable.

### Principle 5
Role permissions must be enforced at:
- UI Level
- API Level
- Database Level

---

## Role Hierarchy
the hierarchy from highest to lowest:
| Highest Authority |
|---------------------|
| SUPER_ADMIN |
| VMS_ADMIN |
| VMS_EXECUTIVE |
| FINANCE |
| SALES_HEAD |
| MANAGEMENT |
 
---
 
## Role Definitions 
### SUPER_ADMIN 
purpose: System owner.
bResponsibilities:
- Full application administration 
- Security administration 
- User management 
- Role management 
- System configuration 
- Audit review 
dAccess: All modules. Restrictions: None.
 
defaults to full control over the system.
details about other roles follow in similar structure, including purpose, responsibilities, access, and restrictions.
details include:
vms_admin, vms_executive, sales_head, finance, management with respective responsibilities and restrictions.
detailed module access matrix follows with columns for each role and rows for each module such as Dashboard, Annual Calendar, Monthly Planning, etc., indicating level of access like Full, Edit, View, Limited, No Access.
details on event lifecycle permissions specify which roles can create, approve or view various event-related actions like Annual Calendar creation and approval,
and venue allocation review process,
booking confirmation approvals,
and invoice receipt uploads and reviews.
details on invoice audit processes,
sap closure procedures,
and master data governance including editable by roles and covered masters list.
details on commercial governance covering creation, modification, viewing rights,
and commercial approval authority.
audit requirements specify actions that generate audit records and fields recorded during audits.
details on row level security strategy emphasizing that frontend visibility is not security and that security enforcement occurs in Supabase.
each user role's specific record access permissions are outlined including management (read-only), sales head (editable certain records), finance (editable financial records), vms executive (operational records), vms admin (broad operational control), super admin (full access).
future security enhancements list potential additions such as approval workflows and escalation matrices.
success standards define when the security model is considered successful based on visibility control, authority management, protection of activities,
efficiency of operations,
audit trail completeness,
and accurate reflection of business rules in Supabase RLS.
supporting governance without unnecessary friction is emphasized.