const fs = require('fs');
const path = require('path');

const files = [
  'src/features/workspace/tabs/AccommodationTab.tsx',
  'src/features/workspace/tabs/AuditTab.tsx',
  'src/features/workspace/tabs/InvoicesTab.tsx',
  'src/features/workspace/tabs/RoomingTab.tsx',
  'src/features/workspace/tabs/SAPClosureTab.tsx'
];

for (const f of files) {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    // Replace redundant checks like `user?.role === 'ADMIN' || user?.role === 'ADMIN'`
    content = content.replace(/user\?\.role === 'ADMIN' \|\| user\?\.role === 'ADMIN' \|\| user\?\.role === 'SUPER_ADMIN'/g, "user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'");
    content = content.replace(/user\?\.role === 'ADMIN' \|\| user\?\.role === 'ADMIN'/g, "user?.role === 'ADMIN'");
    content = content.replace(/user\?\.role === 'SUPER_ADMIN' \|\| user\?\.role === 'ADMIN' \|\| user\?\.role === 'ADMIN'/g, "user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'");
    fs.writeFileSync(fp, content);
    console.log(`Fixed redundant checks in ${f}`);
  }
}
