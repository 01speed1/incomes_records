# Project Instructions - Income Management Application

## Project Purpose

This is an income management application designed to track and project savings goals through virtual savings accounts, comparing projected vs actual monthly contributions.

## Core Functionality

### 1. Virtual Savings Accounts (Savings Goals)

- Create savings goals that function as virtual savings accounts
- Each goal has a financial target, monthly contribution amount, and timeline
- Examples: "Dad's debt", "Apartment rent income", "Personal savings"
- Track accumulated balance for each goal over time

### 2. Monthly Contribution Tracking

- Register projected monthly contributions for each savings goal
- Record actual monthly savings amounts per goal
- Compare projected vs actual performance month by month
- Maintain running balance for each virtual account

### 3. Goal Projection & Visualization

- Calculate when each savings goal will reach its target amount
- Generate graphs showing projected vs actual progress
- Timeline-based projections for achieving financial targets
- Visual indicators for goals that are ahead/behind schedule

### 4. Financial Performance Analysis

- Track performance against projections per goal
- Identify trends in saving behavior
- Analyze variance between projected and actual contributions
- Provide insights on goal achievement feasibility

## Key Features Required

1. **Goal Management System**

   - Create/edit/delete savings goals
   - Set target amounts and timelines
   - Define expected monthly contributions
   - Categorize goals by type (debt, investment, personal savings)

2. **Monthly Recording Interface**

   - Register actual monthly contributions per goal
   - Update running balances automatically
   - Handle partial or missed contributions
   - Date-based entry system

3. **Projection Engine**

   - Calculate target achievement dates
   - Adjust projections based on actual performance
   - Handle variable contribution amounts
   - Provide multiple projection scenarios

4. **Visualization Dashboard**
   - Progress bars for each goal
   - Timeline graphs showing projected vs actual
   - Monthly contribution comparison charts
   - Goal achievement status indicators

## Data Model Structure

### Savings Goals (Virtual Accounts)

- Goal ID, Name, Description
- Target amount, Target date
- Expected monthly contribution
- Current accumulated balance
- Creation date, Status

### Monthly Contributions

- Goal ID reference
- Month/Year
- Projected amount
- Actual amount saved
- Variance (actual - projected)
- Running balance after contribution

### Projections

- Goal ID reference
- Original target date
- Adjusted target date based on performance
- Monthly projection data
- Achievement probability

## Business Logic Focus

The application serves as a financial goal tracking system that helps users:

- Visualize progress toward multiple financial objectives
- Understand the impact of actual vs planned saving behavior
- Make informed decisions about goal feasibility and timeline adjustments
- Maintain accountability through consistent tracking and reporting

## Example Use Cases

1. **Debt Repayment Goal**: Track progress paying back dad's loan
2. **Investment Goal**: Monitor rental income accumulation for investment
3. **Emergency Fund**: Build personal savings with monthly targets
4. **Multiple Goals**: Balance priorities across different financial objectives
