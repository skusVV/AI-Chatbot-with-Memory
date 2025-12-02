import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../database/repositories/message.repository';
import { ConversationRepository } from '../database/repositories/conversation.repository';
import { MessageRole } from '../database/enums/message-role.enum';
import { PROMPTS } from '../shared/constants/prompts';
import { AiService } from '../shared/services/ai.service';

const LAST_MESSAGES_COUNT = 10;
const SUMMARY_MESSAGES_COUNT = 20;

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly aiService: AiService,
  ) {}

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
      const conversationName = await this.aiService.generateConversationName(message);
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

    const assistantMessage = await this.aiService.completion(formattedMessages);

    if (formattedMessages.length % SUMMARY_MESSAGES_COUNT === 0) {
      await this.generateConversationSummary(formattedMessages, actualConversationId);
    }

    await this.messageRepository.create(MessageRole.ASSISTANT, assistantMessage, actualConversationId);

    return { message: assistantMessage, conversationId: actualConversationId };
  }

  private async generateConversationSummary(
    formattedMessages: { role: string; content: string }[],
    conversationId: string,
  ): Promise<void> {
    const summary = await this.aiService.generateSummary(formattedMessages);

    if (summary) {
      await this.conversationRepository.updateSummary(conversationId, summary);
    }
  }
}
