import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssignmentProvider, useAssignment } from '../AssignmentContext';
import { Question } from '@/lib/api/types';
import React from 'react';

describe('AssignmentContext', () => {
  it('throws error if used outside provider', () => {
    // suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAssignment())).toThrow('useAssignment must be used within an AssignmentProvider');
    spy.mockRestore();
  });

  it('manages selected questions state', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AssignmentProvider>{children}</AssignmentProvider>;
    const { result } = renderHook(() => useAssignment(), { wrapper });

    const q1 = { id: 'q1', text: 'Test Q1' } as unknown as Question;
    
    // Initial state
    expect(result.current.selectedQuestions).toEqual([]);
    expect(result.current.isSelected('q1')).toBe(false);

    // Toggle to add
    act(() => {
      result.current.toggleQuestion(q1);
    });
    expect(result.current.selectedQuestions).toEqual([q1]);
    expect(result.current.isSelected('q1')).toBe(true);

    // Toggle to remove
    act(() => {
      result.current.toggleQuestion(q1);
    });
    expect(result.current.selectedQuestions).toEqual([]);

    // Add again and clear
    act(() => {
      result.current.toggleQuestion(q1);
    });
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedQuestions).toEqual([]);
  });
});
