import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TeacherDashboard from "../page";
import { AssignmentWithStats } from "@/lib/api/types";

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

  expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
  expect(screen.getByText("No Assignments Yet")).toBeInTheDocument();
  expect(
    screen.getByText(/Browse the Question Bank to build your first assignment/)
  ).toBeInTheDocument();
  expect(screen.getByText("Total Assignments")).toBeInTheDocument();
  expect(screen.getAllByText("0").length).toBeGreaterThan(0);
});

test("renders assignments list", async () => {
  vi.mocked(api.assignments.getStats).mockResolvedValueOnce([
    {
      id: "assign1",
      title: "Math Test 1",
      description: "Unit test assignment",
      subjectId: "math",
      classId: "class-10A",
      teacherId: "teacher-1",
      questionIds: ["q1"],
      className: "Class X (A)",
      dueDate: "2023-12-01",
      maxScore: 50,
      status: "PUBLISHED",
      totalMarks: 50,
      linkId: "link123",
      submissionCount: 5,
      averageScore: 40,
    },
  ] as AssignmentWithStats[]);

  const jsx = await TeacherDashboard();
  render(jsx);

  expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
  expect(screen.getAllByText("Math Test 1").length).toBeGreaterThan(0);
  expect(screen.getByText("ID: link123")).toBeInTheDocument();
  expect(screen.getByText("Class X (A)")).toBeInTheDocument();
  const reportLink = document.querySelector('a[href="/teacher/assignments/assign1"]');
  expect(reportLink).toBeTruthy();
});
