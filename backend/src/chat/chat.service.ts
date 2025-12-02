import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { MessageRepository } from '../database/repositories/message.repository';
import { ConversationRepository } from '../database/repositories/conversation.repository';
import { MessageRole } from '../database/enums/message-role.enum';
import { PROMPTS } from '../constants/prompts';

const LAST_MESSAGES_COUNT = 10;
const SUMMARY_MESSAGES_COUNT = 20;

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
  }

  async getAllConversations() {
    return await this.conversationRepository.findAll();
  }

  async getMessagesByConversationId(conversationId: string) {
    const messages = await this.messageRepository.getLastMessagesByConversation(conversationId, 20);
    return messages.reverse();
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.messageRepository.deleteByConversationId(conversationId);
    await this.conversationRepository.delete(conversationId);
  }

  async sendMessage(message: string, conversationId?: string): Promise<{ message: string; conversationId: string }> {
    let actualConversationId = conversationId;

    if (!actualConversationId) {
      const conversationName = await this.generateConversationName(message);
      const newConversation = await this.conversationRepository.create(conversationName);

      actualConversationId = newConversation.id;
    }

    const conversation = await this.conversationRepository.findById(actualConversationId);

    await this.messageRepository.create(MessageRole.USER, message, actualConversationId);

    const lastMessages = await this.messageRepository.getLastMessagesByConversation(
      actualConversationId,
      LAST_MESSAGES_COUNT,
    );

    const formattedMessages = lastMessages
      .reverse()
      .map((msg) => ({ role: msg.role, content: msg.content }));

    if (conversation.summary) {
      formattedMessages.unshift({
        role: MessageRole.SYSTEM,
        content: PROMPTS.CONVERSATION_SUMMARY_PREFIX + conversation.summary,
      });
    }

    const completion = await this.openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: formattedMessages,
    });

    if (formattedMessages.length % SUMMARY_MESSAGES_COUNT === 0) {
      await this.generateConversationSummary(formattedMessages, actualConversationId);
    }

    const assistantMessage = completion.choices[0].message.content || 'No response';
    await this.messageRepository.create(MessageRole.ASSISTANT, assistantMessage, actualConversationId);

    return { message: assistantMessage, conversationId: actualConversationId };
  }

  private async generateConversationSummary(
    formattedMessages: { role: string; content: string }[],
    conversationId: string,
  ): Promise<void> {
    try {
      const messagesForSummary = [
        {
          role: MessageRole.SYSTEM,
          content: PROMPTS.GENERATE_CONVERSATION_SUMMARY,
        },
        ...formattedMessages,
      ];

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: messagesForSummary as any,
        max_tokens: 300,
        temperature: 0.5,
      });

      const summary = completion.choices[0].message.content?.trim();
      
      if (summary) {
        await this.conversationRepository.updateSummary(conversationId, summary);
      }

    } catch (error) {
      console.error('Error generating conversation summary:', error);
    }
  }

  private async generateConversationName(firstMessage: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
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

      return completion.choices[0].message.content?.trim() || 'New Conversation';
    } catch (error) {
      console.error('Error generating conversation name:', error);
      return 'New Conversation';
    }
  }
}
