import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import StudentAssignmentPage from "../page";
import { api } from "@/lib/api";
import { notFound } from "next/navigation";

vi.mock("@/lib/api", () => ({
  api: {
    assignments: {
      getByLinkId: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

// Mock the child component to simplify page testing
vi.mock("@/components/StudentAssignmentForm", () => ({
  default: () => <div data-testid="mock-student-form">Student Form</div>,
}));

test("calls notFound when api throws", async () => {
  vi.mocked(api.assignments.getByLinkId).mockRejectedValueOnce(new Error("Not found"));

  const params = Promise.resolve({ linkId: "invalid-link" });
  await expect(StudentAssignmentPage({ params })).rejects.toThrow("NOT_FOUND");
  expect(notFound).toHaveBeenCalled();
});

test("renders assignment details and form", async () => {
  vi.mocked(api.assignments.getByLinkId).mockResolvedValueOnce({
    id: "a1",
    title: "History Quiz",
    classId: "c1",
    dueDate: "2023-11-01T00:00:00Z",
    totalMarks: 50,
    questions: [],
  });

  const params = Promise.resolve({ linkId: "valid-link" });
  const jsx = await StudentAssignmentPage({ params });
  render(jsx);

  expect(screen.getByText("History Quiz")).toBeInTheDocument();
  expect(screen.getByText("50 Marks")).toBeInTheDocument();
  expect(screen.getByText(/Due: /)).toBeInTheDocument();
  expect(screen.getByTestId("mock-student-form")).toBeInTheDocument();
});
