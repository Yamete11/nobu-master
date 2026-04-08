export type EmployeeRole = "Waiter" | "Runner" | "Host" | "Bartender";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  points: number;
  managerNotes: string;
}

const mockEmployees: Employee[] = [
  {
    id: "emp-001",
    firstName: "Alex",
    lastName: "Smith",
    role: "Waiter",
    points: 92,
    managerNotes: "Consistently handles VIP sections on Fridays.",
  },
  {
    id: "emp-002",
    firstName: "Marina",
    lastName: "Kuznetsova",
    role: "Runner",
    points: 85,
    managerNotes: "Adapts quickly during peak hours.",
  },
  {
    id: "emp-003",
    firstName: "Ilya",
    lastName: "Volkov",
    role: "Bartender",
    points: 88,
    managerNotes: "Strong in evening shifts, needs better checklist discipline.",
  },
  {
    id: "emp-004",
    firstName: "Sophia",
    lastName: "Lebedeva",
    role: "Host",
    points: 90,
    managerNotes: "Excellent guest communication, high NPS.",
  },
  {
    id: "emp-005",
    firstName: "Dmitry",
    lastName: "Orlov",
    role: "Waiter",
    points: 79,
    managerNotes: "Needs mentoring on premium menu upsell.",
  },
  {
    id: "emp-006",
    firstName: "Ekaterina",
    lastName: "Pavlova",
    role: "Runner",
    points: 83,
    managerNotes: "Good speed, should improve kitchen collaboration.",
  },
];

export async function getEmployees(): Promise<Employee[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockEmployees;
}

export type EmployeeFormPayload = {
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  managerNotes: string;
};

export async function createEmployee(payload: EmployeeFormPayload): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const employee: Employee = {
    id: `emp-${Math.random().toString(36).slice(2, 10)}`,
    points: 0,
    ...payload,
  };

  mockEmployees.unshift(employee);
  return employee;
}

export async function updateEmployee(
  id: string,
  payload: EmployeeFormPayload
): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const employeeIndex = mockEmployees.findIndex((employee) => employee.id === id);
  if (employeeIndex === -1) {
    throw new Error("Employee not found");
  }

  const updatedEmployee: Employee = {
    ...mockEmployees[employeeIndex],
    ...payload,
  };

  mockEmployees[employeeIndex] = updatedEmployee;
  return updatedEmployee;
}
