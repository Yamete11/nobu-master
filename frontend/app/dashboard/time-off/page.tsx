"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEmployees } from "@/features/employees/api";
import {
  getTimeOffRequests,
  type TimeOffRequest,
  updateTimeOffRequestStatus,
} from "@/features/time-off/api";

function getStatusLabel(status: TimeOffRequest["status"]) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function getStatusClasses(status: TimeOffRequest["status"]) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
  }

  return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800";
}

function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function getDaysUntil(dateString: string): number {
  const now = toStartOfDay(new Date());
  const requestDate = toStartOfDay(new Date(dateString));
  const diffMs = requestDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getDaysBadgeClasses(daysUntil: number): string {
  if (daysUntil <= 1) {
    return "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  }

  if (daysUntil <= 7) {
    return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  }

  return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
}

function getDaysLabel(daysUntil: number): string {
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil} days`;
}

export default function TimeOffPage() {
  const [timeframe, setTimeframe] = useState<"7" | "14">("14");
  const queryClient = useQueryClient();
  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["time-off-requests"],
    queryFn: getTimeOffRequests,
  });
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      updateTimeOffRequestStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["time-off-requests"] });

      const previousRequests = queryClient.getQueryData<TimeOffRequest[]>(["time-off-requests"]);
      queryClient.setQueryData<TimeOffRequest[]>(["time-off-requests"], (currentRequests = []) =>
        currentRequests.map((request) => (request.id === id ? { ...request, status } : request))
      );

      return { previousRequests };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(["time-off-requests"], context.previousRequests);
      }
      toast.error("Failed to update status. Please try again.");
    },
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData<TimeOffRequest[]>(["time-off-requests"], (currentRequests = []) =>
        currentRequests.map((request) =>
          request.id === updatedRequest.id ? updatedRequest : request
        )
      );
      toast.success(
        updatedRequest.status === "approved" ? "Request approved" : "Request rejected"
      );
    },
  });

  const matrixDays = useMemo(() => {
    const dayCount = Number(timeframe);
    const today = toStartOfDay(new Date());

    return Array.from({ length: dayCount }, (_, index) => {
      const date = addDays(today, index);
      return {
        date,
        isoDate: formatIsoDate(date),
        dayLabel: formatWeekday(date),
      };
    });
  }, [timeframe]);

  const matrixEmployees = useMemo(() => {
    if (!employees) return [];

    return [...employees]
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )
      .map((employee) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.role,
      }));
  }, [employees]);

  const requestByEmployeeAndDate = useMemo(() => {
    const map = new Map<string, TimeOffRequest>();
    requests?.forEach((request) => {
      map.set(`${request.employeeName}__${request.date}`, request);
    });
    return map;
  }, [requests]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Time-off Requests</h2>
        <p className="text-muted-foreground">
          Review and approve employee requests for days off.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading requests...</p>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">Failed to load requests. Please try again.</p>
      ) : null}

      {!isLoading && !isError ? (
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => {
                    const daysUntil = getDaysUntil(request.date);

                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{request.date}</span>
                            <Badge
                              variant="outline"
                              className={`h-5 px-1.5 text-[11px] ${getDaysBadgeClasses(daysUntil)}`}
                            >
                              {getDaysLabel(daysUntil)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate text-muted-foreground">
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusClasses(request.status)}>
                            {getStatusLabel(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === "pending" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  mutation.mutate({
                                    id: request.id,
                                    status: "approved",
                                  })
                                }
                                disabled={mutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  mutation.mutate({
                                    id: request.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={mutation.isPending}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="flex justify-end text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-3">
            <div className="flex justify-end">
              <Select value={timeframe} onValueChange={(value) => setTimeframe(value as "7" | "14")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 Days</SelectItem>
                  <SelectItem value="14">Next 14 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table className="min-w-[960px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 min-w-[220px] bg-card">
                      Employee
                    </TableHead>
                    {matrixDays.map((day) => (
                      <TableHead key={day.isoDate} className="min-w-[96px] text-center">
                        <div className="font-medium">{day.dayLabel}</div>
                        <div className="text-xs text-muted-foreground">{day.isoDate}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="sticky left-0 z-10 bg-card font-medium">
                        <div>{employee.name}</div>
                        <div className="text-xs text-muted-foreground">{employee.role}</div>
                      </TableCell>
                      {matrixDays.map((day) => {
                        const request = requestByEmployeeAndDate.get(
                          `${employee.name}__${day.isoDate}`
                        );

                        return (
                          <TableCell key={`${employee.id}-${day.isoDate}`} className="text-center">
                            {request ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button type="button">
                                    <Badge
                                      variant="outline"
                                      className={`h-5 cursor-pointer px-1.5 text-[10px] ${getStatusClasses(request.status)}`}
                                    >
                                      {request.status.toUpperCase()}
                                    </Badge>
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56">
                                  <p className="text-xs text-muted-foreground">{request.date}</p>
                                  <p className="mt-1 text-sm font-medium">{request.employeeName}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {request.reason}
                                  </p>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <span className="mx-auto block size-1.5 rounded-full bg-muted-foreground/30" />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </section>
  );
}
