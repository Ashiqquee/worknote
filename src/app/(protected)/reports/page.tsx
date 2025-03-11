"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  interface WorkNote {
    _id: string;
    title: string;
    description: string;
    projectName: string;
    date: string;
    hoursWorked: number;
  }

  const [reports, setReports] = useState<WorkNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(weekEnd, "yyyy-MM-dd");
      
      let url = `/api/worknotes?startDate=${startDate}&endDate=${endDate}`;
      if (selectedProject !== "all") {
        url += `&projectName=${selectedProject}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, [weekStart, weekEnd, selectedProject]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to fetch projects");
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleNextWeek = useCallback(() => setCurrentWeek(addWeeks(currentWeek, 1)), [currentWeek]);
  const handlePrevWeek = useCallback(() => setCurrentWeek(subWeeks(currentWeek, 1)), [currentWeek]);

  const handleExportCSV = async () => {
    if (!reports.length) {
      toast.error("No data available to export");
      return;
    }

    try {
      setIsExporting(true);
      const csvContent = reports
        .map((report) => {
          return [
            report.title,
            report.description,
            report.projectName,
            format(new Date(report.date), "yyyy-MM-dd"),
            report.hoursWorked,
          ].join(",");
        })
        .join("\n");

      const header = "Title,Description,Project,Date,Hours\n";
      const blob = new Blob([header + csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Work-Report-${format(weekStart, "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintToPDF = () => {
    if (!reports.length) {
      toast.error("No data available to generate PDF");
      return;
    }
    if (componentRef.current) {
      const content = componentRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Work Report - ${format(weekStart, "yyyy-MM-dd")}</title>
              <style>
                body { font-family: system-ui, sans-serif; }
                .print-container { padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f4f4f4; }
                .text-right { text-align: right; }
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                ${content}
              </div>
              <script>
                window.onload = () => {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success("PDF generated successfully");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Weekly Reports</h1>
        
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{weekRange}</span>
            <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Notes Report</CardTitle>
            <CardDescription>
              {selectedProject === "all"
                ? "All projects"
                : `Project: ${selectedProject}`}
              {" • "}
              {weekRange}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isLoading || isExporting || !reports.length}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintToPDF} disabled={isLoading || !reports.length}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div ref={componentRef} className="print-container">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">No work notes found for this period.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell>
                          {format(new Date(report.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{report.title}</TableCell>
                        <TableCell>{report.projectName}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {report.description}
                        </TableCell>
                        <TableCell className="text-right">{report.hoursWorked}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total Hours
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.reduce((sum, report) => sum + report.hoursWorked, 0).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
