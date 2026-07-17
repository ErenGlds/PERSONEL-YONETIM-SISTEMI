export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: Department;
  position: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Leave {
  _id: string;
  employee: Pick<Employee, "_id" | "firstName" | "lastName">;
  leaveType: "annual" | "sick" | "unpaid" | "maternity";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  pendingLeaves: number;
  approvedLeaves: number;
  upcomingHolidays: number;
  employeesByDepartment: { name: string; count: number }[];
}
export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
