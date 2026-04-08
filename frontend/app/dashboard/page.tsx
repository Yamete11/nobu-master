"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, ShieldAlert, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployees } from "@/features/employees/api";
import { getWeeklySchedule } from "@/features/schedule/api";
import { getTimeOffRequests } from "@/features/time-off/api";

export default function DashboardPage() {
  const { data: employees, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  const { data: timeOffRequests, isLoading: isTimeOffLoading } = useQuery({
    queryKey: ["time-off-requests"],
    queryFn: getTimeOffRequests,
  });
  const { data: weeklySchedule, isLoading: isScheduleLoading } = useQuery({
    queryKey: ["weekly-schedule"],
    queryFn: getWeeklySchedule,
  });

  const pendingRequests = useMemo(
    () => timeOffRequests?.filter((request) => request.status === "pending").length ?? 0,
    [timeOffRequests]
  );

  const scheduleRedFlags = useMemo(() => {
    if (!weeklySchedule) {
      return 0;
    }

    return weeklySchedule.reduce((totalFlags, day) => {
      const assignedByRole = day.shifts.reduce<Record<string, number>>((accumulator, shift) => {
        accumulator[shift.role] = (accumulator[shift.role] ?? 0) + 1;
        return accumulator;
      }, {});

      const dayFlags = day.requirements.reduce((flags, requirement) => {
        const assignedCount = assignedByRole[requirement.role] ?? 0;
        return assignedCount < requirement.requiredCount ? flags + 1 : flags;
      }, 0);

      return totalFlags + dayFlags;
    }, 0);
  }, [weeklySchedule]);

  const fridayOrTodayFlags = useMemo(() => {
    if (!weeklySchedule) {
      return 0;
    }

    const today = new Date().toISOString().slice(0, 10);
    const targetDays = weeklySchedule.filter(
      (day) => day.dayOfWeek === "Friday" || day.date === today
    );

    return targetDays.reduce((totalFlags, day) => {
      const assignedByRole = day.shifts.reduce<Record<string, number>>((accumulator, shift) => {
        accumulator[shift.role] = (accumulator[shift.role] ?? 0) + 1;
        return accumulator;
      }, {});

      const dayFlags = day.requirements.reduce((flags, requirement) => {
        const assignedCount = assignedByRole[requirement.role] ?? 0;
        return assignedCount < requirement.requiredCount ? flags + 1 : flags;
      }, 0);

      return totalFlags + dayFlags;
    }, 0);
  }, [weeklySchedule]);

  const isLoading = isEmployeesLoading || isTimeOffLoading || isScheduleLoading;
  const hasRedFlag = fridayOrTodayFlags > 0;

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Daily command center with staffing health, requests, and priority alerts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/60 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardDescription>Total Employees</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {isLoading ? <Skeleton className="h-9 w-20" /> : employees?.length ?? 0}
              </CardTitle>
            </div>
            <div className="rounded-lg border bg-background p-2">
              <Users className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Headcount currently available in the roster.</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardDescription>Pending Requests</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {isLoading ? <Skeleton className="h-9 w-16" /> : pendingRequests}
              </CardTitle>
            </div>
            <div className="rounded-lg border bg-background p-2">
              <CalendarClock className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Time-off requests waiting for manager action.</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardDescription>Schedule Status</CardDescription>
              {isLoading ? (
                <Skeleton className="h-7 w-36" />
              ) : hasRedFlag ? (
                <Badge variant="destructive" className="inline-flex w-fit gap-1">
                  <ShieldAlert className="size-3.5" />
                  Red Flag Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="inline-flex w-fit">
                  Fully Covered
                </Badge>
              )}
            </div>
            <div className="rounded-lg border bg-background p-2">
              {hasRedFlag ? (
                <AlertTriangle className="size-4 text-destructive" />
              ) : (
                <ShieldAlert className="size-4 text-emerald-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Checking today and Friday staffing health..."
                : hasRedFlag
                  ? `${fridayOrTodayFlags} staffing gap(s) detected for Friday or today.`
                  : "No critical shortages found for Friday or today."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Most relevant operational events from mocked data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <p className="text-sm">
                  Workforce synced: <span className="font-medium">{employees?.length ?? 0} staff members</span>
                </p>
                <Badge variant="outline">Roster</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <p className="text-sm">
                  Pending time-off queue: <span className="font-medium">{pendingRequests} request(s)</span>
                </p>
                <Badge variant="outline">Requests</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <p className="text-sm">
                  Weekly shortage signals: <span className="font-medium">{scheduleRedFlags} flag(s)</span>
                </p>
                <Badge variant={scheduleRedFlags > 0 ? "destructive" : "secondary"}>
                  {scheduleRedFlags > 0 ? "Attention" : "Stable"}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}