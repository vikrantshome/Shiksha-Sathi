import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import StudentAssignmentPage from "../page";
import { getAssignmentByLinkId } from "@/app/actions/student";
import { notFound } from "next/navigation";

vi.mock("@/app/actions/student", () => ({
  getAssignmentByLinkId: vi.fn(),
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

test("calls notFound when assignment doesn't exist", async () => {
  vi.mocked(getAssignmentByLinkId).mockResolvedValueOnce(null);

  const params = Promise.resolve({ linkId: "invalid-link" });
  await expect(StudentAssignmentPage({ params })).rejects.toThrow("NOT_FOUND");
  expect(notFound).toHaveBeenCalled();
});

test("renders assignment details and form", async () => {
  vi.mocked(getAssignmentByLinkId).mockResolvedValueOnce({
    id: "a1",
    title: "History Quiz",
    classId: "c1",
    dueDate: "2023-11-01",
    totalMarks: 50,
    questions: [],
  });

  const params = Promise.resolve({ linkId: "valid-link" });
  const jsx = await StudentAssignmentPage({ params });
  render(jsx);

  expect(screen.getByText("History Quiz")).toBeInTheDocument();
  expect(screen.getByText("Total Marks: 50")).toBeInTheDocument();
  expect(screen.getByText(/Due: /)).toBeInTheDocument();
  expect(screen.getByTestId("mock-student-form")).toBeInTheDocument();
});
