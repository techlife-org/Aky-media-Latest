# 📊 Export Feature Guide - Achievements Dashboard

## Overview

The Export Report feature in the Achievements Dashboard allows administrators to export achievement data in multiple formats for reporting, analysis, and record-keeping purposes.

## 🚀 How to Use

### 1. Access the Export Feature
- Navigate to `/dashboard/achievements`
- Look for the **"Export Report"** button in the top-right section of the page
- Click the dropdown arrow to see export options

### 2. Export Options
- **Export as CSV**: Generates a comma-separated values file suitable for Excel, Google Sheets, and data analysis tools
- **Export as JSON**: Generates a structured JSON file for developers and advanced data processing

### 3. Filtering Before Export
The export respects your current filter settings:
- **Status Filter**: Export only completed, ongoing, or determined achievements
- **Category Filter**: Export achievements from specific categories (infrastructure, education, healthcare, etc.)
- **Search Filter**: Export achievements matching your search terms

## 📋 Export Data Fields

The exported file includes the following information for each achievement:

| Field | Description |
|-------|-------------|
| ID | Unique achievement identifier |
| Title | Achievement title |
| Description | Detailed description |
| Category | Achievement category (infrastructure, education, etc.) |
| Status | Current status (completed, ongoing, determined) |
| Progress (%) | Completion percentage |
| Date | Achievement date |
| Location | Geographic location |
| Impact | Expected or achieved impact |
| Details | Additional details and notes |
| Created At | Record creation timestamp |
| Updated At | Last modification timestamp |

## 🔧 Technical Details

### API Endpoint
```
GET /api/achievements/export
```

### Query Parameters
- `format`: Export format (`csv` or `json`)
- `status`: Filter by status (`completed`, `ongoing`, `determined`, or `all`)
- `category`: Filter by category (`infrastructure`, `education`, etc., or `all`)
- `startDate`: Filter achievements created after this date (ISO format)
- `endDate`: Filter achievements created before this date (ISO format)

### Example API Calls
```bash
# Export all achievements as CSV
curl "http://localhost:3000/api/achievements/export?format=csv"

# Export only completed achievements as JSON
curl "http://localhost:3000/api/achievements/export?format=json&status=completed"

# Export infrastructure achievements as CSV
curl "http://localhost:3000/api/achievements/export?format=csv&category=infrastructure"
```

## 📁 File Naming Convention

Exported files are automatically named with the following pattern:
- **CSV**: `achievements_export_YYYYMMDD.csv`
- **JSON**: `achievements_export_YYYYMMDD.json`

Example: `achievements_export_20250131.csv`

## 💡 Use Cases

### 1. **Monthly Reports**
- Filter by date range and export for monthly achievement reports
- Use CSV format for easy integration with reporting tools

### 2. **Category Analysis**
- Export specific categories (e.g., infrastructure) for sector-specific analysis
- Compare progress across different categories

### 3. **Status Tracking**
- Export completed achievements for success stories
- Export ongoing achievements for progress monitoring

### 4. **Data Backup**
- Regular JSON exports for data backup and archival
- Maintain historical records of achievement data

### 5. **External Reporting**
- CSV exports for integration with external reporting systems
- Share achievement data with stakeholders and partners

## 🔒 Security & Permissions

- Export functionality requires admin authentication
- All exports respect the same access controls as the dashboard
- Export activity is logged for audit purposes

## 🐛 Troubleshooting

### Common Issues

**Export button not working:**
- Ensure you have admin permissions
- Check your internet connection
- Try refreshing the page

**Empty export file:**
- Check if your filters are too restrictive
- Verify there are achievements matching your criteria
- Try exporting without filters first

**Download not starting:**
- Check browser popup blockers
- Ensure JavaScript is enabled
- Try a different browser

### Error Messages

- **"Failed to export achievements"**: Server error, try again later
- **"No achievements found"**: Your filters returned no results
- **"Unsupported format"**: Use only 'csv' or 'json' formats

## 📞 Support

If you encounter issues with the export feature:
1. Check this guide for common solutions
2. Verify your admin permissions
3. Contact the technical team with specific error messages

---

**Last Updated**: January 31, 2025
**Feature Version**: 1.0.0