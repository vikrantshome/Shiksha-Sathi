import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi, beforeEach, describe } from "vitest";
import StudentAssignmentForm from "../StudentAssignmentForm";
import { api } from "@/lib/api";
import { SubmitAssignmentResponse, AssignmentByLinkResponse } from "@/lib/api/types";

vi.mock("@/lib/api", () => ({
  api: {
    assignments: {
      submitAssignment: vi.fn(),
    }
  }
}));

describe("StudentAssignmentForm", () => {
  const mockAssignment = {
    id: "a1",
    title: "Quiz",
    totalMarks: 10,
    questions: [
      { id: "q1", text: "Q1 Text", type: "MCQ" as const, marks: 5, options: ["A", "B"], subject: "Math", grade: "10", chapter: "C1", topic: "T1" },
      { id: "q2", text: "Q2 Text", type: "FILL_IN_BLANKS" as const, marks: 5, subject: "Science", grade: "10", chapter: "C2", topic: "T2" },
    ],
  } as unknown as AssignmentByLinkResponse;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders identity form first", () => {
    render(<StudentAssignmentForm assignment={mockAssignment} />);
    
    expect(screen.getByText("Enter your details to start")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Aarav Patel")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your unique ID")).toBeInTheDocument();
  });

  test("filling identity form shows questions", async () => {
    render(<StudentAssignmentForm assignment={mockAssignment} />);
    
    fireEvent.change(screen.getByPlaceholderText("e.g. Aarav Patel"), {
      target: { value: "Student 1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your unique ID"), {
      target: { value: "Roll 1" },
    });
    fireEvent.click(screen.getByText("Start Assignment"));
    
    expect(screen.getByText("Student:")).toBeInTheDocument();
    expect(screen.getByText("Student 1")).toBeInTheDocument();
    expect(screen.getByText("Q1 Text")).toBeInTheDocument();
    expect(screen.getByText("Q2 Text")).toBeInTheDocument();
    expect(screen.getByText("0 of 2 answered")).toBeInTheDocument();
  });

  test("validates all questions answered before submit", async () => {
    render(<StudentAssignmentForm assignment={mockAssignment} />);
    
    // Login
    fireEvent.change(screen.getByPlaceholderText("e.g. Aarav Patel"), { target: { value: "Student 1" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your unique ID"), { target: { value: "Roll 1" } });
    fireEvent.click(screen.getByText("Start Assignment"));
    
    // Submit without answering
    fireEvent.click(screen.getByText("Submit Assignment"));
    expect(screen.getByText("Please answer all questions before submitting.")).toBeInTheDocument();
    
    // Answer one question
    fireEvent.click(screen.getByText("A) A"));
    fireEvent.click(screen.getByText("Submit Assignment"));
    expect(screen.getByText("Please answer all questions before submitting.")).toBeInTheDocument();
  });

  test("submits answers and shows results", async () => {
    const submissionResult: SubmitAssignmentResponse = {
      success: true,
      score: 10,
      totalMarks: 10,
      feedback: [
        { questionId: "q1", questionText: "Q1 Text", studentAnswer: "A", isCorrect: true, marksAwarded: 5, correctAnswer: "A" },
        { questionId: "q2", questionText: "Q2 Text", studentAnswer: "Test", isCorrect: true, marksAwarded: 5, correctAnswer: "Test" },
      ],
    };
    vi.mocked(api.assignments.submitAssignment).mockResolvedValueOnce(submissionResult);

    render(<StudentAssignmentForm assignment={mockAssignment} />);
    
    // Login
    fireEvent.change(screen.getByPlaceholderText("e.g. Aarav Patel"), { target: { value: "Student" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your unique ID"), { target: { value: "Roll" } });
    fireEvent.click(screen.getByText("Start Assignment"));
    
    // Answer questions
    fireEvent.click(screen.getByText("A) A"));
    fireEvent.change(screen.getByPlaceholderText("Type your answer here..."), { target: { value: "Test" } });
    
    // Submit
    fireEvent.click(screen.getByText("Submit Assignment"));
    
    expect(api.assignments.submitAssignment).toHaveBeenCalledWith("a1", "Student", "Roll", { q1: "A", q2: "Test" });

    await waitFor(() => {
      expect(screen.getByText("Assignment Submitted Successfully")).toBeInTheDocument();
    });
    
    expect(screen.getByText("10")).toBeInTheDocument(); // Score
  });
});
