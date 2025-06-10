# Retroactive Analysis System

This system provides comprehensive performance analysis for savings goals by comparing theoretical vs actual contributions over time, with enhanced features for data export, mobile responsiveness, and error handling.

## Features

- **Real-time Performance Analysis**: Compare actual vs theoretical contributions
- **Visual Timeline**: Month-by-month performance indicators with color coding
- **CSV Data Export**: Export detailed analysis and summary reports
- **Mobile Responsive**: Optimized for all screen sizes and touch devices
- **Error Handling**: Graceful error states with retry functionality
- **Loading States**: Smooth loading experiences during calculations

## Components

### 1. RetroactiveAnalysisDisplay

Main component that orchestrates the entire analysis display with enhanced features.

```tsx
<RetroactiveAnalysisDisplay
  goal={goal}
  showDetailedMetrics={true}    // Shows full metrics cards
  showTimeline={true}           // Shows monthly timeline
  showTimelineStats={true}      // Shows timeline statistics
  showExportButton={true}       // Shows CSV export functionality
/>

// Compact mode for cards
<RetroactiveAnalysisDisplay
  goal={goal}
  showDetailedMetrics={false}
  showTimeline={false}
  showExportButton={false}
/>
```

**New Features:**

- CSV export functionality
- Error states with retry options
- Loading state handling
- Mobile-responsive header layout

### 2. RetroactiveMetrics

Displays key performance metrics in card format.

```tsx
<RetroactiveMetrics goal={goal} />
```

Shows:

- Should Have Saved (theoretical total)
- Actually Saved (real total)
- Performance percentage
- Additional stats (months tracked, consistency, etc.)

### 3. TimelineStats

Summary statistics showing performance breakdown.

```tsx
<TimelineStats goal={goal} />
```

Features:

- Success rate calculation
- Monthly performance counts (ahead, on-track, behind, no contribution)
- Clean metric layout

### 4. PerformanceIndicators

Reusable visual indicators for performance status.

```tsx
<PerformanceIndicator
  status="on-track"
  percentage={85}
  showTooltip={true}
  tooltip="85% of target achieved"
/>

<PerformanceBar
  percentage={85}
  status="on-track"
/>
```

## Analysis Engine

### RetroactiveCalculator

Core calculation utilities:

- `calculateTheoreticalBalance()` - Total expected savings
- `generateTheoreticalContributions()` - Month-by-month breakdown
- `validateDateRange()` - Date validation
- `getPeriodDescription()` - Human-readable period text

### RetroactiveAnalyzer

Analysis and comparison logic:

- `analyzeGoalPerformance()` - Complete analysis
- `compareMonthlyPerformance()` - Month-by-month comparison
- `calculatePerformanceMetrics()` - Overall metrics
- `generatePerformanceIndicators()` - Timeline data

## Integration

### Goal Detail Page

Full analysis is shown on `/goals/:id` with all components enabled:

- Detailed metrics
- Full timeline
- Timeline statistics

### Dashboard Cards

Compact preview is shown on dashboard cards with:

- Performance indicator
- Quick summary
- Progress bar

## New Components

### 5. AnalysisExportButton

CSV export functionality for analysis data.

```tsx
// Full export dropdown with both options
<AnalysisExportButton goal={goal} variant="both" />

// Single export types
<AnalysisExportButton goal={goal} variant="detailed" />
<AnalysisExportButton goal={goal} variant="summary" />
```

**Export Options:**

- **Detailed Analysis**: Month-by-month breakdown with all metrics
- **Performance Summary**: Key metrics overview and status breakdown
- **Both**: Downloads both files with single click

### 6. AnalysisLoadingState & AnalysisErrorState

Enhanced user experience components.

```tsx
// Loading state
<AnalysisLoadingState
  showTimeline={true}
  showMetrics={true}
/>

// Error state with retry
<AnalysisErrorState
  error="Failed to analyze data"
  onRetry={() => retryAnalysis()}
/>
```

## Enhanced Mobile Support

### Responsive Features

- **Touch-friendly buttons**: Minimum 44px touch targets
- **Flexible layouts**: Grid columns adjust to screen size
- **Mobile export menu**: Fixed positioning for better usability
- **Optimized card sizes**: Better spacing on mobile devices

### CSS Classes

```css
/* Mobile-specific improvements */
@media (max-width: 640px) {
  .retroactive-analysis-display__header {
    flex-direction: column;
  }
  .retroactive-metrics__cards {
    grid-template-columns: 1fr;
  }
}
```

## Performance Status Types

- `ahead` - Exceeded monthly target (green ↗)
- `on-track` - Met monthly target (blue →)
- `behind` - Below target but contributed (yellow ↘)
- `no-contribution` - No contribution made (red ✕)

## Data Requirements

Goals must have:

- `startDate` - When goal tracking began
- `expectedMonthlyAmount` - Target monthly contribution
- `contributions[]` - Array of actual monthly contributions

## Automatic Detection

The system automatically:

- Detects if goal has retroactive data (startDate < now)
- Only shows analysis for eligible goals
- Handles errors gracefully
- Optimizes performance with memoization

## Export Features

### CSV Export Options

1. **Detailed Analysis Export**:

   - Month-by-month performance breakdown
   - Theoretical vs actual amounts
   - Variance calculations
   - Performance percentages
   - Cumulative totals

2. **Performance Summary Export**:
   - Goal overview information
   - Key performance metrics
   - Status breakdown by month count
   - Consistency scores

### Export Usage

```tsx
// In components
import { CSVExporter } from "../lib/csvExporter";

// Generate and download analysis data
const analysis = RetroactiveAnalyzer.analyzeGoalPerformance(goal);
const csvData = CSVExporter.exportRetroactiveAnalysis(goal, analysis);
const filename = CSVExporter.generateFilename(goal.name, "analysis");
CSVExporter.downloadCSV(csvData, filename);
```

## Error Handling

The system includes comprehensive error handling:

- **Validation errors**: Invalid date ranges, missing data
- **Calculation errors**: Mathematical operation failures
- **Display errors**: Component rendering issues
- **Export errors**: File generation/download failures

Each error includes user-friendly messages and retry options where applicable.
