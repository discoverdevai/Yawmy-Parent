// Chat conversation — pixel-aligned with Figma `598:76508` plus its state
// variants: `598:76737` (emoji reactions), `598:76817` (reply) and `598:76581`
// (header menu), now backed by real messages.
//
// Sending goes over REST, which persists the message and then broadcasts it; the
// socket only ever receives. So a message cannot reach anyone without having
// been saved, and there is one write path rather than two to keep correct. When
// the socket is down the screen polls forward from the newest message it holds.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  Text as RNText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  useAudioRecorder,
  useAudioPlayer,
  useAudioPlayerStatus,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import {
  ArrowLeftIcon,
  MuteIcon,
  DoubleCheckIcon,
  EmojiIcon,
  AttachIcon,
  MicIcon,
  SendIcon,
  GroupIcon,
} from '@nms/ui';
import {
  useApi,
  useAuth,
  useAuthFileHeaders,
  useChatSocketConfig,
  useMutedUsers,
  connectChatSocket,
} from '@nms/data';
import { openAttachment } from '../../../lib/attachment-opener';
import MediaViewerModal from '../../../components/MediaViewerModal';
import EmojiPickerModal from '../../../components/EmojiPickerModal';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  green: '#DFEBD1',
  bubbleIn: '#F2F2F2',
  white: '#FEFEFE',
  chip: '#F2F2F2',
  divider: '#F2F2F2',
  danger: '#B5503C',
};

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// How often to ask for new messages while the socket is down. Only runs when
// disconnected — with a live socket this never fires.
const POLL_INTERVAL_MS = 4000;

// Speeds worth offering. Faster than 2× stops being intelligible.
const SPEEDS = [1, 1.5, 2];

function clockNow() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** "1.4 MB" / "312 KB" — a document's size, at the precision anyone reads it. */
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** What a reply quote should say when the message being replied to has no text. */
function replyLabel(msg) {
  if (msg.type === 'voice') return '🎤 Voice message';
  if (msg.type === 'image') return '📷 Photo';
  if (msg.type === 'video') return '🎬 Video';
  if (msg.type === 'document') return msg.attachments?.[0]?.filename || '📄 Document';
  return '';
}

