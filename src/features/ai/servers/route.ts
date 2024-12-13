import { getMember } from '@/features/members/utils';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { openai, responseCleaner } from '../ai-config';

// Define types for better type safety and documentation
type FormatType = 'bulleted' | 'narrative' | 'technical';

interface AIPrompt {
  systemPrompt: string;
  followUpPrompt: string;
}

interface AIResponse {
  type: FormatType;
  content: string;
}

// Separate prompt configurations for better maintainability
const FORMAT_PROMPTS: Record<FormatType, AIPrompt> = {
  bulleted: {
    systemPrompt:
      'You are a text structuring assistant. Your task is to organize the provided text into a clear, bullet-pointed format. Break down the information into concise, scannable bullet points while maintaining all key information.',
    followUpPrompt:
      'Convert the above text into a well-organized bullet point format. Each point should be clear and concise.',
  },
  narrative: {
    systemPrompt:
      'You are a text structuring assistant. Your task is to organize the provided text into a clear, narrative paragraph format. Maintain a flowing, coherent structure while preserving all key information.',
    followUpPrompt:
      'Rewrite the above text in a clear, flowing narrative format. Maintain all original information but present it in a coherent paragraph structure.',
  },
  technical: {
    systemPrompt:
      'You are a technical documentation assistant. Your task is to organize the provided text into a structured technical format with clear sections, prerequisites, and implementation details.',
    followUpPrompt:
      'Structure the above text in a technical documentation format with clear sections and implementation details.',
  },
};

// Separate function for generating AI responses
async function generateAIResponse(
  description: string,
  format: FormatType
): Promise<string> {
  const prompts = FORMAT_PROMPTS[format];

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: prompts.systemPrompt,
      },
      {
        role: 'user',
        content: description,
      },
      {
        role: 'system',
        content: prompts.followUpPrompt,
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 100,
    presence_penalty: 0.1,
  });

  return (
    completion.choices[0].message.content ??
    `Unable to generate ${format} format`
  );
}

const app = new Hono().post(
  '/ai-response',
  sessionMiddleware,
  zValidator(
    'json',
    z.object({
      workspaceId: z.string(),
      description: z.string(),
      formats: z
        .array(z.enum(['bulleted', 'narrative', 'technical']))
        .default(['bulleted', 'narrative']),
    })
  ),
  async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');

    const { description, workspaceId, formats } = c.req.valid('json');

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Generate all requested formats concurrently
    const responses: AIResponse[] = await Promise.all(
      // passes on the formats and gets the specified responses
      formats.map(async (format) => ({
        type: format,
        content: responseCleaner(await generateAIResponse(description, format)),
      }))
    );
    // returns the atleast two responses based on passed on formats as query
    return c.json({
      data: {
        documents: [
          {
            responses,
            originalDescription: description,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  }
);

export default app;
