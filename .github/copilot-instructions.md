# GitHub Copilot Instructions

## Project Context

This is an income management application project for tracking and analyzing personal or business income streams built with React Router 7 and SQLite.

## Code Style Guidelines

- Use clear and descriptive variable names in English
- Follow consistent indentation (2 spaces for JSON/YAML/JavaScript/TypeScript)
- Include comments for complex financial logic
- Use meaningful commit messages in English
- Follow clean code principles
- Don't use comments before and after generate code
- Crate .d.ts for types and interfaces

## Specific Instructions for Income Management

- Focus on financial data accuracy and validation
- Implement proper error handling for monetary calculations
- Use Decimal type for currency values to avoid floating-point errors
- Consider security when handling financial information
- Validate all input data before processing
- Follow best practices for data persistence and retrieval
- Implement proper date handling for income tracking
- Use consistent currency formatting

## Technology Stack

- **Framework**: React Router 7 (React-based full-stack framework)
- **Database**: SQLite for development and production
- **Runtime**: Node.js
- **Package Manager**: pnpm (preferred over npm/yarn)

## Preferred Libraries/Frameworks

- **Core Framework**: React Router 7 with TypeScript
- **Database**:
  - SQLite with better-sqlite3 driver
  - Prisma ORM for database management
- **JavaScript/TypeScript**:
  - day.js for date handling
  - accounting.js for currency formatting
  - joi for validation
- **Styling**: Tailwind CSS (React Router 7-friendly)

## React Router 7-Specific Guidelines

- Use React Router 7 (React-based full-stack framework)
- Always try to generate reusable components before add views
- when you create components please follow BEM (Block Element Modifier) methodology, for easy ready tailwind clases
- Check reusable components before creating new ones
- Use React Router 7 loaders for data fetching
- Implement actions for form submissions and mutations
- Follow React Router 7 conventions for file-based routing
- Utilize React Router 7's built-in form handling and validation
- Implement proper error boundaries
- Use React Router 7's session management for authentication
- Follow progressive enhancement principles
- Use Response.json() instead of json function from Remix core, json function from Remix core is deprecated

## Financial Data Best Practices

- Always use Decimal for monetary calculations
- Store dates in ISO format
- Validate income categories and sources
- Implement proper audit trails for data changes
- Handle different currencies if applicable
- Ensure data backup and recovery procedures

## Security Considerations

- Sanitize all user inputs
- Implement proper authentication using React Router 7 sessions
- Encrypt sensitive financial data
- Use environment variables for configuration
- Implement proper logging without exposing sensitive data
- Follow React Router 7 security best practices for CSRF protection

## Development Workflow

- **IMPORTANT**: Do NOT attempt to verify terminal output after starting servers or running commands
- Terminal output visibility is limited - ask the user to verify changes instead
- When making changes that require verification:
  - Ask the user to start/restart the development server manually
  - Request screenshots or text descriptions of what they see
  - Ask for confirmation that changes are working as expected
- Focus on making correct code changes rather than verifying output
- Trust the user to provide feedback on the results
