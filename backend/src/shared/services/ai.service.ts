import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { MessageRole } from '../../database/enums/message-role.enum';
import { PROMPTS } from '../constants/prompts';

export interface ChatMessage {
  role: string;
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
  }

  async completion(messages: ChatMessage[]): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
    });

    return response.choices[0].message.content || 'No response';
  }

  async generateConversationName(firstMessage: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: MessageRole.SYSTEM,
            content: PROMPTS.GENERATE_CONVERSATION_NAME,
          },
          {
            role: MessageRole.USER,
            content: firstMessage,
          },
        ],
        max_tokens: 20,
        temperature: 0.7,
      });

      return response.choices[0].message.content?.trim() || 'New Conversation';
    } catch (error) {
      console.error('Error generating conversation name:', error);
      return 'New Conversation';
    }
  }

  async generateSummary(messages: ChatMessage[]): Promise<string | null> {
    try {
      const messagesForSummary = [
        {
          role: MessageRole.SYSTEM,
          content: PROMPTS.GENERATE_CONVERSATION_SUMMARY,
        },
        ...messages,
      ];

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: messagesForSummary as any,
        max_tokens: 300,
        temperature: 0.5,
      });

      return response.choices[0].message.content?.trim() || null;
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      return null;
    }
  }
}

