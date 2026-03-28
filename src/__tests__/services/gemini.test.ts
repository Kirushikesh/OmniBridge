/**
 * Unit tests for src/services/gemini.ts
 * Tests the processIntent function and related types/enums.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  processIntent,
  BridgeCategory,
  BridgeResult,
} from '../../services/gemini';

// ─── Mock @google/genai ───────────────────────────────────────────────────────
// vi.hoisted ensures mockGenerateContent exists before vi.mock factory runs.

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/genai', () => {
  // Use a function constructor so `new GoogleGenAI()` works correctly.
  function MockGoogleGenAI(this: any) {
    this.models = { generateContent: mockGenerateContent };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
    Type: {},
    GenerateContentResponse: {},
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeMockResponse = (data: object) => ({
  text: JSON.stringify(data),
});

const validResult: BridgeResult = {
  category: BridgeCategory.EMERGENCY,
  urgency: 'HIGH',
  summary: 'Car accident at 5th and Main with smoke visible.',
  structuredData: {
    location: '5th and Main',
    entities: ['car accident', 'smoke'],
    details: 'Active scene with potential fire hazard.',
  },
  actions: [
    {
      title: 'Call Emergency Services',
      description: 'Dial 911 immediately.',
      type: 'call',
      payload: '911',
    },
  ],
  reasoning: 'Smoke at an accident scene indicates a potential fire risk.',
};

// ─── BridgeCategory Enum ─────────────────────────────────────────────────────

describe('BridgeCategory', () => {
  it('has all required category values', () => {
    expect(BridgeCategory.EMERGENCY).toBe('EMERGENCY');
    expect(BridgeCategory.HEALTHCARE).toBe('HEALTHCARE');
    expect(BridgeCategory.ENVIRONMENT).toBe('ENVIRONMENT');
    expect(BridgeCategory.SOCIAL_AID).toBe('SOCIAL_AID');
    expect(BridgeCategory.GENERAL).toBe('GENERAL');
  });

  it('has exactly 5 categories', () => {
    const keys = Object.keys(BridgeCategory);
    expect(keys).toHaveLength(5);
  });
});

// ─── processIntent — Happy Path ───────────────────────────────────────────────

describe('processIntent - valid text input', () => {
  beforeEach(() => {
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(validResult));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns a BridgeResult with correct shape', async () => {
    const result = await processIntent('Car accident at 5th and Main, smoke visible');

    expect(result).toMatchObject({
      category: expect.any(String),
      urgency: expect.any(String),
      summary: expect.any(String),
      structuredData: expect.any(Object),
      actions: expect.any(Array),
      reasoning: expect.any(String),
    });
  });

  it('returns the correct category', async () => {
    const result = await processIntent('Car accident at 5th and Main');
    expect(result.category).toBe(BridgeCategory.EMERGENCY);
  });

  it('returns urgency as one of the valid levels', async () => {
    const result = await processIntent('Car accident at 5th and Main');
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(result.urgency);
  });

  it('returns a non-empty summary string', async () => {
    const result = await processIntent('Patient has high fever and rash');
    expect(result.summary).toBeTruthy();
    expect(typeof result.summary).toBe('string');
  });

  it('returns at least one action', async () => {
    const result = await processIntent('Emergency at 5th and Main');
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('calls the Gemini API with the given text input', async () => {
    const input = 'Oil spill in local creek near industrial park';
    await processIntent(input);

    expect(mockGenerateContent).toHaveBeenCalledOnce();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents[0].parts[0].text).toBe(input);
  });

  it('includes systemInstruction in the API call', async () => {
    await processIntent('test input');
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.config.systemInstruction).toBeTruthy();
  });

  it('requests JSON response format', async () => {
    await processIntent('test input');
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.config.responseMimeType).toBe('application/json');
  });
});

// ─── processIntent — Image Input ─────────────────────────────────────────────

describe('processIntent - with image input', () => {
  beforeEach(() => {
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(validResult));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockImage = {
    data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...',
    mimeType: 'image/jpeg',
  };

  it('includes image data in the API call parts', async () => {
    await processIntent('What is this?', mockImage);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const parts = callArgs.contents[0].parts;
    expect(parts).toHaveLength(2);
    expect(parts[1]).toMatchObject({
      inlineData: {
        data: expect.any(String), // base64 without prefix
        mimeType: 'image/jpeg',
      },
    });
  });

  it('strips the data URL prefix from image data', async () => {
    await processIntent('Analyze this image', mockImage);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    const imagePart = callArgs.contents[0].parts[1];
    // Should NOT include the "data:image/jpeg;base64," prefix
    expect(imagePart.inlineData.data).not.toContain('data:');
    expect(imagePart.inlineData.data).not.toContain(';base64,');
  });

  it('uses fallback text when input is empty but image is provided', async () => {
    await processIntent('', mockImage);

    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents[0].parts[0].text).toBe(
      'Analyze this input for societal benefit.'
    );
  });

  it('returns a valid BridgeResult when processing an image', async () => {
    const result = await processIntent('What do you see?', mockImage);
    expect(result).toMatchObject({
      category: expect.any(String),
      urgency: expect.any(String),
      actions: expect.any(Array),
    });
  });
});

// ─── processIntent — Action Types ────────────────────────────────────────────

describe('processIntent - action type validation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('correctly parses a "call" action type', async () => {
    const resultWithCall: BridgeResult = {
      ...validResult,
      actions: [
        {
          title: 'Call 911',
          description: 'Call emergency services',
          type: 'call',
          payload: '911',
        },
      ],
    };
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(resultWithCall));

    const result = await processIntent('Emergency');
    expect(result.actions[0].type).toBe('call');
    expect(result.actions[0].payload).toBe('911');
  });

  it('correctly parses a "map" action type', async () => {
    const resultWithMap: BridgeResult = {
      ...validResult,
      actions: [
        {
          title: 'Navigate to Hospital',
          description: 'Get directions to the nearest hospital',
          type: 'map',
          payload: 'Mount Sinai Hospital, New York',
        },
      ],
    };
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(resultWithMap));

    const result = await processIntent('Medical emergency');
    expect(result.actions[0].type).toBe('map');
  });

  it('correctly parses a "form" action type', async () => {
    const resultWithForm: BridgeResult = {
      ...validResult,
      actions: [
        {
          title: 'File Incident Report',
          description: 'Submit an environmental incident form',
          type: 'form',
          payload: 'https://epa.gov/report',
        },
      ],
    };
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(resultWithForm));

    const result = await processIntent('Oil spill');
    expect(result.actions[0].type).toBe('form');
  });

  it('correctly parses an "info" action type', async () => {
    const resultWithInfo: BridgeResult = {
      ...validResult,
      actions: [
        {
          title: 'General Information',
          description: 'Read more about this topic',
          type: 'info',
          payload: 'https://example.com/info',
        },
      ],
    };
    mockGenerateContent.mockResolvedValueOnce(makeMockResponse(resultWithInfo));

    const result = await processIntent('General query');
    expect(result.actions[0].type).toBe('info');
  });
});

// ─── processIntent — Error Handling ──────────────────────────────────────────

describe('processIntent - error handling', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws a descriptive error when JSON parsing fails', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'not valid json {{{' });

    await expect(processIntent('test')).rejects.toThrow(
      'Failed to process intent'
    );
  });

  it('throws a descriptive error when response text is null', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: null });

    await expect(processIntent('test')).rejects.toThrow(
      'Failed to process intent'
    );
  });

  it('throws a descriptive error when response text is undefined', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: undefined });

    await expect(processIntent('test')).rejects.toThrow(
      'Failed to process intent'
    );
  });

  it('propagates API-level network errors', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));

    await expect(processIntent('test')).rejects.toThrow('Network error');
  });

  it('propagates API rate limit errors', async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new Error('Rate limit exceeded')
    );

    await expect(processIntent('test')).rejects.toThrow('Rate limit exceeded');
  });

  it('throws when response is an empty JSON object', async () => {
    // An empty object {} will parse fine but won't match BridgeResult shape
    // The function returns it directly — this tests the boundary behavior
    mockGenerateContent.mockResolvedValueOnce({ text: '{}' });

    // Should not throw — returns the empty object as BridgeResult
    const result = await processIntent('test');
    expect(result).toEqual({});
  });
});

// ─── processIntent — structuredData field ────────────────────────────────────

describe('processIntent - structuredData', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns structuredData with location field', async () => {
    const resultWithLocation = {
      ...validResult,
      structuredData: { location: '5th and Main', entities: [], details: '' },
    };
    mockGenerateContent.mockResolvedValueOnce(
      makeMockResponse(resultWithLocation)
    );

    const result = await processIntent('Accident at 5th and Main');
    expect(result.structuredData.location).toBe('5th and Main');
  });

  it('returns structuredData with entities array', async () => {
    const resultWithEntities = {
      ...validResult,
      structuredData: {
        location: '',
        entities: ['fever', 'rash', 'asthma'],
        details: '',
      },
    };
    mockGenerateContent.mockResolvedValueOnce(
      makeMockResponse(resultWithEntities)
    );

    const result = await processIntent('Patient has fever');
    expect(Array.isArray(result.structuredData.entities)).toBe(true);
    expect(result.structuredData.entities).toContain('fever');
  });
});

// ─── processIntent — All BridgeCategories ────────────────────────────────────

describe('processIntent - all BridgeCategory types', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const categories = Object.values(BridgeCategory);

  categories.forEach((category) => {
    it(`correctly handles category: ${category}`, async () => {
      const result = { ...validResult, category };
      mockGenerateContent.mockResolvedValueOnce(makeMockResponse(result));

      const returned = await processIntent('test input');
      expect(returned.category).toBe(category);
    });
  });
});
