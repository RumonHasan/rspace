import { SONAR_ID } from '@/config';
import { OpenAI } from 'openai';
import { responseCleaner } from '@/features/ai/ai-config';

// perplexity apu object
const perplexity = new OpenAI({
  apiKey: SONAR_ID ?? '',
  baseURL: 'https://api.perplexity.ai',
});

type FormatType = 'markdown';

interface AIPrompt {
  systemPrompt: string;
  followUpPrompt: string;
}

// sonar prompt formatter into markdown
const FORMAT_PROMPTS: Record<FormatType, AIPrompt> = {
  markdown: {
    systemPrompt:
      'You are a text structuring and formatting assistant. Your task is to organize the provided text into a clear, narrative format using markdown syntax. Use appropriate markdown elements to enhance readability and structure.',
    followUpPrompt:
      'Rewrite the above text in a clear, flowing narrative format using markdown. Maintain all original information but present it in a coherent structure. Use the following markdown elements as appropriate:\n\n- Headers (## for main sections, ### for subsections)\n- Bold (**) for emphasis\n- Italic (*) for subtle emphasis\n- Bullet points (-) or numbered lists (1., 2., etc.) for enumerations\n- Blockquotes (>) for notable quotes or excerpts\n- Code blocks (```)',
  },
};

// generate the response
export async function generateSonarResponse(
  prompt: string,
  format: FormatType
) {
  try {
    const promptStructure = FORMAT_PROMPTS[format];
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
