// Template Service
// Generates downloadable Excel templates for venue bulk import

import * as XLSX from 'xlsx';

// ============================================================================
// TEMPLATE DATA
// ============================================================================

const HOTEL_MASTER_HEADERS = [
  'Zone',
  'City',
  'Hotel Name',
  'Address',
  'GST Number',
  'Website',
  'Sales Contact Name',
  'Sales Contact Mobile',
  'Sales Contact Email',
  'Preferred Vendor',
  'Blacklisted',
  'Status'
];

const HOTEL_MASTER_EXAMPLE = [
  ['West', 'Mumbai', 'Taj Hotel', '123 Business Park, BKC', '27AAACT1234A1Z5', 'https://tajhotels.com', 'Rajesh Sharma', '9876543210', 'sales@taj.com', 'YES', 'NO', 'ACTIVE'],
  ['North', 'Delhi', 'ITC Grand', '456 Central Avenue', '07AAACT5678B1Z3', 'https://itchotels.com', 'Priya Singh', '8765432109', 'operations@itc.com', 'NO', 'NO', 'ACTIVE'],
];

const HALL_MASTER_HEADERS = [
  'Hotel Name',
  'Floor',
  'Indoor/Outdoor',
  'Hall Name',
  'Classroom Capacity',
  'U Shape Capacity',
  'Cluster Capacity',
  'Status'
];

const HALL_MASTER_EXAMPLE = [
  ['Taj Hotel', 'Ground', 'INDOOR', 'Grand Ballroom', '250', '80', '200', 'ACTIVE'],
  ['Taj Hotel', 'Third Floor', 'INDOOR', 'Executive Suite', '80', '30', '50', 'ACTIVE'],
  ['ITC Grand', 'Lobby', 'INDOOR', 'Crystal Hall', '180', '60', '150', 'ACTIVE'],
];

const ACCOMMODATION_HEADERS = [
  'Hotel Name',
  'Total Rooms',
  'Single Rooms',
  'Double Rooms',
  'Triple Rooms',
  'Quad Rooms'
];

const ACCOMMODATION_EXAMPLE = [
  ['Taj Hotel', '250', '50', '150', '30', '20'],
  ['ITC Grand', '180', '40', '120', '15', '5'],
];

const OCCUPANCY_HEADERS = [
  'Hotel Name',
  'SO',
  'DM',
  'RSM',
  'OTHERS'
];

const OCCUPANCY_EXAMPLE = [
  ['Taj Hotel', '120', '80', '160', '90'],
  ['ITC Grand', '90', '60', '130', '70'],
];

const PHOTOS_HEADERS = [
  'Hotel Name',
  'Photo File Name',
  'Caption'
];

const PHOTOS_EXAMPLE = [
  ['Taj Hotel', 'taj_ballroom_01.jpg', 'Grand Ballroom front view'],
  ['ITC Grand', 'itc_exterior_01.jpg', 'Hotel exterior panorama'],
];

// ============================================================================
// SHEET CREATORS
// ============================================================================

