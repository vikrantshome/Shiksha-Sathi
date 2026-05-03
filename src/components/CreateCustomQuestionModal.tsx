"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Question } from "@/lib/api/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (question: Question) => void;
  initialClassLevel?: string;
  initialSubject?: string;
}

export default function CreateCustomQuestionModal({ isOpen, onClose, onSuccess, initialClassLevel, initialSubject }: Props) {
  const [boards, setBoards] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [board, setBoard] = useState("");
  const [customBoard, setCustomBoard] = useState("");
  const [classLevel, setClassLevel] = useState(initialClassLevel || "");
  const [subjectId, setSubjectId] = useState(initialSubject || "");
  const [customSubject, setCustomSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [type, setType] = useState<"MCQ" | "MULTIPLE_CHOICE" | "SHORT_ANSWER">("MCQ");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [points, setPoints] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Fetch boards on open ── */
  useEffect(() => {
    if (isOpen) {
      api.questions.getBoards().then(setBoards).catch(console.error);
      api.questions.getSubjects().then(setSubjects).catch(console.error);
    }
  }, [isOpen]);

  /* ── Fetch classes when board changes ── */
  useEffect(() => {
    const selectedBoard = board === "__other__" ? customBoard : board;
    if (!selectedBoard) {
      setClasses([]);
      return;
    }
    api.questions.getClasses(selectedBoard).then(setClasses).catch(console.error);
  }, [board, customBoard]);

  if (!isOpen) return null;

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const resolvedBoard = board === "__other__" ? customBoard.trim() : board;
  const resolvedSubject = subjectId === "__other__" ? customSubject.trim() : subjectId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const filteredOptions = options.filter(o => o.trim() !== "");
      const payload: Partial<Question> = {
        subjectId: resolvedSubject,
        topic,
        text,
        type,
        options: type === "MCQ" || type === "MULTIPLE_CHOICE" ? filteredOptions : undefined,
        correctAnswer: type === "MCQ" ? filteredOptions[Number(correctAnswer)] || correctAnswer : type === "SHORT_ANSWER" ? correctAnswer : undefined,
        correctAnswers: type === "MULTIPLE_CHOICE" ? correctAnswers.filter(a => filteredOptions.includes(a)) : undefined,
        points: Number(points),
        provenance: {
          board: resolvedBoard,
          classLevel,
          subject: resolvedSubject,
          book: "My Custom Questions",
          chapterNumber: 999,
          chapterTitle: topic,
          sourceFile: "Teacher Created"
        }
      };

      const newQuestion = await api.questions.createCustom(payload);
      onSuccess(newQuestion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#12423f] text-white">
          <h2 className="text-lg font-bold m-0">Create Custom Question</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-transparent border-none text-xl cursor-pointer">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Board */}
            <div>
              <label htmlFor="custom-board" className="block text-xs font-semibold text-gray-600 mb-1">Board *</label>
              <select id="custom-board" required value={board} onChange={e => setBoard(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none">
                <option value="">Select Board</option>
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
                <option value="__other__">+ Other...</option>
              </select>
              {board === "__other__" && (
                <input
                  type="text"
                  required
                  value={customBoard}
                  onChange={e => setCustomBoard(e.target.value)}
                  placeholder="Enter board name"
                  className="w-full mt-2 p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none"
                />
              )}
            </div>

            {/* Class */}
            <div>
              <label htmlFor="custom-class-level" className="block text-xs font-semibold text-gray-600 mb-1">Class Level *</label>
              <select id="custom-class-level" required value={classLevel} onChange={e => setClassLevel(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none">
                <option value="">Select Class</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
                {/* Fallbacks if API returns empty initially */}
                {["6","7","8","9","10","11","12"].filter(c => !classes.includes(c)).map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="custom-subject" className="block text-xs font-semibold text-gray-600 mb-1">Subject *</label>
              <select id="custom-subject" required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__other__">+ Other...</option>
              </select>
              {subjectId === "__other__" && (
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Enter subject name"
                  className="w-full mt-2 p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none"
                />
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="custom-topic" className="block text-xs font-semibold text-gray-600 mb-1">Topic / Chapter Name *</label>
            <input id="custom-topic" required value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Chemical Reactions" className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none" />
          </div>

          <div>
            <label htmlFor="custom-text" className="block text-xs font-semibold text-gray-600 mb-1">Question Text *</label>
            <textarea id="custom-text" required value={text} onChange={e => setText(e.target.value)} placeholder="Enter your question here..." className="w-full p-3 border rounded-lg text-sm bg-gray-50 min-h-[100px] resize-y focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Question Type</label>
              <select value={type} onChange={e => {
                const newType = e.target.value as "MCQ" | "MULTIPLE_CHOICE" | "SHORT_ANSWER";
                setType(newType);
                if (newType !== "MULTIPLE_CHOICE") setCorrectAnswers([]);
              }} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none">
                <option value="MCQ">Single Answer (MCQ)</option>
                <option value="MULTIPLE_CHOICE">Multiple Answers (Multi-Select)</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Points</label>
              <input type="number" required min="1" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] outline-none" />
            </div>
          </div>

          {(type === "MCQ" || type === "MULTIPLE_CHOICE") && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
              <label className="block text-xs font-semibold text-gray-600">Answer Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  {type === "MULTIPLE_CHOICE" ? (
                    <input
                      type="checkbox"
                      checked={correctAnswers.includes(options[i])}
                      onChange={() => {
                        const val = options[i];
                        if (!val.trim()) return;
                        setCorrectAnswers(prev =>
                          prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
                        );
                      }}
                      className="w-4 h-4 text-[#12423f] cursor-pointer rounded"
                    />
                  ) : (
                    <input type="radio" name="correctAnswer" checked={correctAnswer === String(i)} onChange={() => setCorrectAnswer(String(i))} className="w-4 h-4 text-[#12423f] cursor-pointer" required={type === "MCQ"} />
                  )}
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} className="flex-1 p-2 border rounded-md text-sm outline-none focus:border-[#12423f]" required />
                </div>
              ))}
              <p className="text-[10px] text-gray-500 mt-2">
                {type === "MULTIPLE_CHOICE"
                  ? "Select all checkboxes next to correct answers. Student must select ALL correct options to score."
                  : "Select the radio button next to the correct answer."}
              </p>
            </div>
          )}

          {type === "SHORT_ANSWER" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Model / Correct Answer *</label>
              <textarea required value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} placeholder="Enter the correct answer or grading rubric..." className="w-full p-3 border rounded-lg text-sm bg-gray-50 min-h-[80px] resize-y focus:border-[#12423f] outline-none" />
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3 mt-auto">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-none bg-transparent">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#12423f] hover:bg-[#0a2927] rounded-lg shadow-md cursor-pointer transition-all disabled:opacity-50">
              {loading ? "Saving..." : "Create Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
