import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileForm from '../ProfileForm';
import { updateProfileAction } from '@/app/actions/profile';

vi.mock('@/app/actions/profile', () => ({
  updateProfileAction: vi.fn(),
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

  it('calls updateProfileAction on submit and shows success message', async () => {
    vi.mocked(updateProfileAction).mockResolvedValue({ success: true } as never);

    render(<ProfileForm initialData={null} />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('e.g. Mr. Sharma'), { target: { value: 'New Name' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => {
      expect(updateProfileAction).toHaveBeenCalled();
    });

    expect(screen.getByText('Profile saved successfully.')).toBeInTheDocument();
  });
});
