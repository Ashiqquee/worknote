# Work Notes

Work Notes is a modern, full-stack web application built with Next.js 13+ that helps you track and manage your daily work activities. With features like real-time updates, project-based organization, and detailed analytics, it's the perfect tool for professionals who want to maintain a clear record of their work.

## Features

- 📝 **Work Note Management**
  - Create, edit, and delete work notes
  - Organize notes by projects
  - Rich text descriptions
  - Time tracking with hours worked

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

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **State Management**: React Hooks
- **Styling**: Tailwind CSS, shadcn/ui
- **Form Handling**: React Hook Form, Zod

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

### Database Seeding

To populate the database with sample data:

```bash
GET /api/seed
```

This will create sample work notes with various projects and dates.

## API Routes

### Work Notes
- `GET /api/worknotes` - Get all work notes
- `POST /api/worknotes` - Create a new work note
- `GET /api/worknotes/[id]` - Get a specific work note
- `PUT /api/worknotes/[id]` - Update a work note
- `DELETE /api/worknotes/[id]` - Delete a work note

### Projects
- `GET /api/projects` - Get all projects

### Statistics
- `GET /api/stats` - Get work statistics

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
