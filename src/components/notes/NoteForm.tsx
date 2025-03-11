import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  projectName: z.string().min(1, "Project name is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  hoursWorked: z.string().min(1, "Hours worked is required"),
});

// Define the props for the NoteForm component
interface NoteFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function NoteForm({ onSubmit, initialData, isEditing = false, onCancel }: NoteFormProps) {
  const [projects, setProjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      projectName: "",
      date: new Date(),
      hoursWorked: "1",
    },
  });
  
  // Fetch projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          toast.error("Failed to load projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };
    
    fetchProjects();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      // Set a consistent time (12:01) for the selected date
      const localDate = new Date(data.date);
      const isoDate = new Date(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        12, 1, 0
      ).toISOString();

      // Convert hoursWorked from string to number before submitting
      const formattedData = {
        ...data,
        date: isoDate,
        hoursWorked: parseFloat(data.hoursWorked),
      };
      
      await onSubmit(formattedData as any);
      toast.success(isEditing ? "Work note updated successfully" : "Work note added successfully");
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(isEditing ? "Failed to update work note" : "Failed to add work note");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Define hours worked options
  const hoursOptions = [
    { value: "0.5", label: "30 minutes" },
    { value: "1", label: "1 hour" },
    { value: "1.5", label: "1.5 hours" },
    { value: "2", label: "2 hours" },
    { value: "2.5", label: "2.5 hours" },
    { value: "3", label: "3 hours" },
    { value: "3.5", label: "3.5 hours" },
    { value: "4", label: "4 hours" },
  ];
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{isEditing ? "Edit Work Note" : "Add New Work Note"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter task title" 
                      {...field} 
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a detailed description (3-4 sentences)" 
                      className="min-h-[120px] resize-y transition-all duration-200 focus:ring-2 focus:ring-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem 
                            key={project} 
                            value={project}
                            className="cursor-pointer hover:bg-primary/10"
                          >
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="hoursWorked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Worked</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hoursOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="cursor-pointer hover:bg-primary/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] bg-indigo-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isEditing ? "Update" : "Add Note"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
