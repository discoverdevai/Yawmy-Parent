import { newId } from './db';
import { assertTenantScope, assertResourceInScope } from '../clients/tenant-scope';
import { NotFoundError } from '../errors';

export function createChatMock(db, runtime) {
  return {
    async listThreads(scope) {
      assertTenantScope(scope);
      const userId = runtime.activeUserId ?? db.demoAdminId;
      return db.threads.filter(
        (t) => t.nurseryId === scope.nurseryId && t.participantIds.includes(userId),
      );
    },
    async listMessages(scope, threadId, _params = {}) {
      assertTenantScope(scope);
      const t = db.threads.find((x) => x.id === threadId);
      if (!t) throw new NotFoundError('Thread not found');
      assertResourceInScope(scope, t);
      const items = db.messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
      return { items, nextCursor: null };
    },
    async send(scope, threadId, body) {
      assertTenantScope(scope);
      const t = db.threads.find((x) => x.id === threadId);
      if (!t) throw new NotFoundError('Thread not found');
      assertResourceInScope(scope, t);
      const msg = {
        id: newId('msg'),
        threadId,
        authorId: runtime.activeUserId ?? db.demoAdminId,
        body,
        attachments: [],
        reactions: [],
        replyToId: null,
        removedByModerator: false,
        sentAt: new Date().toISOString(),
        readBy: [],
      };
      db.messages.push(msg);
      t.lastMessageAt = msg.sentAt;
      return msg;
    },
    async removeMessage(scope, _threadId, messageId) {
      assertTenantScope(scope);
      const m = db.messages.find((x) => x.id === messageId);
      if (m) m.removedByModerator = true;
    },
    async muteUser(_scope, _threadId, _userId) {
      // No-op in mock
    },
    async broadcast(scope, _input) {
      assertTenantScope(scope);
      // No-op in mock
    },
  };
}
