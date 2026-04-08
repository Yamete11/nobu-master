export interface TimeOffRequest {
  id: string;
  employeeName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

function addDays(baseDate: Date, days: number): Date {
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + days);
  return nextDate;
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createMockTimeOffRequests(): TimeOffRequest[] {
  const today = new Date();

  const offsets = [1, 2, 4, 7, 10];

  return [
    {
      id: "tor-001",
      employeeName: "Anna Petrova",
      date: formatIsoDate(addDays(today, offsets[0])),
      reason: "Family event",
      status: "pending",
    },
    {
      id: "tor-002",
      employeeName: "Dmitry Ivanov",
      date: formatIsoDate(addDays(today, offsets[1])),
      reason: "Doctor appointment",
      status: "approved",
    },
    {
      id: "tor-003",
      employeeName: "Elena Smirnova",
      date: formatIsoDate(addDays(today, offsets[2])),
      reason: "Short trip",
      status: "pending",
    },
    {
      id: "tor-004",
      employeeName: "Kirill Volkov",
      date: formatIsoDate(addDays(today, offsets[3])),
      reason: "Personal circumstances",
      status: "rejected",
    },
    {
      id: "tor-005",
      employeeName: "Maria Kozlova",
      date: formatIsoDate(addDays(today, offsets[4])),
      reason: "Studies",
      status: "approved",
    },
  ];
}

const mockTimeOffRequests: TimeOffRequest[] = createMockTimeOffRequests();

export async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return [...mockTimeOffRequests].sort((a, b) => a.date.localeCompare(b.date));
}

export async function updateTimeOffRequestStatus(
  id: string,
  status: "approved" | "rejected"
): Promise<TimeOffRequest> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const requestIndex = mockTimeOffRequests.findIndex((request) => request.id === id);
  if (requestIndex === -1) {
    throw new Error("Request not found");
  }

  const updatedRequest: TimeOffRequest = {
    ...mockTimeOffRequests[requestIndex],
    status,
  };
  mockTimeOffRequests[requestIndex] = updatedRequest;

  return updatedRequest;
}
