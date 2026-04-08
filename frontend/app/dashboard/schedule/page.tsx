"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWeeklySchedule } from "@/features/schedule/api";
import { getTimeOffRequests } from "@/features/time-off/api";
import { cn } from "@/lib/utils";
import { getRoleBadgeClass, getRoleBorderClass } from "@/lib/role-colors";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const dayShortNameMap: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["weekly-schedule"],
    queryFn: getWeeklySchedule,
  });
  const { data: timeOffRequests } = useQuery({
    queryKey: ["time-off-requests"],
    queryFn: getTimeOffRequests,
  });

  const tableData = useMemo(() => {
    if (!data) {
      return { days: [], employees: [] } as const;
    }

    const days = data.map((day) => ({
      date: day.date,
      dayOfWeek: day.dayOfWeek,
      shortDayOfWeek: dayShortNameMap[day.dayOfWeek] ?? day.dayOfWeek,
      shifts: day.shifts,
    }));

    const employeesMap = new Map<string, { name: string; role: string }>();
    data.forEach((day) => {
      day.shifts.forEach((shift) => {
        if (!employeesMap.has(shift.employeeName)) {
          employeesMap.set(shift.employeeName, { name: shift.employeeName, role: shift.role });
        }
      });
    });

    const employees = Array.from(employeesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return { days, employees };
  }, [data]);

  const selectedDay = useMemo(
    () => data?.find((day) => day.date === selectedDate) ?? null,
    [data, selectedDate]
  );
  const requestsForSelectedDay = useMemo(
    () => timeOffRequests?.filter((request) => request.date === selectedDate) ?? [],
    [timeOffRequests, selectedDate]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Schedule</h2>
        <p className="text-muted-foreground">
          Weekly roster with staffing coverage status by role.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading weekly schedule...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">Failed to load schedule. Please try again.</p>
      ) : null}

      {!isLoading && !isError ? (
        <>
        <Tabs defaultValue="cards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.map((day) => {
                const assignedPerRole = day.shifts.reduce<Record<string, number>>(
                  (accumulator, shift) => {
                    accumulator[shift.role] = (accumulator[shift.role] ?? 0) + 1;
                    return accumulator;
                  },
                  {}
                );

                const shortages = day.requirements
                  .map((requirement) => {
                    const assignedCount = assignedPerRole[requirement.role] ?? 0;
                    if (assignedCount >= requirement.requiredCount) {
                      return null;
                    }

                    return {
                      role: requirement.role,
                      assignedCount,
                      requiredCount: requirement.requiredCount,
                    };
                  })
                  .filter((value): value is NonNullable<typeof value> => value !== null);

                return (
                  <Card
                    key={day.date}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <CardHeader>
                      <CardTitle>
                        {day.dayOfWeek} · {day.date}
                      </CardTitle>
                      <CardDescription>Assigned shifts: {day.shifts.length}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {shortages.length === 0 ? (
                          <Badge variant="secondary">Staffed: OK</Badge>
                        ) : (
                          shortages.map((shortage) => (
                            <Badge
                              key={`${day.date}-${shortage.role}`}
                              variant="outline"
                              className={cn(getRoleBadgeClass(shortage.role), "font-medium")}
                            >
                              Shortage: {shortage.role} ({shortage.assignedCount}/
                              {shortage.requiredCount})
                            </Badge>
                          ))
                        )}
                      </div>

                      <div className="space-y-2">
                        {day.shifts.map((shift) => (
                          <div
                            key={shift.id}
                            className={cn(
                              "rounded-md border px-3 py-2",
                              getRoleBorderClass(shift.role)
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium">{shift.employeeName}</p>
                              <Badge variant="outline" className={getRoleBadgeClass(shift.role)}>
                                {shift.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>Weekly table view</CardTitle>
                <CardDescription>
                  Excel-style view: rows are employees, columns are weekdays.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-[220px] bg-background">
                        Employee
                      </TableHead>
                      {tableData.days.map((day) => (
                        <TableHead key={day.date} className="min-w-[108px] text-center">
                          <div className="font-medium">{day.shortDayOfWeek}</div>
                          <div className="text-xs text-muted-foreground">{day.date}</div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {tableData.employees.map((employee) => (
                      <TableRow key={employee.name}>
                        <TableCell className="sticky left-0 z-10 bg-background font-medium">
                          <div>{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.role}</div>
                        </TableCell>
                        {tableData.days.map((day) => {
                          const shift = day.shifts.find(
                            (currentShift) => currentShift.employeeName === employee.name
                          );

                          return (
                            <TableCell key={`${employee.name}-${day.date}`} className="align-top">
                              {shift ? (
                                <div
                                  className={cn(
                                    "rounded-md border px-2 py-1 text-xs font-medium",
                                    getRoleBadgeClass(shift.role)
                                  )}
                                >
                                  {shift.startTime} - {shift.endTime}
                                </div>
                              ) : null}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Sheet open={selectedDate !== null} onOpenChange={(isOpen) => !isOpen && setSelectedDate(null)}>
          <SheetContent side="right" className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Schedule for {selectedDay?.date ?? selectedDate}</SheetTitle>
              <SheetDescription>
                Time-off requests for the selected date to quickly evaluate team availability.
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-3 px-4 pb-4">
              <h3 className="text-sm font-semibold">Time-off requests</h3>
              {requestsForSelectedDay.length > 0 ? (
                <div className="space-y-2">
                  {requestsForSelectedDay.map((request) => (
                    <div key={request.id} className="rounded-md border p-3">
                      <p className="font-medium">{request.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                      <Badge variant="outline" className="mt-2">
                        {request.status === "approved"
                          ? "Approved"
                          : request.status === "rejected"
                            ? "Rejected"
                            : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No time-off requests for this date.
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
        </>
      ) : null}
    </div>
  );
}
