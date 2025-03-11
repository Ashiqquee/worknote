import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import WorkNote from '@/models/WorkNote';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'weekly';
    
    await connectToDatabase();
    
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;
    
    // Set date range based on timeframe
    switch (timeframe) {
      case 'weekly':
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
        break;
      case 'monthly':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'yearly':
        startDate = startOfYear(today);
        endDate = endOfYear(today);
        break;
      default:
        startDate = startOfWeek(today);
        endDate = endOfWeek(today);
    }
    
    // Get total count of tasks in the selected timeframe
    const totalTasks = await WorkNote.countDocuments({
      date: { $gte: startDate, $lte: endDate },
      userId: session.user.id
    });
    
    // Get total hours worked in the selected timeframe
    const totalHoursResult = await WorkNote.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          userId: session.user.id
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hoursWorked' }
        }
      }
    ]);
    
    const totalHours = totalHoursResult.length > 0 ? totalHoursResult[0].totalHours : 0;
    
    // Get tasks grouped by project
    const tasksByProject = await WorkNote.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          userId: session.user.id
        }
      },
      {
        $group: {
          _id: '$projectName',
          count: { $sum: 1 },
          hours: { $sum: '$hoursWorked' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get comparison with previous period
    let previousStartDate: Date;
    let previousEndDate: Date;
    
    switch (timeframe) {
      case 'weekly':
        previousStartDate = startOfWeek(subWeeks(today, 1));
        previousEndDate = endOfWeek(subWeeks(today, 1));
        break;
      case 'monthly':
        previousStartDate = startOfMonth(subMonths(today, 1));
        previousEndDate = endOfMonth(subMonths(today, 1));
        break;
      case 'yearly':
        previousStartDate = startOfYear(subYears(today, 1));
        previousEndDate = endOfYear(subYears(today, 1));
        break;
      default:
        previousStartDate = startOfWeek(subWeeks(today, 1));
        previousEndDate = endOfWeek(subWeeks(today, 1));
    }
    
    const previousTotalTasks = await WorkNote.countDocuments({
      date: { $gte: previousStartDate, $lte: previousEndDate },
      userId: session.user.id
    });
    
    // Get previous period's total hours
    const previousHoursResult = await WorkNote.aggregate([
      {
        $match: {
          date: { $gte: previousStartDate, $lte: previousEndDate },
          userId: session.user.id
        }
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hoursWorked' }
        }
      }
    ]);
    
    const previousTotalHours = previousHoursResult.length > 0 ? previousHoursResult[0].totalHours : 0;
    
    // Calculate percentage changes
    const tasksPercentageChange = previousTotalTasks === 0 
      ? 100 
      : ((totalTasks - previousTotalTasks) / previousTotalTasks) * 100;
      
    const hoursPercentageChange = previousTotalHours === 0
      ? 100
      : ((totalHours - previousTotalHours) / previousTotalHours) * 100;
    
    return NextResponse.json({
      totalTasks,
      totalHours,
      tasksByProject,
      tasksPercentageChange,
      hoursPercentageChange,
      timeframe,
      period: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
