// Parent chat hooks.
//
// The chat list is a *directory* the backend derives from who this parent is
// related to right now: the nursery office, and — for the selected child — that
// child's room group and the teachers who actually teach it. Rows without a
// `threadId` are contacts nobody has messaged yet.
//
// Because the list is derived per child, the query is keyed by child. Switching
// child is a different key, so React Query refetches on its own rather than the
// screen having to remember to invalidate — which is the mechanism behind
// "switching child must refresh the chat list".

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';
import { qk } from '../query/keys';

function useChatApi() {
  const api = useApi();
  const chat = api?.parent?.chat;
  if (!chat) {
    throw new Error('Parent chat client is not available on this API adapter.');
  }
  return chat;
}

export function useChatDirectory(childId) {
  const chat = useChatApi();
  return useQuery({
    queryKey: qk.parent.chatDirectory(childId),
    queryFn: () => chat.directory(childId),
    // Unread counts and previews go stale the moment anyone sends anything, and
    // the socket cannot be relied on over a phone connection.
    staleTime: 15_000,
  });
}

export function useChatMessages(threadId) {
  const chat = useChatApi();
  return useQuery({
    queryKey: qk.parent.chatMessages(threadId),
    queryFn: () => chat.messages(threadId, { limit: 50 }),
    enabled: !!threadId,
  });
}

export function useMutedUsers() {
  const chat = useChatApi();
  return useQuery({
    queryKey: qk.parent.chatMutes(),
    queryFn: () => chat.mutedUserIds(),
  });
}

export function useSendChatMessage(threadId) {
  const chat = useChatApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => chat.send(threadId, input),
    // The conversation screen keeps its own optimistic copy, so this only has to
    // make sure the *list* reflects the new last message.
    onSuccess: () => qc.invalidateQueries({ queryKey: ['parent', 'chat', 'directory'] }),
  });
}

export function useToggleReaction() {
  const chat = useChatApi();
  return useMutation({
    mutationFn: ({ messageId, emoji, remove }) =>
      remove ? chat.removeReaction(messageId, emoji) : chat.addReaction(messageId, emoji),
  });
}

/** Hide a message for me only. Everyone else's copy is untouched. */
export function useHideMessage() {
  const chat = useChatApi();
  return useMutation({ mutationFn: (messageId) => chat.hideForMe(messageId) });
}

/** Remove a message for everyone. The backend allows this to the sender only. */
export function useDeleteMessage() {
  const chat = useChatApi();
  return useMutation({ mutationFn: (messageId) => chat.deleteForEveryone(messageId) });
}

/**
 * Mute a person's notifications. Their messages still appear in the thread —
 * this stops the interruption, it does not silence the speaker.
 */
export function useToggleUserMute() {
  const chat = useChatApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, muted }) =>
      muted ? chat.unmuteUser(userId) : chat.muteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.parent.chatMutes() }),
  });
}

export function useUploadChatMedia() {
  const chat = useChatApi();
  return useMutation({
    mutationFn: ({ files, durationMs }) => chat.uploadMedia(files, { durationMs }),
  });
}
