export interface RoleRequirement {
  role: string;
  requiredCount: number;
}

export interface AssignedShift {
  id: string;
  employeeName: string;
  role: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  requirements: RoleRequirement[];
  shifts: AssignedShift[];
}

export const mockSchedule: DaySchedule[] = [
  {
    date: "2026-04-06",
    dayOfWeek: "Monday",
    requirements: [
      { role: "Waiter", requiredCount: 3 },
      { role: "Runner", requiredCount: 2 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "mon-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "mon-2", employeeName: "Mark Lee", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "mon-3", employeeName: "Sarah Wilson", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "mon-4", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "mon-5", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "mon-6", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-07",
    dayOfWeek: "Tuesday",
    requirements: [
      { role: "Waiter", requiredCount: 3 },
      { role: "Runner", requiredCount: 2 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "tue-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "tue-2", employeeName: "Mia Chen", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "tue-3", employeeName: "Luca Rossi", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "tue-4", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "tue-5", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "tue-6", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-08",
    dayOfWeek: "Wednesday",
    requirements: [
      { role: "Waiter", requiredCount: 3 },
      { role: "Runner", requiredCount: 2 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "wed-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "wed-2", employeeName: "Mia Chen", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "wed-3", employeeName: "Luca Rossi", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "wed-4", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "wed-5", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "wed-6", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-09",
    dayOfWeek: "Thursday",
    requirements: [
      { role: "Waiter", requiredCount: 3 },
      { role: "Runner", requiredCount: 2 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "thu-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "thu-2", employeeName: "Mia Chen", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "thu-3", employeeName: "Luca Rossi", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "thu-4", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "thu-5", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "thu-6", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-10",
    dayOfWeek: "Friday",
    requirements: [
      { role: "Waiter", requiredCount: 4 },
      { role: "Runner", requiredCount: 2 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "fri-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "11:00", endTime: "19:00" },
      { id: "fri-2", employeeName: "Luca Rossi", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "fri-3", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "fri-4", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "fri-5", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-11",
    dayOfWeek: "Saturday",
    requirements: [
      { role: "Waiter", requiredCount: 4 },
      { role: "Runner", requiredCount: 3 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "sat-1", employeeName: "Anna Johnson", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "sat-2", employeeName: "Mia Chen", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "sat-3", employeeName: "Luca Rossi", role: "Waiter", startTime: "14:00", endTime: "22:00" },
      { id: "sat-4", employeeName: "Noah Kim", role: "Waiter", startTime: "16:00", endTime: "23:00" },
      { id: "sat-5", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "sat-6", employeeName: "Jacob Miller", role: "Runner", startTime: "12:00", endTime: "20:00" },
      { id: "sat-7", employeeName: "Eva Brown", role: "Runner", startTime: "16:00", endTime: "23:00" },
      { id: "sat-8", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
  {
    date: "2026-04-12",
    dayOfWeek: "Sunday",
    requirements: [
      { role: "Waiter", requiredCount: 2 },
      { role: "Runner", requiredCount: 1 },
      { role: "Host", requiredCount: 1 },
    ],
    shifts: [
      { id: "sun-1", employeeName: "Mia Chen", role: "Waiter", startTime: "10:00", endTime: "18:00" },
      { id: "sun-2", employeeName: "Luca Rossi", role: "Waiter", startTime: "12:00", endTime: "20:00" },
      { id: "sun-3", employeeName: "Ken Sato", role: "Runner", startTime: "10:00", endTime: "18:00" },
      { id: "sun-4", employeeName: "Olivia Park", role: "Host", startTime: "11:00", endTime: "19:00" },
    ],
  },
];

export async function getWeeklySchedule(): Promise<DaySchedule[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSchedule;
}
