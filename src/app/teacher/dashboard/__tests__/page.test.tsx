import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import TeacherDashboard from "../page";

// Mock the server action
vi.mock("@/app/actions/teacher", () => ({
  getAssignmentsWithStats: vi.fn(),
}));

import { getAssignmentsWithStats } from "@/app/actions/teacher";

test("renders empty state when no assignments exist", async () => {
  vi.mocked(getAssignmentsWithStats).mockResolvedValueOnce([]);

  const jsx = await TeacherDashboard();
  render(jsx);

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("You haven't created any assignments yet.")).toBeInTheDocument();
  expect(screen.getByText(/Browse the Question Bank to get started/)).toBeInTheDocument();
  expect(screen.getByText("Total Assignments")).toBeInTheDocument();
  expect(screen.getAllByText("0")).toHaveLength(2); // Total Assignments and Total Submissions
});

test("renders assignments list", async () => {
  vi.mocked(getAssignmentsWithStats).mockResolvedValueOnce([
    {
      id: "assign1",
      title: "Math Test 1",
      className: "Class X (A)",
      dueDate: "2023-12-01",
      totalMarks: 50,
      linkId: "link123",
      createdAt: new Date(),
      stats: {
        completionCount: 5,
        averageScore: 40,
      },
    },
  ]);

  const jsx = await TeacherDashboard();
  render(jsx);

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Math Test 1")).toBeInTheDocument();
  expect(screen.getByText("ID: link123")).toBeInTheDocument();
  expect(screen.getByText("Class X (A)")).toBeInTheDocument();
  expect(screen.getAllByText("5")).toHaveLength(2); // completionCount and summary card
  expect(screen.getByText("40 / 50")).toBeInTheDocument(); // Score
  // Note: Total Assignments is 1, Total Submissions is 5
  expect(screen.getByRole("link", { name: "View Report" })).toHaveAttribute("href", "/teacher/assignments/assign1");
});
