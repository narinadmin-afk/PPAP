# PPAP Project - Professional Automotive Forms

## Project Overview
This project provides professional PPAP (Production Part Approval Package) forms management for automotive manufacturing, based on the Excel template `PPAP_Forms_Suite_Automotive_Glass_Final.xlsx`.

## Structure
- `PPAP-forms-professional-layout.md` - Professional layout with all 7 PPAP forms consolidated
- `src/` - Source code for React components
- `data/` - Element table definitions and templates
- `server/` - API services and backend
- `public/` - Static assets

## PPAP Forms Included
1. **Company Info** (WW-PPAP-Company) - 16 company/product parameters
2. **PPAP Initiation Request** (WW-PPAP-101) - Initiation request form
3. **Process FMEA** (WW-PPAP-102) - 5 failure modes with RPN analysis
4. **Control Plan** (WW-PPAP-103) - 11 production operations
5. **Dimensional Test Results** (WW-PPAP-104) - 5 dimensional measurements
6. **Material Test Results** (WW-PPAP-105) - 4 material properties
7. **Perfor Test Results** (WW-PPAP-106) - Perforation tests

## Key Features
- Professionally reformatted tables consolidated from Excel source
- Duplicate headers eliminated, clean column structure
- No `[object Object]` placeholder artifacts
- Standardized column widths and types across all forms
- Integrated with React component library
- PDF export functionality
- Element table management for all 18 AIAG PPAP elements

## Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Data Source
Primary data from: `PPAP_Forms_Suite_Automotive_Glass_Final.xlsx`