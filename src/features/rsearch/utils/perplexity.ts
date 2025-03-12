import { SONAR_ID } from '@/config';
import { OpenAI } from 'openai';
import { responseCleaner } from '@/features/ai/ai-config';

// perplexity apu object
const perplexity = new OpenAI({
  apiKey: SONAR_ID ?? '',
  baseURL: 'https://api.perplexity.ai',
});

type FormatType = 'narrative';

interface AIPrompt {
  systemPrompt: string;
  followUpPrompt: string;
}

// sonar prompt formatter
const FORMAT_PROMPTS: Record<FormatType, AIPrompt> = {
  narrative: {
    systemPrompt:
      'You are a text structuring assistant. Your task is to organize the provided text into a clear, narrative paragraph format. Maintain a flowing, coherent structure while preserving all key information.',
    followUpPrompt:
      'Rewrite the above text in a clear, flowing narrative format. Maintain all original information but present it in a coherent paragraph structure.',
  },
};

// generate the response
export async function generateSonarResponse(
  prompt: string,
  format: FormatType
) {
  try {
    const promptStructure = FORMAT_PROMPTS[format];
    console.log(prompt);
    const sonarCompletionResponses = await perplexity.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: promptStructure.systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'sonar',
    });
    return responseCleaner(
      sonarCompletionResponses.choices[0].message.content ?? ''
    );
  } catch (error) {
    console.log(error);
  }
}
