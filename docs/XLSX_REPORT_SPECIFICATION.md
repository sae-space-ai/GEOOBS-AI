# XLSX Report Specification — GEOOBS-AI

## Workbook Structure

The XLSX report contains 24 structured sheets designed for data analysis and post-processing.

### Sheet 01: RESUMEN_EJECUTIVO (Executive Summary)
- Report metadata (ID, date, version)
- Data source classification
- Key statistics summary
- Validation status
- Data classification warning

### Sheet 02: INSTRUMENTOS (Instruments)
- Instrument name
- Platform
- Processing level
- Status (loaded/synthetic)
- Acquisition time

### Sheet 03: DATASETS (Datasets)
- Dataset ID
- Type (synthetic/real)
- Dimensions
- Status
- Generation parameters

### Sheet 04: PROCESAMIENTO (Processing)
- Processing parameters
- Detection method
- Matching algorithm
- RANSAC configuration
- Software version

### Sheet 05: OBSERVABLES (Observables)
- Observable ID
- Instrument, platform, level
- Pixel position (row, col)
- Displacement (dx, dy, magnitude, direction)
- Quality metric
- Detection method
- Status (accepted/rejected)
- **Partitioned if >10,000 rows**

### Sheet 06: GQA_ABSOLUTE (Absolute Navigation GQA)
- GQA assessment ID
- Observable count
- Valid ratio
- Bias (X, Y)
- RMSE (X, Y, total)
- Percentiles (P50, P95)
- Spatial coverage

### Sheet 07: GQA_INTERCHANNEL (Interchannel Registration)
- Channel pair
- Inlier count
- RMSE
- Status
- Channel-specific statistics

### Sheet 08: GQA_TEMPORAL (Temporal Registration)
- Pair index
- Time reference
- Time target
- Inlier count
- RMSE
- Error vs known (if available)

### Sheet 09: ESTADISTICAS (Statistics)
- Metric name
- Value
- Unit
- All GQA statistics in tabular format

### Sheet 10: SERIES_TEMPORALES (Time Series)
- Timestamp
- Metric name
- Value
- For trend analysis

### Sheet 11: TENDENCIAS (Trends)
- Trend identifier
- Direction
- Magnitude
- Statistical significance

### Sheet 12: ANOMALIAS (Anomalies)
- Anomaly ID
- Timestamp
- Severity
- Description
- Affected metrics

### Sheet 13: MODELOS_IA (AI Models)
- Model ID
- Name
- Version
- Method
- License
- Status (validated/experimental)
- Metrics

### Sheet 14: ENTRENAMIENTOS (Training)
- Experiment name
- Detection method
- RMSE
- Precision
- Feature count
- Match count
- Inlier ratio
- CPU time

### Sheet 15: VALIDACION (Validation)
- Test suite name
- Total tests
- Passed
- Failed
- Status (PASS/FAIL)

### Sheet 16: RENDIMIENTO (Performance)
- Operation name
- Execution time (ms)
- Memory usage (MB)
- Status

### Sheet 17: REQUISITOS_R1_R49 (Requirements R1-R49)
- Requirement ID
- Status
- Responsible module
- Evidence file
- Dependencies
- Risk level

### Sheet 18: EVIDENCIAS (Evidence)
- Requirement ID
- Test description
- Result (PASS/FAIL)
- Evidence file
- Validation class

### Sheet 19: RIESGOS (Risks)
- Risk identifier
- Description
- Severity (High/Medium/Low)
- Status (Open/Mitigated/Closed)
- Mitigation strategy

### Sheet 20: LIMITACIONES (Limitations)
- Limitation description
- Impact
- Category (data/algorithm/validation)
- Mitigation status

### Sheet 21: TRAZABILIDAD (Traceability)
- Component
- Chain ID
- Input
- Output
- Status
- Timestamp

### Sheet 22: AUDITORIA (Audit)
- Timestamp
- Action
- Actor
- Resource ID
- Details
- Severity

### Sheet 23: METADATOS (Metadata)
- Field name
- Value
- All report metadata in key-value format

### Sheet 24: CONCLUSIONES (Conclusions)
- Conclusion statement
- Supporting evidence
- Confidence level
- Validation status

## Technical Specifications

### File Format
- **Format**: XLSX (Office Open XML)
- **Library**: SheetJS (xlsx)
- **Compatibility**: Excel 2007+, LibreOffice, Google Sheets

### Cell Formatting
- Headers: Bold, light gray background
- Numbers: Right-aligned, appropriate decimal places
- Text: Left-aligned
- Dates: ISO 8601 format
- Percentages: Formatted as percentages

### Data Types
- Strings: Text values
- Numbers: Numeric values with appropriate precision
- Dates: ISO 8601 strings
- Booleans: TRUE/FALSE

### Row Limits
- Maximum rows per sheet: 1,048,576 (Excel limit)
- Observables partitioned if >10,000 rows
- Additional sheets created for overflow

### Column Widths
- Auto-sized based on content
- Minimum width: 10 characters
- Maximum width: 50 characters

## File Naming Convention

```
GEOOBS-AI_{category}_{reportId}.xlsx
```

Example: `GEOOBS-AI_gqa_quality_RPT-A1B2C3D4.xlsx`

## Integrity Verification

- Hash computed from XLSX content
- Stored in report metadata
- Included in manifest for package exports

## Data Sanitization

- No formula injection from external inputs
- Cell values prefixed with apostrophe if starting with =, +, -, @
- No macro execution
- No external links

## Limitations

- No password protection in browser environment
- No complex formulas (only static values)
- No embedded charts (data-only for post-processing)
- No conditional formatting
- No data validation rules
