# STEP 3: Venue Bulk Onboarding - Quick Reference

## 🚀 Quick Start

### Access the Bulk Upload Center
1. Go to **Administration → Venues**
2. Click **"⬆ Bulk Upload"** button (green, top right)
3. You'll see a 4-step workflow

### Step-by-Step Workflow

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Get Started  │  STEP 2: Upload  │  STEP 3: History  │  STEP 4: Quality
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Step 1: Download Template

**What**: Get Excel file with all 5 sheets

**Sheets Included**:
1. **Hotel Master** - Hotel info
2. **Hall Master** - Meeting spaces  
3. **Accommodation** - Room inventory
4. **Occupancy Rules** - Booking rules
5. **Photos** - Photo links (optional)

**Action**: Click **"Download Master Workbook"** button

---

## 📤 Step 2: Upload & Import

### Phase A: Prepare Data
1. Open downloaded Excel file
2. Fill Sheet 1 (Hotel Master) with hotel details
3. Fill Sheet 2 (Hall Master) with hall information
4. Fill Sheet 3 (Accommodation) with room data
5. Fill Sheet 4 (Occupancy Rules) with booking rules
6. (Optional) Fill Sheet 5 (Photos) with photo links

### Phase B: Upload File
1. Go back to Upload Center → Step 2
2. Drag & drop your completed workbook OR click to select
3. System automatically parses all sheets

### Phase C: Review Validation
- See validation results in preview screen
- Shows: ✓ Valid rows, ✗ Invalid rows
- Each sheet has separate validation results
- Fix any errors and re-upload if needed

### Phase D: Confirm Import
- Click **"Confirm Import"** button
- System processes all valid records
- Import executes automatically

### Phase E: View Results
Shows summary:
- Hotels Created: N
- Hotels Updated: N
- Halls Created: N
- Halls Updated: N
- Failed Records: N (if any)

---

## 📊 Step 3: Import History

**View**: All past import operations

**Columns**:
- File name
- Import status (✓ Success / ✗ Failed)
- Date & time
- Records processed
- Records failed
- Hotels/Halls created/updated

**Actions**:
- Click refresh to reload
- Download error reports if failed

---

## 📈 Step 4: Data Quality Dashboard

**View**: Venue readiness metrics

**Shows**:
- Venue Ready: X hotels (%)
- Partially Ready: X hotels (%)
- Not Ready: X hotels (%)

**Missing Components**:
- Hotels Missing Halls
- Hotels Missing Accommodation
- Hotels Missing Occupancy Rules
- Hotels Missing Photos
- Hotels Not Venue Ready

**Insights**: Automatic recommendations for improvement

---

## 📝 Excel Template Guide

### Hotel Master Sheet

**Required Columns**:
- Hotel Name ⭐
- City ⭐
- Contact Phone ⭐ (10 digits)
- Email ⭐ (valid email format)

**Optional Columns**:
- Address
- Contact Person
- Total Rooms
- Check-in Time (14:00 format)
- Check-out Time (11:00 format)
- Status (ACTIVE, INACTIVE, PENDING_APPROVAL)

**Example**:
```
Hotel Name    | City     | Contact Phone | Email            | Status
Taj Hotel     | Mumbai   | 9876543210   | sales@taj.com   | ACTIVE
ITC Grand     | Delhi    | 8765432109   | ops@itc.com     | ACTIVE
```

### Hall Master Sheet

**Required Columns**:
- Hotel Name ⭐ (must match Hotel Master)
- City ⭐ (must match Hotel Master)
- Hall Name ⭐
- Hall Type ⭐ (BALLROOM, CONFERENCE, BANQUET, BOARDROOM, THEATRE, OTHER)
- Theatre Capacity ⭐ (number)

**Optional Columns**:
- Classroom Capacity
- U Shape Capacity
- Cluster Capacity
- Boardroom Capacity
- Reception Capacity

**Example**:
```
Hotel Name | City   | Hall Name         | Hall Type | Theatre Capacity
Taj Hotel  | Mumbai | Grand Ballroom    | BALLROOM  | 500
Taj Hotel  | Mumbai | Executive Suite   | CONF      | 100
```

### Accommodation Sheet

**Required Columns**:
- Hotel Name ⭐ (must match Hotel Master)
- City ⭐
- Total Rooms ⭐ (number)

**Optional Columns**:
- Single Rooms
- Double Rooms
- Triple Rooms
- Quad Rooms
- Suite Rooms
- Occupancy Rate (0-100 %)
- Rate per Night

### Occupancy Rules Sheet

**Required Columns**:
- Hotel Name ⭐
- City ⭐
- Designation ⭐ (SO, DM, RSM, CH, IBH)
- Occupancy Type ⭐ (SINGLE, DOUBLE, TRIPLE, QUAD)

**Optional Columns**:
- Min Occupancy
- Max Occupancy

### Photos Sheet

