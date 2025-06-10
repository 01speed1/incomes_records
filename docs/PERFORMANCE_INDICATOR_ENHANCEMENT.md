# Performance Indicator Enhancement

## Overview

Enhanced the `PerformanceIndicator` component to optionally display the expected monthly amount alongside the performance status in goal cards.

## Changes Made

### 1. Enhanced PerformanceIndicator Component

**File:** `app/components/PerformanceIndicators.tsx`

- Added new props:

  - `expectedMonthlyAmount?: Decimal` - The expected monthly contribution amount
  - `showExpectedAmount?: boolean` - Flag to show/hide the expected amount

- Added conditional rendering to display expected amount when `showExpectedAmount` is true
- Maintains backward compatibility with existing usage

### 2. Updated RetroactiveAnalysisDisplay

**File:** `app/components/RetroactiveAnalysisDisplay.tsx`

- Modified the preview mode to pass `expectedMonthlyAmount` and `showExpectedAmount={true}` to `PerformanceIndicator`
- Adjusted layout for better visual presentation of the enhanced indicator
- Improved spacing and alignment for the new information

### 3. Simplified GoalCard Footer

**File:** `app/components/GoalCard.tsx`

- Removed the duplicate "Monthly Goal" section from the footer since this information is now prominently displayed in the performance indicator
- Streamlined the footer to only show the target date when available

## Visual Changes

### Before

- Performance indicator showed only status icon and percentage
- Monthly goal amount was shown separately in the card footer
- Information was scattered across the card

### After

- Performance indicator now shows status icon + expected monthly amount in a compact format
- Expected amount is displayed as "Expected $X.X/mo" next to the performance icon
- More prominent and contextual display of monthly expectations
- Cleaner card footer with less redundant information

## Usage Example

```tsx
<PerformanceIndicator
  status="on-track"
  percentage={85}
  expectedMonthlyAmount={new Decimal("500")}
  showExpectedAmount={true}
  showTooltip={true}
  tooltip="85% of target achieved over 6 months"
/>
```

This will render:

- Performance status icon (blue arrow for "on-track")
- "Expected" label with "$500/mo" below it
- Tooltip showing detailed performance information

## Benefits

1. **Better Information Hierarchy**: Expected monthly amount is now contextually placed with performance data
2. **Reduced Redundancy**: Eliminated duplicate monthly amount display
3. **Improved User Experience**: Users can quickly see both performance and expectations in one glance
4. **Backward Compatibility**: Existing components continue to work without modification
5. **Flexible Design**: The feature is opt-in via the `showExpectedAmount` prop

## Components Affected

- ✅ `PerformanceIndicator` - Enhanced with new props
- ✅ `RetroactiveAnalysisDisplay` - Updated to use enhanced indicator
- ✅ `GoalCard` - Simplified footer layout
- ✅ Build passes all TypeScript checks
- ✅ No breaking changes to existing functionality
