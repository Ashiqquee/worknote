# Work Notes

Work Notes is a modern, full-stack web application built with Next.js 13+ that helps you track and manage your daily work activities. With features like real-time updates, project-based organization, and detailed analytics, it's the perfect tool for professionals who want to maintain a clear record of their work.

## Features

- 📝 **Work Note Management**
  - Create, edit, and delete work notes with real-time validation
  - Organize notes by projects with automatic categorization
  - Rich text descriptions with proper sanitization
  - Time tracking with hours worked (supports 0.5-hour increments)
  - Safe MongoDB ObjectId conversions
  - Consistent timezone handling for dates

- 📊 **Dashboard & Analytics**
  - Visual representation of work distribution
  - Project-wise time allocation
  - Weekly and monthly statistics
  - Performance trends

- 🔒 **Secure Authentication**
  - Email-based authentication
  - Password reset functionality
  - Secure session management
  - Protected routes

- 💫 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Toast notifications
  - Loading states and animations
  - Form validation feedback
  - Real-time error handling with toast notifications
  - Dialog-based forms with proper state management
  - Responsive card layout for notes display
  - Real-time updates after modifications

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **State Management**: React Hooks
- **Styling**: Tailwind CSS, shadcn/ui
- **Form Handling**: React Hook Form with Zod schema validation
- **Type Safety**: TypeScript with strict type checking
- **Data Validation**: Zod schemas for runtime validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- MongoDB database (local or Atlas)
- SMTP server for email functionality

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_uri

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# SMTP Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=your_from_email
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/worknotes.git
   cd worknotes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Type Safety

The application implements comprehensive type safety:
- Strong TypeScript types for all components and functions
- Zod schema validation for form inputs
- Safe MongoDB ObjectId conversions
- Proper date and number type handling
- Runtime type checking for API requests/responses

### Form Handling

Forms are managed using a robust stack:
- React Hook Form for form state management
- Zod schemas for input validation
- Real-time validation feedback
- Proper handling of dates with consistent timezone
- Conversion between string and number types for hours
- Dialog-based forms with proper state management

### User Experience

The application focuses on providing a smooth user experience:
- Dialog-based forms for adding/editing notes
- Responsive card layout for displaying notes
- Loading states for all async operations
- Toast notifications for actions and errors
- Real-time updates after modifications
- Intuitive project organization
- Clear error messages and feedback

### Database Seeding

To populate the database with sample data:

```bash
GET /api/seed
```

This will create sample work notes with various projects and dates.

## API Routes

### Work Notes
- `GET /api/worknotes` - Get all work notes
  - Supports filtering by project name and date range
  - Returns sorted by date in descending order
  - Includes user-specific data filtering

- `POST /api/worknotes` - Create a new work note
  - Validates input using Zod schema
  - Automatically associates with current user
  - Returns created note with proper types

- `GET /api/worknotes/[id]` - Get a specific work note
  - Safe MongoDB ObjectId validation
  - User-specific access control
  - Proper error handling for not found cases

- `PUT /api/worknotes/[id]` - Update a work note
  - Full Zod schema validation
  - Safe type conversions for dates and numbers
  - Returns updated note with proper types

- `DELETE /api/worknotes/[id]` - Delete a work note
  - Safe deletion with proper error handling
  - User-specific access control
  - Returns success confirmation

### Projects
- `GET /api/projects` - Get all projects
  - Returns unique project names for the current user
  - Sorted alphabetically
  - Proper error handling

### Statistics
- `GET /api/stats` - Get work statistics
  - Supports timeframe filtering (weekly/monthly)
  - Project-wise aggregation
  - Hours worked calculations
  - Performance metrics

### Error Handling

All API routes implement consistent error handling:
- Proper HTTP status codes
- Detailed error messages
- Type-safe error responses
- MongoDB error handling
- Validation error details
- Authentication error handling

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Railway
1. Create a new project in Railway
2. Connect your GitHub repository
3. Add MongoDB and configure environment variables
4. Deploy

### Netlify
1. Push your code to GitHub
2. Import your repository in Netlify
3. Configure build settings and environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
