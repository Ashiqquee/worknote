import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import WorkNote from '@/models/WorkNote';

// Sample project names
const projectNames = ["TravelHelp", "Other", "NotesO","Meeting"];

// Sample task titles
const taskTitles = [
  'Implement new feature',
  'Fix bug in login flow',
  'Update documentation',
  'Code review',
  'Write unit tests',
  'Refactor component',
  'Design UI mockups',
  'Optimize database queries',
  'Setup CI/CD pipeline',
  'Create API endpoints'
];

// Generate random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(
    thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );
};

// Generate random hours worked (0.5 to 4 in 0.5 increments)
const getRandomHours = () => {
  const options = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  return options[Math.floor(Math.random() * options.length)];
};

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await WorkNote.deleteMany({});
    
    // Generate 30 random work notes
    const sampleNotes = Array.from({ length: 30 }, () => ({
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
      description: `This is a detailed description of the task. It includes information about what needs to be done, how it should be implemented, and any other relevant details.`,
      projectName: projectNames[Math.floor(Math.random() * projectNames.length)],
      date: getRandomDate(),
      hoursWorked: getRandomHours(),
    }));
    
    // Insert sample data
    await WorkNote.insertMany(sampleNotes);
    
    return NextResponse.json({ 
      message: 'Database seeded successfully', 
      count: sampleNotes.length 
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
