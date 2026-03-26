import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileForm from '../ProfileForm';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    teachers: {
      updateProfile: vi.fn(),
    },
  },
}));

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialData = { name: 'John Doe', school: 'Test School', board: 'CBSE' };

  it('renders with initial data', () => {
    render(<ProfileForm initialData={initialData} />);
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CBSE')).toBeInTheDocument();
  });

  it('calls api.teachers.updateProfile on submit and shows success message', async () => {
    vi.mocked(api.teachers.updateProfile).mockResolvedValue({ userId: '123', ...initialData });

    render(<ProfileForm initialData={null} />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('e.g. Mr. Sharma'), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Delhi Public School'), { target: { value: 'New School' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. CBSE'), { target: { value: 'New Board' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(api.teachers.updateProfile).toHaveBeenCalledWith({
        name: 'New Name',
        school: 'New School',
        board: 'New Board',
      });
    });

    expect(screen.getByText('Profile saved successfully.')).toBeInTheDocument();
  });

  it('shows error message when updateProfile fails', async () => {
    vi.mocked(api.teachers.updateProfile).mockRejectedValue({ message: 'Update failed' });

    render(<ProfileForm initialData={null} />);
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});
