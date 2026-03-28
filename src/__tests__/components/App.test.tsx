/**
 * Component tests for src/App.tsx
 * Tests rendering, user interactions, state changes, and edge cases.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { BridgeCategory, BridgeResult } from '../../services/gemini';

// ─── Mock the Gemini service (using vi.hoisted to avoid hoisting issues) ──────

const { mockProcessIntent } = vi.hoisted(() => ({
  mockProcessIntent: vi.fn(),
}));

vi.mock('../../services/gemini', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/gemini')>();
  return {
    ...actual,
    processIntent: mockProcessIntent,
  };
});

// ─── Mock framer-motion to avoid animation-related test issues ────────────────

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const validBridgeResult: BridgeResult = {
  category: BridgeCategory.EMERGENCY,
  urgency: 'HIGH',
  summary: 'Car accident at 5th and Main with visible smoke.',
  structuredData: {
    location: '5th and Main',
    entities: ['car accident', 'smoke'],
    details: 'Active scene with fire risk.',
  },
  actions: [
    {
      title: 'Call Emergency Services',
      description: 'Dial 911 immediately to report the accident.',
      type: 'call',
      payload: '911',
    },
    {
      title: 'Navigate to Safe Zone',
      description: 'Move away from the accident site.',
      type: 'map',
      payload: '5th and Main, Safe Zone',
    },
  ],
  reasoning: 'Smoke indicates fire risk requiring immediate emergency response.',
};

const renderApp = () => render(<App />);

// ─── Initial Render ───────────────────────────────────────────────────────────

describe('App - initial render', () => {
  it('renders the OmniBridge title', () => {
    renderApp();
    expect(screen.getByText('OmniBridge')).toBeInTheDocument();
  });

  it('renders the subtitle/tagline', () => {
    renderApp();
    expect(screen.getByText(/Universal Intent Engine/i)).toBeInTheDocument();
  });

  it('renders the input textarea', () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    expect(textarea).toBeInTheDocument();
  });

  it('renders the Process button', () => {
    renderApp();
    const btn = screen.getByRole('button', { name: /process/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders the image drop zone', () => {
    renderApp();
    expect(
      screen.getByText(/drop image or click to upload/i)
    ).toBeInTheDocument();
  });

  it('does NOT show the result panel initially', () => {
    renderApp();
    expect(screen.queryByText(/Extracted Intelligence/i)).not.toBeInTheDocument();
  });

  it('does NOT show an error message initially', () => {
    renderApp();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders example hint buttons', () => {
    renderApp();
    const examples = screen.getAllByText(/Example/i);
    expect(examples.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the footer with legal text', () => {
    renderApp();
    expect(screen.getByText(/Privacy Encrypted/i)).toBeInTheDocument();
  });
});

// ─── Textarea Interaction ─────────────────────────────────────────────────────

describe('App - textarea input', () => {
  it('allows typing in the textarea', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Car accident at 5th and Main');
    expect(textarea).toHaveValue('Car accident at 5th and Main');
  });

  it('clears textarea after reset', async () => {
    mockProcessIntent.mockResolvedValueOnce(validBridgeResult);
    renderApp();

    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency situation');

    // Process
    const processBtn = screen.getByRole('button', { name: /process/i });
    await userEvent.click(processBtn);
    await waitFor(() =>
      expect(screen.getByText(validBridgeResult.summary)).toBeInTheDocument()
    );

    // Reset
    const closeBtn = screen.getAllByRole('button').find(
      (btn) => btn.querySelector('svg') && !btn.textContent?.includes('Process')
    );
    if (closeBtn) await userEvent.click(closeBtn);

    // Textarea should be cleared
    await waitFor(() => {
      const ta = screen.getByPlaceholderText(/describe the situation/i);
      expect(ta).toHaveValue('');
    });
  });
});

// ─── Submit Button State ──────────────────────────────────────────────────────

describe('App - submit button state', () => {
  it('is disabled when input is empty', () => {
    renderApp();
    const btn = screen.getByRole('button', { name: /process/i });
    expect(btn).toBeDisabled();
  });

  it('is enabled when text input is provided', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Some input');
    const btn = screen.getByRole('button', { name: /process/i });
    expect(btn).toBeEnabled();
  });

  it('is disabled while processing', async () => {
    // Mock a slow response
    let resolvePromise!: (value: BridgeResult) => void;
    const slowPromise = new Promise<BridgeResult>((res) => {
      resolvePromise = res;
    });
    mockProcessIntent.mockReturnValueOnce(slowPromise);

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    const btn = screen.getByRole('button', { name: /process/i });
    await userEvent.click(btn);

    // Should be disabled during processing
    await waitFor(() => expect(btn).toBeDisabled());

    // Resolve and clean up
    act(() => resolvePromise(validBridgeResult));
    await waitFor(() =>
      expect(screen.getByText(validBridgeResult.summary)).toBeInTheDocument()
    );
  });
});

// ─── Successful Processing ────────────────────────────────────────────────────

describe('App - successful processing', () => {
  beforeEach(() => {
    mockProcessIntent.mockResolvedValue(validBridgeResult);
  });

  it('shows the result summary after processing', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Car accident at 5th and Main');
    const btn = screen.getByRole('button', { name: /process/i });
    await userEvent.click(btn);

    await waitFor(() =>
      expect(screen.getByText(validBridgeResult.summary)).toBeInTheDocument()
    );
  });

  it('shows the result category', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText('EMERGENCY')).toBeInTheDocument()
    );
  });

  it('shows the urgency badge', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText(/HIGH Priority/i)).toBeInTheDocument()
    );
  });

  it('shows action cards', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() => {
      expect(screen.getByText('Call Emergency Services')).toBeInTheDocument();
      expect(screen.getByText('Navigate to Safe Zone')).toBeInTheDocument();
    });
  });

  it('shows system reasoning', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText(validBridgeResult.reasoning)).toBeInTheDocument()
    );
  });

  it('shows the Extracted Intelligence section', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText(/Extracted Intelligence/i)).toBeInTheDocument()
    );
  });

  it('calls processIntent with the correct input text', async () => {
    renderApp();
    const inputText = 'Car accident at 5th and Main, smoke visible';
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, inputText);
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(mockProcessIntent).toHaveBeenCalledWith(inputText, undefined)
    );
  });
});

// ─── Error Handling ───────────────────────────────────────────────────────────

describe('App - error handling', () => {
  it('shows an error message when processing fails', async () => {
    mockProcessIntent.mockRejectedValueOnce(
      new Error('Failed to process intent. Please try again.')
    );

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Some input');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to process intent/i)
      ).toBeInTheDocument()
    );
  });

  it('shows an error message for network failures', async () => {
    mockProcessIntent.mockRejectedValueOnce(new Error('Network error'));

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Test input');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    );
  });

  it('does not show the result panel when an error occurs', async () => {
    mockProcessIntent.mockRejectedValueOnce(new Error('API error'));

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Test');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.queryByText(/Extracted Intelligence/i)).not.toBeInTheDocument()
    );
  });
});

// ─── Example Hint Buttons ─────────────────────────────────────────────────────

describe('App - example hint buttons', () => {
  it('clicking Emergency example populates textarea', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);

    // Find the Emergency example button
    const exampleBtns = screen.getAllByText(/example/i);
    const emergencyBtn = exampleBtns[0].closest('button');
    if (emergencyBtn) await userEvent.click(emergencyBtn);

    // Textarea should now have the filled example text
    expect(textarea).not.toHaveValue('');
  });

  it('clicking Medical example populates textarea', async () => {
    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);

    const exampleBtns = screen.getAllByText(/example/i);
    const medicalBtn = exampleBtns[1]?.closest('button');
    if (medicalBtn) await userEvent.click(medicalBtn);

    expect(textarea).not.toHaveValue('');
  });

  it('clicking an example enables the Process button', async () => {
    renderApp();
    const exampleBtns = screen.getAllByText(/example/i);
    const firstBtn = exampleBtns[0].closest('button');
    if (firstBtn) await userEvent.click(firstBtn);

    const processBtn = screen.getByRole('button', { name: /process/i });
    expect(processBtn).toBeEnabled();
  });
});

// ─── HEALTHCARE and other categories ─────────────────────────────────────────

describe('App - result categories', () => {
  it('renders HEALTHCARE category correctly', async () => {
    const healthResult: BridgeResult = {
      ...validBridgeResult,
      category: BridgeCategory.HEALTHCARE,
      urgency: 'HIGH',
      summary: 'Patient has high fever with history of asthma.',
    };
    mockProcessIntent.mockResolvedValueOnce(healthResult);

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Medical emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText('HEALTHCARE')).toBeInTheDocument()
    );
  });

  it('renders ENVIRONMENT category correctly', async () => {
    const envResult: BridgeResult = {
      ...validBridgeResult,
      category: BridgeCategory.ENVIRONMENT,
      urgency: 'MEDIUM',
      summary: 'Oil spill detected in local creek near industrial park.',
    };
    mockProcessIntent.mockResolvedValueOnce(envResult);

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Environmental incident');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText('ENVIRONMENT')).toBeInTheDocument()
    );
  });

  it('renders CRITICAL urgency with distinct styling', async () => {
    const criticalResult: BridgeResult = {
      ...validBridgeResult,
      urgency: 'CRITICAL',
    };
    mockProcessIntent.mockResolvedValueOnce(criticalResult);

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Critical emergency');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText(/CRITICAL Priority/i)).toBeInTheDocument()
    );
  });
});

// ─── Structured Data Rendering ────────────────────────────────────────────────

describe('App - structured data rendering', () => {
  it('renders array values as tags', async () => {
    mockProcessIntent.mockResolvedValueOnce({
      ...validBridgeResult,
      structuredData: {
        entities: ['fever', 'rash', 'asthma'],
        location: '',
        details: '',
      },
    });

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Patient info');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() => {
      expect(screen.getByText('fever')).toBeInTheDocument();
      expect(screen.getByText('rash')).toBeInTheDocument();
      expect(screen.getByText('asthma')).toBeInTheDocument();
    });
  });

  it('renders string values as text', async () => {
    mockProcessIntent.mockResolvedValueOnce({
      ...validBridgeResult,
      structuredData: {
        location: '5th and Main Street',
        entities: [],
        details: '',
      },
    });

    renderApp();
    const textarea = screen.getByPlaceholderText(/describe the situation/i);
    await userEvent.type(textarea, 'Location query');
    await userEvent.click(screen.getByRole('button', { name: /process/i }));

    await waitFor(() =>
      expect(screen.getByText('5th and Main Street')).toBeInTheDocument()
    );
  });
});
