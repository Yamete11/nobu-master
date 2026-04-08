"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpDown, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createEmployee,
  getEmployees,
  type Employee,
  type EmployeeRole,
  updateEmployee,
} from "@/features/employees/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoleBadgeClass } from "@/lib/role-colors";

const employeeFormSchema = z.object({
  firstName: z.string().min(2, "First name must contain at least 2 characters"),
  lastName: z.string().min(2, "Last name must contain at least 2 characters"),
  role: z.enum(["Waiter", "Runner", "Host", "Bartender"]),
  managerNotes: z.string().min(5, "Manager notes must contain at least 5 characters"),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
type SortDirection = "asc" | "desc";
type SortKey = "name" | "role" | "points";

const roleOptions: EmployeeRole[] = ["Waiter", "Runner", "Host", "Bartender"];

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "Waiter",
      managerNotes: "",
    },
  });

  useEffect(() => {
    if (editingEmployee) {
      form.reset({
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        role: editingEmployee.role,
        managerNotes: editingEmployee.managerNotes,
      });
      return;
    }

    form.reset({
      firstName: "",
      lastName: "",
      role: "Waiter",
      managerNotes: "",
    });
  }, [editingEmployee, form, sheetOpen]);

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
      setSheetOpen(false);
      setEditingEmployee(null);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create employee. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeFormValues }) =>
      updateEmployee(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      setSheetOpen(false);
      setEditingEmployee(null);
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update employee. Please try again.");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const displayedEmployees = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filtered = normalizedSearch
      ? data.filter((employee) =>
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(normalizedSearch)
        )
      : data;

    return [...filtered].sort((left, right) => {
      if (sortKey === "points") {
        const result = left.points - right.points;
        return sortDirection === "asc" ? result : -result;
      }

      if (sortKey === "role") {
        const result = left.role.localeCompare(right.role);
        return sortDirection === "asc" ? result : -result;
      }

      const leftName = `${left.firstName} ${left.lastName}`;
      const rightName = `${right.firstName} ${right.lastName}`;
      const result = leftName.localeCompare(rightName);
      return sortDirection === "asc" ? result : -result;
    });
  }, [data, searchQuery, sortDirection, sortKey]);

  const handleSort = (nextSortKey: SortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === "points" ? "desc" : "asc");
  };

  const openCreateSheet = () => {
    setEditingEmployee(null);
    setSheetOpen(true);
  };

  const openEditSheet = (employee: Employee) => {
    setEditingEmployee(employee);
    setSheetOpen(true);
  };

  const onSubmit = (values: EmployeeFormValues) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, payload: values });
      return;
    }

    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">
            Restaurant team roster, performance points, and private manager notes.
          </p>
        </div>

        <Sheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) {
              setEditingEmployee(null);
            }
          }}
        >
          <SheetTrigger asChild>
            <Button size="lg" className="gap-2" onClick={openCreateSheet}>
              <Plus className="size-4" />
              Add Employee
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{editingEmployee ? "Edit Employee" : "New Employee"}</SheetTitle>
              <SheetDescription>
                {editingEmployee
                  ? "Update employee information and save changes."
                  : "Create a new employee profile for the team."}
              </SheetDescription>
            </SheetHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Alex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="border-input ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          {roleOptions.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="managerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager notes</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Strong communication with guests" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SheetFooter className="mt-8">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {editingEmployee ? "Save changes" : "Create Employee"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <Input
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search employees by name..."
        className="max-w-md"
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="-ml-3 h-auto px-3" onClick={() => handleSort("name")}>
                  Employee
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="-ml-3 h-auto px-3" onClick={() => handleSort("role")}>
                  Role
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead className="w-28 text-right">
                <Button
                  variant="ghost"
                  className="ml-auto h-auto px-3"
                  onClick={() => handleSort("points")}
                >
                  Points
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Manager Notes</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={`employees-skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-5 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full max-w-64" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-destructive">
                  Failed to load employee data.
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && displayedEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No employees found for this search query.
                </TableCell>
              </TableRow>
            )}

            {displayedEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeClass(employee.role)}>
                    {employee.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{employee.points}</TableCell>
                <TableCell className="text-muted-foreground">{employee.managerNotes}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditSheet(employee)}
                    aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