function dayLabel(date) {
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const today = startOf(new Date());
  const day = startOf(date);
  if (day === today) return 'Today';
  if (day === today - 86400000) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * What expo-audio should load for a given uri.
 *
 * Every /api/files/** path requires authentication, and the audio loader does
 * not go through the REST client — a bare string uri gets a 403 and the bubble
 * sits there refusing to play, with nothing to say why. A local recording
 * (file://) is played back before it has been uploaded and must NOT carry the
 * header, since it never reaches the server at all.
 */
function audioSourceFor(uri, headers) {
  if (!uri) return null;
  if (!/^https?:/i.test(uri)) return uri;
  return { uri, headers };
}

/**
 * The same problem for images. A local file:// preview — the photo shown while
 * it is still uploading — must not carry the header either.
 */
function imageSourceFor(uri, headers) {
  if (!uri) return null;
  return /^https?:/i.test(uri) ? { uri, headers } : { uri };
}

/** A voice note: play/pause, progress, remaining time, and a speed toggle. */
function VoiceBubble({ uri, duration, fontRegular, authHeaders }) {
  const player = useAudioPlayer(audioSourceFor(uri, authHeaders));
  const status = useAudioPlayerStatus(player);
  const playing = status?.playing;
  const total = status?.duration || duration || 0;
  const progress = total ? Math.min(1, (status?.currentTime || 0) / total) : 0;
  const [speedIndex, setSpeedIndex] = useState(0);
  const speed = SPEEDS[speedIndex];

  const toggle = () => {
    if (playing) {
      player.pause();
    } else {
      if (status?.didJustFinish || (total && status?.currentTime >= total)) player.seekTo(0);
      player.play();
    }
  };

  // Pitch correction is on, so a sped-up voice still sounds like the person who
  // recorded it — which matters when it is a teacher talking about your child.
  const cycleSpeed = () => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    try {
      player.setPlaybackRate(SPEEDS[next], 'high');
    } catch {
      try {
        player.setPlaybackRate(SPEEDS[next]);
      } catch {
        /* the platform cannot change rate — leave playback as it is */
      }
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 210 }}>
      <Pressable
        onPress={toggle}
        hitSlop={6}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: C.brand,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RNText style={{ color: C.white, fontSize: 13 }}>{playing ? '❚❚' : '▶'}</RNText>
      </Pressable>
      <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: '#00000018' }}>
        <View
          style={{
            width: `${progress * 100}%`,
            height: 3,
            borderRadius: 2,
            backgroundColor: C.brand,
          }}
        />
      </View>
      <RNText
        style={{
          fontFamily: fontRegular,
          fontSize: 12,
          color: C.gray,
          minWidth: 34,
          textAlign: 'right',
        }}
      >
        {fmtDuration(status?.currentTime ? total - status.currentTime : total)}
      </RNText>
      <Pressable
        onPress={cycleSpeed}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Playback speed ${speed} times, tap to change`}
        style={{
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: speed === 1 ? '#00000018' : C.brand,
          backgroundColor: speed === 1 ? 'transparent' : C.brand,
        }}
      >
        <RNText
          style={{ fontFamily: fontRegular, fontSize: 11, color: speed === 1 ? C.gray : C.white }}
        >
          {speed}x
        </RNText>
      </Pressable>
    </View>
  );
}

export default function ChatConversationScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const params = useLocalSearchParams();
  const api = useApi();
  const chat = api?.parent?.chat;
  const { user } = useAuth();
  const myUserId = user?.id ?? null;
  const authHeaders = useAuthFileHeaders();
  const socketConfig = useChatSocketConfig();
  const { data: mutedUsers = [], refetch: refetchMutes } = useMutedUsers();

  // The list hands over a directory row, not a thread: a contact nobody has
  // messaged has no thread until the first message creates one.
  const entry = useMemo(
    () => ({
      kind: String(params.kind || 'ADMIN_SUPPORT'),
      peerUserId: params.peerUserId ? String(params.peerUserId) : null,
      roomId: params.roomId ? String(params.roomId) : null,
      threadId: params.id && params.id !== 'new' ? String(params.id) : null,
    }),
    [params.kind, params.peerUserId, params.roomId, params.id],
  );
  const chatName = String(params.name || 'Chat');
  const subtitle = String(params.subtitle || '');
  const avatarUrl = params.avatarUrl ? String(params.avatarUrl) : '';
  const isGroup = entry.kind === 'ROOM_GROUP' || entry.kind === 'STAFF_GROUP';

  const [threadId, setThreadId] = useState(entry.threadId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [muted, setMuted] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  // The photo or video opened full-screen, if any.
  const [viewing, setViewing] = useState(null);
  // The quick row remembers a picked emoji, so a reaction used once is one tap
  // away the next time.
  const [quickEmojis, setQuickEmojis] = useState(REACTIONS);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const tempSeq = useRef(0);
  const timerRef = useRef(null);
  // The newest server timestamp we hold, so the poll asks for what it lacks
  // rather than refetching a page and diffing it.
  const latestAtRef = useRef(null);
  // The oldest, for paging backwards through history.
  const oldestAtRef = useRef(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [reachedStart, setReachedStart] = useState(false);
  const contentHeightRef = useRef(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const scrollDown = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  /**
   * Fetch the page before the oldest message on screen.
   *
   * The scroll position has to be preserved by hand. Prepending rows moves
   * everything below them down by exactly the height the new rows added, so the
   * conversation would jump away from whatever was being read. We note the
   * content height before, and after layout scroll down by the difference —
   * which leaves the same message under the reader's thumb.
   */
  const loadOlder = useCallback(async () => {
    if (!chat || !threadId || loadingOlder || reachedStart || !oldestAtRef.current) return;
    setLoadingOlder(true);
    const heightBefore = contentHeightRef.current;
    try {
      const rows = await chat.messages(threadId, { before: oldestAtRef.current, limit: 50 });
      if (rows.length === 0) {
        setReachedStart(true);
        return;
      }
      const older = rows.map((dto) => chat.normalizeMessage(dto, myUserId));
      oldestAtRef.current = older[0]?.createdAt ?? oldestAtRef.current;
      // A short page means the thread has no more history behind it.
      if (rows.length < 50) setReachedStart(true);

      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const fresh = older.filter((m) => !known.has(m.id));
        return fresh.length ? [...fresh, ...prev] : prev;
      });

      requestAnimationFrame(() => {
        const grew = contentHeightRef.current - heightBefore;
        if (grew > 0) scrollRef.current?.scrollTo({ y: grew, animated: false });
      });
    } catch {
      /* a failed page is not worth an alert — scrolling up again retries */
    } finally {
      setLoadingOlder(false);
    }
  }, [chat, threadId, loadingOlder, reachedStart, myUserId]);

  /**
   * Fold incoming messages into the list.
   *
   * Two things arrive out of order: the socket echo of a message we just sent,
   * and the REST response for that same send. Both carry the real id, so an id
   * match is the first defence; replacing our optimistic copy is the second.
   */
  const mergeMessages = useCallback((incoming) => {
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      let changed = false;
      incoming.forEach((msg) => {
        if (byId.has(msg.id)) return;
        byId.set(msg.id, msg);
        changed = true;
      });
      if (!changed) return prev;
      const merged = [...byId.values()].sort(
        (a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date),
      );
      const newest = merged[merged.length - 1];
      if (newest?.createdAt) latestAtRef.current = newest.createdAt;
      return merged;
    });
  }, []);

  // ---- open the thread, load history, subscribe ----
  useEffect(() => {
    if (!chat) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const id = entry.threadId || (await chat.ensureThread(entry));
        if (cancelled) return;
        if (!id) throw new Error('This conversation is not available.');
        setThreadId(id);

        const history = await chat.messages(id, { limit: 50 });
        if (cancelled) return;
        const normalized = history.map((dto) => chat.normalizeMessage(dto, myUserId));
        setMessages(normalized);
        const newest = normalized[normalized.length - 1];
        latestAtRef.current = newest?.createdAt ?? null;
        oldestAtRef.current = normalized[0]?.createdAt ?? null;
        // A first page shorter than the limit is the whole conversation.
        setReachedStart(normalized.length < 50);

        // Opening a conversation is reading it.
        if (newest) chat.markRead(id, newest.id).catch(() => {});

        const detail = await chat.thread(id).catch(() => null);
        if (!cancelled && detail) setMuted(!!detail.muted);

        socketRef.current = connectChatSocket({
          ...socketConfig,
          onThreadMessage: (dto) => mergeMessages([chat.normalizeMessage(dto, myUserId)]),
          onConnectionChange: setConnected,
        });
        socketRef.current.subscribeToThread(id);

        setLoadError(null);
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Could not open this conversation.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [chat, entry, myUserId, socketConfig, mergeMessages]);

  // ---- polling fallback ----
  useEffect(() => {
    if (!chat || !threadId || connected || loading || loadError) return undefined;
    const timer = setInterval(async () => {
      try {
        const rows = await chat.messages(threadId, {
          after: latestAtRef.current ?? undefined,
          limit: 50,
        });
        if (rows.length) mergeMessages(rows.map((dto) => chat.normalizeMessage(dto, myUserId)));
      } catch {
        /* a failed poll is not worth surfacing; the next may work */
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [chat, threadId, connected, loading, loadError, myUserId, mergeMessages]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  /**
   * Put a message on screen before the server has it, and reconcile once it
   * answers. Chat that waits for a round-trip before showing your own words
   * feels broken on a slow connection — and this backend cold-starts.
   */
  const withOptimistic = async (draft, submit) => {
    const tempId = `tmp_${++tempSeq.current}`;
    const optimistic = {
      id: tempId,
      mine: true,
      senderId: myUserId,
      senderName: user?.fullName ?? 'You',
      attachments: [],
      reactions: {},
      replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text } : null,
      date: new Date(),
      time: clockNow(),
      createdAt: new Date().toISOString(),
      pending: true,
      failed: false,
      ...draft,
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollDown();

    try {
      const saved = await submit();
      const real = chat.normalizeMessage(saved, myUserId);
      setMessages((prev) => {
        // The socket may have delivered the same message first; if so, drop the
        // placeholder rather than show it twice.
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === real.id)) return withoutTemp;
        return [...withoutTemp, real].sort(
          (a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date),
        );
      });
      if (real.createdAt) latestAtRef.current = real.createdAt;
      chat.markRead(threadId, real.id).catch(() => {});
    } catch (e) {
      // Left in place and marked, not removed — it disappearing would lose what
      // the parent wrote without telling them.
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)),
      );
      Alert.alert('Message not sent', e.message);
    }
  };

  function send() {
    const text = input.trim();
    if (!text || !threadId) return;
    const replyToMessageId = replyingTo?.id ?? null;
    setInput('');
    setReplyingTo(null);
    withOptimistic({ type: 'text', text }, () =>
      chat.send(threadId, { body: text, replyToMessageId }),
    );
  }

  /**
   * Attachments are two calls: upload the bytes, then send a message that
   * references the ids. The optimistic bubble shows the local file throughout,
   * so a photo is visible while it is still uploading.
   */
  const sendAttachment = async (file, uiType, { durationMs } = {}) => {
    if (!threadId) return;
    const replyToMessageId = replyingTo?.id ?? null;
    setReplyingTo(null);
    await withOptimistic(
      {
        type: uiType,
        text: '',
        uri: file.uri,
        duration: durationMs ? Math.round(durationMs / 1000) : null,
        attachments: [
          {
            id: 'pending',
            type: uiType === 'voice' ? 'AUDIO' : uiType === 'video' ? 'VIDEO' : 'PHOTO',
            uri: file.uri,
            filename: file.name ?? null,
            sizeBytes: 0,
            durationMs: durationMs ?? null,
          },
        ],
      },
      async () => {
        const result = await chat.uploadMedia([file], { durationMs });
        const ids = (result?.uploaded ?? []).map((m) => m.id);
        if (ids.length === 0) {
          throw new Error(result?.failed?.[0]?.reason || 'the file could not be uploaded');
        }
        return chat.send(threadId, { attachmentMediaIds: ids, replyToMessageId });
      },
    );
  };

  const takePhoto = async () => {
    // The OS pickers can reject outright — no camera, a denied intent, a
    // provider that fails. Unhandled, that rejection kills the handler with
    // only a console warning and the attachment silently never appears.
    try {
      setShowAttach(false);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Camera access is required to take a photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled) {
        const asset = result.assets[0];
        await sendAttachment({ uri: asset.uri, mimeType: asset.mimeType }, 'image');
      }
    } catch (e) {
      Alert.alert('Could not attach', String(e?.message || e));
    }
  };

  const pickFromGallery = async () => {
    // The OS pickers can reject outright — no camera, a denied intent, a
    // provider that fails. Unhandled, that rejection kills the handler with
    // only a console warning and the attachment silently never appears.
    try {
      setShowAttach(false);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Photo library access is required to attach media.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      await sendAttachment(
        { uri: asset.uri, mimeType: asset.mimeType, name: asset.fileName },
        asset.type === 'video' ? 'video' : 'image',
      );
    } catch (e) {
      Alert.alert('Could not attach', String(e?.message || e));
    }
  };

  const pickDocument = async () => {
    // The OS pickers can reject outright — no camera, a denied intent, a
    // provider that fails. Unhandled, that rejection kills the handler with
    // only a console warning and the attachment silently never appears.
    try {
      setShowAttach(false);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      await sendAttachment(
        { uri: asset.uri, name: asset.name, mimeType: asset.mimeType },
        'document',
      );
    } catch (e) {
      Alert.alert('Could not attach', String(e?.message || e));
    }
  };

  // ---- voice recording ----
  const startRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Microphone access is required to record voice messages.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setElapsed(0);
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (e) {
      Alert.alert('Recording failed', String(e?.message || e));
    }
  };

  const stopRecording = async (shouldSend) => {
    clearInterval(timerRef.current);
    const dur = elapsed;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      /* already stopped */
    }
    const uri = recorder.uri;
    setRecording(false);
    setElapsed(0);
    if (shouldSend && uri && dur >= 1) {
      await sendAttachment(
        { uri, name: `voice-${Date.now()}.m4a`, mimeType: 'audio/m4a' },
        'voice',
        { durationMs: dur * 1000 },
      );
    }
  };

  // ---- message actions ----
  const menuMessage = messages.find((m) => m.id === menuFor) || null;

  /** Reacting is a toggle: tapping the emoji already given takes it back. */
  const applyReaction = async (emoji) => {
    const target = menuMessage;
    setMenuFor(null);
    if (!target) return;
    const alreadyMine = (target.reactions?.[emoji] || []).includes(myUserId);
    try {
      const updated = alreadyMine
        ? await chat.removeReaction(target.id, emoji)
        : await chat.addReaction(target.id, emoji);
      const next = updated ? chat.normalizeMessage(updated, myUserId) : null;
      setMessages((prev) =>
        prev.map((m) => (m.id === target.id ? { ...m, reactions: next?.reactions ?? {} } : m)),
      );
    } catch (e) {
      Alert.alert('Could not react', e.message);
    }
  };

  /** Hide for me — private, and leaves everyone else's copy alone. */
  const hideForMe = async () => {
    const target = menuMessage;
    setMenuFor(null);
    if (!target) return;
    try {
      await chat.hideForMe(target.id);
      setMessages((prev) => prev.filter((m) => m.id !== target.id));
    } catch (e) {
      Alert.alert('Could not remove', e.message);
    }
  };

  /** Remove for everyone — only offered on the parent's own messages. */
  const deleteForEveryone = () => {
    const target = menuMessage;
    setMenuFor(null);
    if (!target) return;
    Alert.alert('Delete message', 'This removes it for everyone in the chat.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await chat.deleteForEveryone(target.id);
            setMessages((prev) => prev.filter((m) => m.id !== target.id));
          } catch (e) {
            Alert.alert('Could not delete', e.message);
          }
        },
      },
    ]);
  };

  /**
   * Mute the sender. Notifications only — their messages stay in the thread, so
   * the wording avoids implying they have been silenced or blocked.
   */
  const toggleMuteSender = async () => {
    const target = menuMessage;
    setMenuFor(null);
    if (!target?.senderId) return;
    const currentlyMuted = mutedUsers.includes(target.senderId);
    try {
      if (currentlyMuted) await chat.unmuteUser(target.senderId);
      else await chat.muteUser(target.senderId);
      refetchMutes();
      if (!currentlyMuted) {
        Alert.alert(
          'Notifications muted',
          `You will not be notified about ${target.senderName || 'this person'}. Their messages still appear here.`,
        );
      }
    } catch (e) {
      Alert.alert('Could not update', e.message);
    }
  };

  const toggleThreadMute = async () => {
    const next = !muted;
    setMuted(next);
    try {
      await chat.setThreadMuted(threadId, next);
    } catch (e) {
      setMuted(!next);
      Alert.alert('Could not update', e.message);
    }
  };

  // Downloads with the bearer token, then hands the local copy to the OS.
  // Linking.openURL cannot work here: /api/files/** needs authentication and the
  // browser has no session.
  const openDocument = async (attachment) => {
    const result = await openAttachment(attachment, authHeaders);
    if (!result.ok) Alert.alert('Could not open file', result.reason);
  };

  // Group under day separators.
  const groups = [];
  messages.forEach((m) => {
    const key = dayLabel(new Date(m.date || Date.now()));
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(m);
    else groups.push({ key, items: [m] });
  });

  function Avatar({ size = 40 }) {
    if (isGroup) {
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: C.green,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GroupIcon size={size * 0.6} color={C.ink} />
        </View>
      );
    }
    if (avatarUrl) {
      return (
        <Image
          source={imageSourceFor(avatarUrl, authHeaders)}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      );
    }
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: C.green,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RNText style={{ fontFamily: fontSemiBold, fontSize: size * 0.42, color: C.ink }}>
          {chatName.trim().charAt(0).toUpperCase()}
        </RNText>
      </View>
    );
  }

  function Bubble({ msg }) {
    const mine = msg.mine;
    const reactionEntries = Object.entries(msg.reactions || {}).filter(([, u]) => u?.length);

    // Swipe right to reply, the gesture every messaging app has trained people
    // to expect. The long-press menu still offers Reply for anyone who does not
    // know the gesture — this is a shortcut, not the only way in.
    const translateX = useRef(new Animated.Value(0)).current;
    const replied = useRef(false);

    const onGestureEvent = (e) => {
      const x = Math.max(0, Math.min(70, e.nativeEvent.translationX));
      translateX.setValue(x);
      if (x > 55 && !replied.current) {
        replied.current = true;
        setReplyingTo({ id: msg.id, text: msg.text || replyLabel(msg) });
      }
    };

    const onStateChange = (e) => {
      const { state } = e.nativeEvent;
      if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        replied.current = false;
      }
    };

    const body = (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
          justifyContent: mine ? 'flex-end' : 'flex-start',
          width: '100%',
        }}
      >
        {!mine ? <Avatar size={40} /> : null}
        <Pressable
          onLongPress={() => setMenuFor(msg.id)}
          delayLongPress={250}
          style={{
            maxWidth: mine ? 312 : 295,
            backgroundColor: mine ? C.green : C.bubbleIn,
            padding: 8,
            borderTopLeftRadius: mine ? 15 : 0,
            borderTopRightRadius: mine ? 0 : 15,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
        >
          {msg.replyTo ? (
            <View
              style={{
                borderLeftWidth: 2,
                borderLeftColor: C.brand,
                paddingLeft: 6,
                marginBottom: 4,
              }}
            >
              <RNText
                numberOfLines={1}
                style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}
              >
                {msg.replyTo.text}
              </RNText>
            </View>
          ) : null}

          {/* In a group, whose message this is matters as much as what it says. */}
          {isGroup && !mine && msg.senderName ? (
            <RNText
              style={{ fontFamily: fontSemiBold, fontSize: 12, color: C.brand, marginBottom: 2 }}
            >
              {msg.senderName}
            </RNText>
          ) : null}

          {msg.type === 'voice' ? (
            <VoiceBubble
              uri={msg.uri}
              duration={msg.duration}
              fontRegular={fontRegular}
              authHeaders={authHeaders}
            />
          ) : msg.type === 'image' ? (
            // A thumbnail is enough to know a photo arrived, not enough to see it.
            <Pressable onPress={() => setViewing(msg.attachments[0])}>
              <Image
                source={imageSourceFor(msg.uri, authHeaders)}
                style={{ width: 220, height: 160, borderRadius: 10 }}
              />
            </Pressable>
          ) : msg.type === 'video' ? (
            // The badge promises playback, so it has to open a real player.
            <Pressable onPress={() => setViewing(msg.attachments[0])}>
              <Image
                source={imageSourceFor(msg.uri, authHeaders)}
                style={{ width: 220, height: 160, borderRadius: 10 }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#00000066',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RNText style={{ color: C.white, fontSize: 18 }}>▶</RNText>
                </View>
              </View>
            </Pressable>
          ) : msg.type === 'document' ? (
            <Pressable
              onPress={() => openDocument(msg.attachments[0])}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 200 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: C.page,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RNText style={{ fontFamily: fontSemiBold, fontSize: 10, color: C.brand }}>
                  {(msg.attachments[0]?.filename || '')
                    .split('.')
                    .pop()
                    ?.slice(0, 4)
                    .toUpperCase() || 'FILE'}
                </RNText>
              </View>
              <View style={{ flex: 1 }}>
                <RNText
                  numberOfLines={1}
                  style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}
                >
                  {msg.attachments[0]?.filename || 'Attachment'}
                </RNText>
                <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>
                  {fmtSize(msg.attachments[0]?.sizeBytes)}
                </RNText>
              </View>
            </Pressable>
          ) : null}

          {/* A caption sent alongside an attachment is still text worth showing. */}
          {msg.text && msg.type !== 'text' ? (
            <RNText
              style={{
                fontFamily: fontMedium,
                fontSize: 14,
                color: C.ink,
                lineHeight: 21,
                marginTop: 4,
              }}
            >
              {msg.text}
            </RNText>
          ) : null}
          {msg.type === 'text' ? (
            <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink, lineHeight: 21 }}>
              {msg.text}
            </RNText>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>
              {msg.time}
            </RNText>
            {mine ? (
              msg.failed ? (
                <RNText style={{ fontFamily: fontMedium, fontSize: 11, color: C.danger }}>
                  Failed
                </RNText>
              ) : (
                <DoubleCheckIcon size={16} color={msg.pending ? '#00000030' : C.brand} />
              )
            ) : null}
          </View>

          {/* Aggregated across everyone, so a room group reads "👍 3" rather
              than only the last person's choice. */}
          {reactionEntries.length ? (
            <View
              style={{
                position: 'absolute',
                bottom: -12,
                right: 8,
                flexDirection: 'row',
                gap: 4,
                backgroundColor: C.white,
                borderRadius: 12,
                paddingHorizontal: 6,
                paddingVertical: 1,
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 3,
              }}
            >
              {reactionEntries.map(([emoji, users]) => (
                <View key={emoji} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <RNText style={{ fontSize: 14 }}>{emoji}</RNText>
                  {users.length > 1 ? (
                    <RNText style={{ fontFamily: fontMedium, fontSize: 11, color: C.gray }}>
                      {users.length}
                    </RNText>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
        </Pressable>
      </View>
    );

    return (
      <View>
        {/* Slides in from under the bubble as it is dragged. */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 8,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            opacity: translateX.interpolate({ inputRange: [0, 55], outputRange: [0, 1] }),
          }}
        >
          <RNText style={{ fontSize: 18, color: C.gray }}>↩</RNText>
        </Animated.View>
        <PanGestureHandler
          activeOffsetX={[-1000, 12]}
          failOffsetY={[-12, 12]}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onStateChange}
        >
          <Animated.View style={{ transform: [{ translateX }] }}>{body}</Animated.View>
        </PanGestureHandler>
      </View>
    );
  }

  const hasText = input.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: C.page,
          shadowColor: '#2D2D2D',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          zIndex: 2,
        }}
      >
        <SafeAreaView edges={['top']}>
          <View
            style={{ height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
            >
              <ArrowLeftIcon size={24} color={C.ink} />
            </Pressable>
            <Avatar size={40} />
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>
                {chatName}
              </RNText>
              {/* The backend has no presence, so a green "Online" dot would be
                  decoration that is wrong most of the time. The directory's own
                  subtitle is true and more useful. */}
              <RNText
                numberOfLines={1}
                style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray }}
              >
                {subtitle || (isGroup ? 'Group chat' : 'Direct message')}
              </RNText>
            </View>
            <Pressable
              onPress={toggleThreadMute}
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: muted ? 1 : 0.6,
              }}
              accessibilityLabel={muted ? 'Unmute this conversation' : 'Mute this conversation'}
            >
              <MuteIcon size={24} color={C.ink} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {!connected && !loading && !loadError ? (
        <View style={{ paddingVertical: 6, alignItems: 'center', backgroundColor: C.chip }}>
          <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>
            Reconnecting… checking for new messages
          </RNText>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(w, h) => {
            contentHeightRef.current = h;
            // Only stick to the bottom while nothing older is being prepended —
            // otherwise loading history would yank the view back to the newest
            // message, the opposite of what scrolling up asked for.
            if (!loadingOlder) scrollDown();
          }}
          onScroll={(e) => {
            if (e.nativeEvent.contentOffset.y <= 24) loadOlder();
          }}
          scrollEventThrottle={64}
        >
          {/* Reaching the top pulls in the previous page. */}
          {loadingOlder ? (
            <View style={{ paddingVertical: 8, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={C.brand} />
            </View>
          ) : null}

          {loading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={C.brand} />
            </View>
          ) : loadError ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <RNText
                style={{
                  fontFamily: fontMedium,
                  fontSize: 14,
                  color: C.danger,
                  textAlign: 'center',
                }}
              >
                {loadError}
              </RNText>
            </View>
          ) : messages.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <RNText
                style={{
                  fontFamily: fontRegular,
                  fontSize: 14,
                  color: C.gray,
                  textAlign: 'center',
                }}
              >
                No messages yet. Say hello to {chatName}.
              </RNText>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.key} style={{ gap: 12 }}>
                <View
                  style={{
                    alignSelf: 'center',
                    backgroundColor: C.chip,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }}
                >
                  <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray }}>
                    {group.key}
                  </RNText>
                </View>
                {group.items.map((msg) => (
                  <Bubble key={msg.id} msg={msg} />
                ))}
              </View>
            ))
          )}
        </ScrollView>

        {/* Reply preview */}
        {replyingTo ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 16,
              paddingTop: 8,
            }}
          >
            <View style={{ flex: 1, borderLeftWidth: 2, borderLeftColor: C.brand, paddingLeft: 8 }}>
              <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.brand }}>
                Replying to
              </RNText>
              <RNText
                numberOfLines={1}
                style={{ fontFamily: fontRegular, fontSize: 13, color: C.gray }}
              >
                {replyingTo.text}
              </RNText>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
              <RNText style={{ fontFamily: fontMedium, fontSize: 18, color: C.gray }}>✕</RNText>
            </Pressable>
          </View>
        ) : null}

        {/* Input bar */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: C.page }}>
          {recording ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
              <Pressable
                onPress={() => stopRecording(false)}
                hitSlop={6}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 20,
                  backgroundColor: C.chip,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RNText style={{ fontSize: 18, color: C.danger }}>✕</RNText>
              </Pressable>
              <View
                style={{
                  flex: 1,
                  height: 48,
                  backgroundColor: C.chip,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <View
                  style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.danger }}
                />
                <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink }}>
                  {fmtDuration(elapsed)}
                </RNText>
                <RNText style={{ fontFamily: fontRegular, fontSize: 13, color: C.gray }}>
                  Recording…
                </RNText>
              </View>
              <Pressable
                onPress={() => stopRecording(true)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 20,
                  backgroundColor: C.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SendIcon size={24} color={C.white} />
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
              <View
                style={{
                  flex: 1,
                  minHeight: 48,
                  backgroundColor: C.bubbleIn,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                  gap: 8,
                }}
              >
                <EmojiIcon size={24} color={C.gray} />
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Message"
                  placeholderTextColor={C.gray}
                  style={{
                    flex: 1,
                    fontFamily: fontRegular,
                    fontSize: 14,
                    color: C.ink,
                    padding: 0,
                  }}
                  multiline
                />
                <Pressable onPress={() => setShowAttach((s) => !s)} hitSlop={6}>
                  <AttachIcon size={24} color={C.gray} />
                </Pressable>
              </View>
              <Pressable
                onPress={hasText ? send : startRecording}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 20,
                  backgroundColor: C.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {hasText ? (
                  <SendIcon size={24} color={C.white} />
                ) : (
                  <MicIcon size={24} color={C.white} />
                )}
              </Pressable>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Attachment menu */}
      {showAttach ? (
        <>
          <Pressable
            onPress={() => setShowAttach(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View
            style={{
              position: 'absolute',
              right: 16,
              bottom: 100,
              backgroundColor: C.white,
              borderRadius: 16,
              paddingVertical: 8,
              minWidth: 200,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            {[
              { label: 'Camera', onPress: takePhoto },
              { label: 'Photos & Videos', onPress: pickFromGallery },
              { label: 'Document', onPress: pickDocument },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={{ paddingVertical: 12, paddingHorizontal: 16 }}
              >
                <RNText style={{ fontFamily: fontMedium, fontSize: 15, color: C.ink }}>
                  {item.label}
                </RNText>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <EmojiPickerModal
        visible={showEmojiPicker}
        fontFamily={fontMedium}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={(emoji) => {
          setQuickEmojis((list) => (list.includes(emoji) ? list : [...list, emoji]));
          setShowEmojiPicker(false);
          applyReaction(emoji);
        }}
      />

      <MediaViewerModal
        visible={!!viewing}
        attachment={viewing}
        authHeaders={authHeaders}
        onClose={() => setViewing(null)}
      />

      {/* Long-press: reactions + message actions */}
      <Modal
        visible={!!menuFor}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuFor(null)}
      >
        <Pressable
          onPress={() => setMenuFor(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View style={{ gap: 12, alignItems: 'stretch', width: '100%', maxWidth: 320 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: C.white,
                borderRadius: 24,
                paddingVertical: 10,
                paddingHorizontal: 8,
              }}
            >
              {quickEmojis.map((e) => (
                <Pressable key={e} onPress={() => applyReaction(e)} hitSlop={6}>
                  <RNText style={{ fontSize: 26 }}>{e}</RNText>
                </Pressable>
              ))}
              <Pressable onPress={() => setShowEmojiPicker(true)} hitSlop={6}>
                <RNText style={{ fontSize: 24, color: C.gray }}>+</RNText>
              </Pressable>
            </View>

            {menuMessage ? (
              <View style={{ backgroundColor: C.white, borderRadius: 20, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => {
                    setReplyingTo({ id: menuMessage.id, text: menuMessage.text || 'Attachment' });
                    setMenuFor(null);
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: C.divider,
                  }}
                >
                  <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
                    Reply
                  </RNText>
                </Pressable>

                <Pressable
                  onPress={hideForMe}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: C.divider,
                  }}
                >
                  <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
                    Delete for me
                  </RNText>
                </Pressable>

                {/* Removing a message for everyone is the sender's call alone;
                    muting yourself would be an odd thing to offer. */}
                {menuMessage.mine ? (
                  <Pressable
                    onPress={deleteForEveryone}
                    style={{ paddingVertical: 14, paddingHorizontal: 16 }}
                  >
                    <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.danger }}>
                      Delete for everyone
                    </RNText>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={toggleMuteSender}
                    style={{ paddingVertical: 14, paddingHorizontal: 16 }}
                  >
                    <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>
                      {mutedUsers.includes(menuMessage.senderId)
                        ? `Unmute ${menuMessage.senderName || 'this person'}`
                        : `Mute ${menuMessage.senderName || 'this person'}`}
                    </RNText>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
