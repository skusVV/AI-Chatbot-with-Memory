import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { MessageRepository } from '../database/repositories/message.repository';
import { MessageRole } from '../database/enums/message-role.enum';

const LAST_MESSAGES_COUNT = 10;

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(private readonly messageRepository: MessageRepository) {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
  }

  async sendMessage(message: string): Promise<string> {
    await this.messageRepository.create(MessageRole.USER, message);

    const lastMessages = await this.messageRepository.getLastMessages(LAST_MESSAGES_COUNT);
    const formattedMessages = lastMessages
      .reverse()
      .map((msg) => ({ role: msg.role, content: msg.content }));

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages as any,
    });

    const assistantMessage = completion.choices[0].message.content || 'No response';
    await this.messageRepository.create(MessageRole.ASSISTANT, assistantMessage);

    return assistantMessage;
  }
}
