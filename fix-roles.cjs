const fs = require('fs');
const path = require('path');

const filesToFix = [
  "src/features/dashboard/Dashboard.tsx",
  "src/features/planning/PlanningLayout.tsx",
  "src/features/masters/HotelsList.tsx",
  "src/features/workspace/tabs/AuditTab.tsx",
  "src/features/workspace/tabs/AccommodationTab.tsx",
  "src/features/masters/HotelCategoriesList.tsx",
  "src/features/masters/HallsList.tsx",
  "src/features/workspace/tabs/InvoicesTab.tsx",
  "src/features/masters/CitiesList.tsx",
  "src/features/workspace/tabs/RoomingTab.tsx",
  "src/features/workspace/tabs/SAPClosureTab.tsx",
  "src/features/workspace/tabs/VenueTab.tsx",
  "src/features/events/EventsList.tsx"
];

for (const file of filesToFix) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/user\?\.role\?\.role_name/g, 'user?.role');
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${file}`);
  }
}
