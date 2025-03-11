import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for our WorkNote document
export interface IWorkNote extends Document {
  title: string;
  description: string;
  projectName: string;
  date: Date;
  hoursWorked: number;
  userId: string;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for our WorkNote model
const WorkNoteSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    hoursWorked: {
      type: Number,
      required: [true, 'Hours worked is required'],
      min: [0.5, 'Minimum hours worked is 0.5'],
      max: [4, 'Maximum hours worked is 4'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Add compound index for efficient date and user filtering
WorkNoteSchema.index({ userId: 1, date: -1 });

// Create and export the WorkNote model
export default mongoose.models.WorkNote || mongoose.model<IWorkNote>('WorkNote', WorkNoteSchema);
