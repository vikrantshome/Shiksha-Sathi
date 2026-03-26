import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TeacherDashboard from "../page";

vi.mock("@/lib/api", () => ({
  api: {
    auth: {
      getMe: vi.fn().mockResolvedValue({ id: "teacher-1", name: "Teacher" }),
    },
    assignments: {
      getStats: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => { throw new Error("REDIRECT"); }),
}));

import { api } from "@/lib/api";

test("renders empty state when no assignments exist", async () => {
  vi.mocked(api.assignments.getStats).mockResolvedValueOnce([]);

  const jsx = await TeacherDashboard();
  render(jsx);

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("You haven't created any assignments yet.")).toBeInTheDocument();
  expect(screen.getByText(/Browse the Question Bank to get started/)).toBeInTheDocument();
  expect(screen.getByText("Total Assignments")).toBeInTheDocument();
  expect(screen.getAllByText("0")).toHaveLength(2);
});

test("renders assignments list", async () => {
  vi.mocked(api.assignments.getStats).mockResolvedValueOnce([
    {
      id: "assign1",
      title: "Math Test 1",
      className: "Class X (A)",
      dueDate: "2023-12-01",
      totalMarks: 50,
      linkId: "link123",
      submissionCount: 5,
      averageScore: 40,
    },
  ] as any[]);

  const jsx = await TeacherDashboard();
  render(jsx);

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Math Test 1")).toBeInTheDocument();
  expect(screen.getByText("ID: link123")).toBeInTheDocument();
  expect(screen.getByText("Class X (A)")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "View Report" })).toHaveAttribute("href", "/teacher/assignments/assign1");
});