**Required Columns**:
- Hotel Name ⭐
- City ⭐
- Photo URL ⭐ (valid HTTPS URL)

**Optional Columns**:
- Photo Type (EXTERIOR, LOBBY, HALL, ROOM, DINING, OTHER)
- Display Order

---

## ✅ Validation Rules

### What Gets Validated?

**Automatic Checks**:
- ✓ Required fields are filled
- ✓ Hotel names are unique (per city)
- ✓ Hall names are unique (per hotel)
- ✓ Cities exist in system
- ✓ Hotels exist (for halls/accommodation)
- ✓ Email format is valid
- ✓ Phone is exactly 10 digits
- ✓ Numbers are positive integers
- ✓ Time format is HH:MM
- ✓ URLs are valid HTTPS

### Error vs Warning

**Errors** ❌: Block import
- Missing required fields
- Invalid formats
- City/Hotel not found
- Duplicate entries

**Warnings** ⚠️: Don't block import
- Missing optional fields
- Invalid optional values
- Incomplete configurations

---

## 🔍 Common Issues & Solutions

### "City not found"
**Problem**: City name doesn't exist in system  
**Solution**: Use correct city name from master list

### "Hotel not found for halls"
**Problem**: Hall sheet references non-existent hotel  
**Solution**: Add hotel to Hotel Master first, then add halls

### "Duplicate hotel detected"
**Problem**: Same hotel + city combination already exists  
**Solution**: Either delete old entry or let import update it

### "Invalid email format"
**Problem**: Email doesn't match pattern  
**Solution**: Use format: user@domain.com

### "Mobile must be 10 digits"
**Problem**: Phone number has non-digits or wrong length  
**Solution**: Enter exactly 10 digits, no spaces/dashes

### "Theatre capacity must be a number"
**Problem**: Non-numeric value in capacity field  
**Solution**: Enter only numbers (e.g., 500 not "500 seats")

---

## 📊 Import History Details

### Understanding Status

**SUCCESS** ✅: All records imported without errors

**FAILED** ❌: Import could not complete
- Usually due to validation errors
- Check error report for details

**PARTIAL** ⚠️: Some records imported, some failed
- Valid records created/updated
- Failed records listed in report

---

## 🎯 Best Practices

### Do's ✅
- Download fresh template each time
- Fill all required fields (marked with ⭐)
- Use consistent naming (don't change between sheets)
- Test with small dataset first
- Review preview before confirming
- Check history after import
- Monitor quality dashboard

### Don'ts ❌
- Don't manually edit sheet names
- Don't add extra columns
- Don't use formulas in data cells
- Don't include special characters in hotel/hall names
- Don't skip required fields
- Don't upload if preview shows errors

---

## 🔢 Examples

### Successful Import Scenario

```
Upload: Complete workbook with:
├── 10 hotels
├── 25 halls
├── 10 accommodation entries
├── 30 occupancy rules
└── 0 errors

Preview shows: ✓ Valid
Import executed: 10 hotels created, 25 halls created
History shows: SUCCESS
```

### Partial Success Scenario

```
Upload: Workbook with:
├── 10 hotels (2 with invalid emails)
├── 25 halls (1 missing hotel reference)
└── Errors detected

Preview shows: 8 valid hotels, 24 valid halls, 3 errors
Fix errors: Correct email and hall reference
Re-upload: Clean import

Result: SUCCESS - All records imported
```

---

## 🚀 Performance Tips

**For Large Imports**:
- Max file size: 25 MB
- Recommended max rows: 5,000
- Break into multiple imports if needed
- Import during off-peak hours

**File Size Reference**:
- 100 hotels: ~50 KB
- 500 hotels: ~250 KB
- 1000 hotels: ~500 KB

---

## ❓ FAQ

**Q: Can I import just one sheet?**  
A: Yes, leave other sheets empty or with just headers

**Q: What if I make a mistake?**  
A: Fix and re-import. System detects duplicates and updates

**Q: How long does import take?**  
A: Usually 1-5 seconds depending on record count

**Q: Can I download previously imported data?**  
A: No, but you can export from Venue Repository page

**Q: What happens if import fails?**  
A: Check error report, fix issues, and re-import

**Q: Do I need to restart anything?**  
A: No, changes are live immediately

---

## 📞 Support

**Issues?**
1. Check error message in preview
2. Review FAQ above
3. Check data quality dashboard for missing components
4. Contact admin for system issues

**Questions about specific rules?**
- See "Validation Rules" section above
- Check instructions in downloaded template
- Review examples in "Examples" section

---

## 🎓 Key Takeaways

1. **Download** → **Fill** → **Upload** → **Validate** → **Import**
2. Required fields must be filled (marked with ⭐)
3. Hotel name + City must be unique
4. All referenced entities must exist
5. Format validation is strict
6. Preview before import
7. Monitor history and quality

---

**Last Updated**: June 13, 2026  
**Version**: 1.0  
**Status**: READY FOR PRODUCTION