function createHotelMasterSheet(): XLSX.WorkSheet {
  const data = [HOTEL_MASTER_HEADERS, ...HOTEL_MASTER_EXAMPLE];
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [20, 15, 30, 20, 15, 25, 12, 15, 15, 12];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  
  // Style header row
  const headerStyle = {
    fill: { fgColor: { rgb: '4F46E5' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };
  
  for (let i = 0; i < HOTEL_MASTER_HEADERS.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    ws[cellRef].s = headerStyle;
  }
  
  return ws;
}

function createHallMasterSheet(): XLSX.WorkSheet {
  const data = [HALL_MASTER_HEADERS, ...HALL_MASTER_EXAMPLE];
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const colWidths = [20, 15, 20, 15, 18, 18, 15, 15, 18, 18];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  
  const headerStyle = {
    fill: { fgColor: { rgb: '4F46E5' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };
  
  for (let i = 0; i < HALL_MASTER_HEADERS.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    ws[cellRef].s = headerStyle;
  }
  
  return ws;
}

function createAccommodationSheet(): XLSX.WorkSheet {
  const data = [ACCOMMODATION_HEADERS, ...ACCOMMODATION_EXAMPLE];
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const colWidths = [20, 15, 12, 15, 15, 15, 12, 12, 18, 18];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  
  const headerStyle = {
    fill: { fgColor: { rgb: '4F46E5' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };
  
  for (let i = 0; i < ACCOMMODATION_HEADERS.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    ws[cellRef].s = headerStyle;
  }
  
  return ws;
}

function createOccupancySheet(): XLSX.WorkSheet {
  const data = [OCCUPANCY_HEADERS, ...OCCUPANCY_EXAMPLE];
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const colWidths = [20, 15, 18, 18, 15, 15];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  
  const headerStyle = {
    fill: { fgColor: { rgb: '4F46E5' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };
  
  for (let i = 0; i < OCCUPANCY_HEADERS.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    ws[cellRef].s = headerStyle;
  }
  
  return ws;
}

function createPhotosSheet(): XLSX.WorkSheet {
  const data = [PHOTOS_HEADERS, ...PHOTOS_EXAMPLE];
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  const colWidths = [20, 15, 15, 40, 15];
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  
  const headerStyle = {
    fill: { fgColor: { rgb: '4F46E5' } },
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };
  
  for (let i = 0; i < PHOTOS_HEADERS.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + '1';
    ws[cellRef].s = headerStyle;
  }
  
  return ws;
}

function createInstructionsSheet(): XLSX.WorkSheet {
  const instructions = [
    ['VENUE BULK IMPORT - INSTRUCTIONS'],
    [],
    ['Column Name', 'Type', 'Required', 'Description', 'Example'],
    [],
    ['Hotel Master'],
    ['Hotel Name', 'Text', 'YES', 'Name of the hotel', 'Taj Hotel'],
    ['City', 'Text', 'YES', 'City name (must exist in system)', 'Mumbai'],
    ['Address', 'Text', 'NO', 'Full address', '123 Business Park'],
    ['Contact Person', 'Text', 'NO', 'Primary contact name', 'Rajesh Sharma'],
    ['Mobile', 'Number', 'YES', '10 digit mobile number', '9876543210'],
    ['Email', 'Text', 'YES', 'Valid email address', 'sales@taj.com'],
    ['Total Rooms', 'Number', 'YES', 'Total room count', '250'],
    ['Check-in Time', 'Time', 'NO', 'Check-in time (HH:MM)', '14:00'],
    ['Check-out Time', 'Time', 'NO', 'Check-out time (HH:MM)', '11:00'],
    ['Status', 'Text', 'NO', 'ACTIVE, INACTIVE, or PENDING_APPROVAL', 'ACTIVE'],
    [],
    ['Hall Master'],
    ['Hall Name', 'Text', 'YES', 'Name of the hall', 'Grand Ballroom'],
    ['Hall Type', 'Text', 'YES', 'BALLROOM, CONFERENCE, BANQUET, BOARDROOM, THEATRE, or OTHER', 'BALLROOM'],
    ['Theatre Capacity', 'Number', 'YES', 'Capacity in theatre setup', '500'],
    ['Classroom Capacity', 'Number', 'NO', 'Capacity in classroom setup', '250'],
    [],
    ['Important Notes:'],
    ['1. Each hotel entry in halls, accommodation, and occupancy must reference existing hotel in Hotel Master sheet'],
    ['2. City names must match exactly with the Master Cities list'],
    ['3. Hotel name + City combination must be unique'],
    ['4. All numeric fields should contain numbers only, no special characters'],
    ['5. Email addresses must be in valid format (user@domain.com)'],
    ['6. Mobile numbers must be exactly 10 digits'],
    ['7. Duplicate entries will be updated, not created (if same hotel name + city)'],
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(instructions);
  ws['!cols'] = [25, 12, 12, 40, 20].map(w => ({ wch: w }));
  
  const titleStyle = {
    font: { bold: true, size: 14, color: { rgb: '1F2937' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  };
  
  ws['A1'].s = titleStyle;
  
  return ws;
}

// ============================================================================
// MASTER TEMPLATE GENERATION
// ============================================================================

export function generateMasterTemplate(): Blob {
  const wb = XLSX.utils.book_new();
  
  // Add sheets
  XLSX.utils.book_append_sheet(wb, createHotelMasterSheet(), 'Hotel Master');
  XLSX.utils.book_append_sheet(wb, createAccommodationSheet(), 'Accommodation Inventory');
  XLSX.utils.book_append_sheet(wb, createOccupancySheet(), 'Occupancy Matrix');
  XLSX.utils.book_append_sheet(wb, createHallMasterSheet(), 'Hall Master');
  XLSX.utils.book_append_sheet(wb, createPhotosSheet(), 'Hotel Photos');
  XLSX.utils.book_append_sheet(wb, createInstructionsSheet(), 'Instructions');
  
  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadTemplate(templateName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${templateName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// TEMPLATE INFO
// ============================================================================

export const TEMPLATE_INFO = {
  master: {
    name: 'Venue Master Workbook',
    description: 'Complete workbook with all venue data sheets',
    sheets: [
      {
        name: 'Hotel Master',
        description: 'Basic hotel information',
        rows: 'One per hotel'
      },
      {
        name: 'Hall Master',
        description: 'Meeting hall configurations',
        rows: 'One per hall'
      },
      {
        name: 'Accommodation Inventory',
        description: 'Room inventory summary for each hotel',
        rows: 'One per hotel'
      },
      {
        name: 'Occupancy Matrix',
        description: 'Designation occupancy limits for each hotel',
        rows: 'One per hotel'
      },
      {
        name: 'Hotel Photos',
        description: 'Photo metadata for hotel images',
        rows: 'One per photo'
      }
    ]
  }
};
