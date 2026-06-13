// Template Service
// Generates downloadable Excel templates for venue bulk import

import * as XLSX from 'xlsx';

// ============================================================================
// TEMPLATE DATA
// ============================================================================

const HOTEL_MASTER_HEADERS = [
  'Hotel Name',
  'City',
  'Address',
  'Contact Person',
  'Mobile',
  'Email',
  'Total Rooms',
  'Check-in Time',
  'Check-out Time',
  'Status'
];

const HOTEL_MASTER_EXAMPLE = [
  ['Taj Hotel', 'Mumbai', '123 Business Park, BKC', 'Rajesh Sharma', '9876543210', 'sales@taj.com', '250', '14:00', '11:00', 'ACTIVE'],
  ['ITC Grand', 'Delhi', '456 Central Avenue', 'Priya Singh', '8765432109', 'operations@itc.com', '180', '15:00', '12:00', 'ACTIVE'],
];

const HALL_MASTER_HEADERS = [
  'Hotel Name',
  'City',
  'Hall Name',
  'Hall Type',
  'Theatre Capacity',
  'Classroom Capacity',
  'U Shape Capacity',
  'Cluster Capacity',
  'Boardroom Capacity',
  'Reception Capacity'
];

const HALL_MASTER_EXAMPLE = [
  ['Taj Hotel', 'Mumbai', 'Grand Ballroom', 'BALLROOM', '500', '250', '80', '200', '40', '700'],
  ['Taj Hotel', 'Mumbai', 'Executive Suite', 'CONFERENCE', '100', '80', '30', '50', '20', '150'],
  ['ITC Grand', 'Delhi', 'Crystal Hall', 'BANQUET', '350', '180', '60', '150', '30', '500'],
];

const ACCOMMODATION_HEADERS = [
  'Hotel Name',
  'City',
  'Total Rooms',
  'Single Rooms',
  'Double Rooms',
  'Triple Rooms',
  'Quad Rooms',
  'Suite Rooms',
  'Occupancy Rate (%)',
  'Rate per Night (INR)'
];

const ACCOMMODATION_EXAMPLE = [
  ['Taj Hotel', 'Mumbai', '250', '50', '150', '30', '10', '10', '75', '5000'],
  ['ITC Grand', 'Delhi', '180', '40', '120', '15', '0', '5', '80', '4500'],
];

const OCCUPANCY_HEADERS = [
  'Hotel Name',
  'City',
  'Designation',
  'Occupancy Type',
  'Min Occupancy',
  'Max Occupancy'
];

const OCCUPANCY_EXAMPLE = [
  ['Taj Hotel', 'Mumbai', 'SO', 'DOUBLE', '10', '100'],
  ['Taj Hotel', 'Mumbai', 'DM', 'SINGLE', '5', '50'],
  ['Taj Hotel', 'Mumbai', 'RSM', 'DOUBLE', '15', '150'],
  ['ITC Grand', 'Delhi', 'SO', 'DOUBLE', '10', '80'],
];

const PHOTOS_HEADERS = [
  'Hotel Name',
  'City',
  'Photo Type',
  'Photo URL',
  'Display Order'
];

const PHOTOS_EXAMPLE = [
  ['Taj Hotel', 'Mumbai', 'EXTERIOR', 'https://example.com/taj-exterior.jpg', '1'],
  ['Taj Hotel', 'Mumbai', 'HALL', 'https://example.com/taj-ballroom.jpg', '2'],
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
  XLSX.utils.book_append_sheet(wb, createHallMasterSheet(), 'Hall Master');
  XLSX.utils.book_append_sheet(wb, createAccommodationSheet(), 'Accommodation');
  XLSX.utils.book_append_sheet(wb, createOccupancySheet(), 'Occupancy Rules');
  XLSX.utils.book_append_sheet(wb, createPhotosSheet(), 'Photos');
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
        name: 'Accommodation',
        description: 'Room inventory and occupancy',
        rows: 'One per hotel'
      },
      {
        name: 'Occupancy Rules',
        description: 'Designation-to-occupancy mappings',
        rows: 'One per rule'
      },
      {
        name: 'Photos',
        description: 'Photo references (optional)',
        rows: 'One per photo'
      }
    ]
  }
};
