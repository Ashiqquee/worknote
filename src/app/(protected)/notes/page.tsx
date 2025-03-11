"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { NoteForm } from "@/components/notes/NoteForm";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { IWorkNote } from "@/models/WorkNote";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormData = {
  title: string;
  description: string;
  projectName: string;
  date: Date;
  hoursWorked: string;
};


export default function NotesPage() {
  const [notes, setNotes] = useState<IWorkNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<IWorkNote | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [weekFilter, setWeekFilter] = useState<'current' | 'all'>('current');


  // Fetch notes with filters
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = "/api/worknotes";
      
      if (weekFilter === 'current') {
        const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
        url += `?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch notes');
      }

      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch notes'
      );
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWeek, weekFilter]);

  useEffect(() => {
    fetchNotes();
  }, [selectedWeek, weekFilter, fetchNotes]);

  // Navigation functions for week selection
  const goToPreviousWeek = useCallback(() => {
    setSelectedWeek(prev => subWeeks(prev, 1));
    setWeekFilter('current');
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedWeek(prev => addWeeks(prev, 1));
    setWeekFilter('current');
  }, []);

  const handleWeekFilterChange = useCallback((value: string) => {
    setWeekFilter(value as 'current' | 'all');
  }, []);

  // Handle form submission for creating or updating a note
  const handleSubmit = useCallback(async (formData: FormData) => {
    try {
      const noteData = {
        ...formData,
        hoursWorked: parseFloat(formData.hoursWorked),
        date: new Date(formData.date).toISOString()
      };

      if (currentNote) {
        // Update existing note
        const response = await fetch(`/api/worknotes/${currentNote._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error('Failed to update note');
        }

        toast.success('Note updated successfully');
        fetchNotes();
        setIsDialogOpen(false);
        setCurrentNote(null);
      } else {
        // Create new note
        const response = await fetch("/api/worknotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(noteData),
        });

        if (!response.ok) {
          throw new Error('Failed to create note');
        }

        toast.success('Note created successfully');
        fetchNotes();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save note'
      );
    }
  }, [currentNote, fetchNotes]);

  // Handle note deletion
  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/worknotes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete note'
      );
    }
  }, [fetchNotes]);

  // Handle editing a note
  const handleEdit = useCallback((note: IWorkNote) => {
    setCurrentNote(note);
    setIsDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Work Notes</h1>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg flex-1 sm:flex-initial">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousWeek}
              className="h-8 w-8"
              disabled={weekFilter === 'all'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select value={weekFilter} onValueChange={handleWeekFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {weekFilter === 'all' ? 'All Notes' : 
                    `${format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')}`
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Week</SelectItem>
                <SelectItem value="all">All Notes</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextWeek}
              className="h-8 w-8"
              disabled={weekFilter === 'all'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-500" onClick={() => setCurrentNote(null)}>Add New Note</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {currentNote ? 'Edit Note' : 'Add New Note'}
              </DialogTitle>
            </DialogHeader>
            <NoteForm
              onSubmit={handleSubmit}
              initialData={
                currentNote
                  ? {
                      title: currentNote.title,
                      description: currentNote.description,
                      projectName: currentNote.projectName,
                      date: new Date(currentNote.date),
                      hoursWorked: currentNote.hoursWorked.toString(),
                    }
                  : undefined
              }
              isEditing={!!currentNote}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading notes...</span>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">
            {weekFilter === 'current' 
              ? `No work notes found for ${format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d')}`
              : 'No work notes found'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsDialogOpen(true)}
          >
            Add your first note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note._id?.toString()} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => note._id && handleDelete(note._id.toString())}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{note.projectName}</span>
                  <span>{format(new Date(note.date), "PPP")}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap line-clamp-4">{note.description}</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>Hours worked: {note.hoursWorked}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
