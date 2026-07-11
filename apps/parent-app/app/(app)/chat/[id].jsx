// Chat conversation — pixel-aligned with Figma `598:76508` plus its state
// variants: `598:76666` (typing), `598:76737` (emoji reactions), `598:76817`
// (reply) and `598:76581` (header menu). Long-press a bubble to react or reply;
// sending shows the peer "typing…" before an auto-reply.
import React, { useRef, useState } from 'react';
import {
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
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
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
import { THREAD_BY_ID, teacherAvatar } from '../../../lib/chat-threads';

const C = {
  page: '#FFFFF5',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  green: '#DFEBD1',
  bubbleIn: '#F2F2F2',
  online: '#408406',
  white: '#FEFEFE',
  chip: '#F2F2F2',
};

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const INITIAL = [
  { id: '1', mine: false, text: 'Lorem ipsum dolor sit amet consectetur. Vel viverra vivamus non', time: '10:30 AM' },
  { id: '2', mine: true, text: 'Lorem ipsum dolor sit amet consectetur. Vel viverra vivamus non', time: '10:30 AM', seen: true },
  { id: '3', mine: false, text: 'Lorem ipsum dolor sit amet consectetur. Vel viverra vivamus non', time: '10:30 AM' },
  { id: '4', mine: true, text: 'Lorem ipsum dolor sit amet consectetur. Vel viverra vivamus non', time: '10:30 AM', seen: true },
  { id: '5', mine: false, text: 'Lorem ipsum dolor sit amet consectetur.', time: '10:30 AM' },
];

function clockNow() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function ChatConversationScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const params = useLocalSearchParams();
  const thread = THREAD_BY_ID[String(params.id)] ?? { name: 'Chat', kind: 'person', avatar: teacherAvatar };

  const [messages, setMessages] = useState(INITIAL);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [menuFor, setMenuFor] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef(null);
  const idRef = useRef(100);

  const scrollDown = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  function send() {
    const text = input.trim();
    if (!text) return;
    const msg = { id: String(++idRef.current), mine: true, text, time: clockNow(), seen: false, replyTo: replyingTo };
    setMessages((m) => [...m, msg]);
    setInput('');
    setReplyingTo(null);
    scrollDown();
    // Simulate the peer typing, then replying.
    setOtherTyping(true);
    setTimeout(() => {
      setOtherTyping(false);
      setMessages((m) => [...m, { id: String(++idRef.current), mine: false, text: 'Perfect! See you tomorrow.', time: clockNow() }]);
      scrollDown();
    }, 1600);
  }

  function addReaction(emoji) {
    setMessages((m) => m.map((msg) => (msg.id === menuFor ? { ...msg, reaction: emoji } : msg)));
    setMenuFor(null);
  }

  const menuMessage = messages.find((m) => m.id === menuFor);

  function Avatar({ size = 40 }) {
    if (thread.kind === 'group') {
      return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
          <GroupIcon size={size * 0.6} color={C.ink} />
        </View>
      );
    }
    if (thread.kind === 'initial') {
      return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
          <RNText style={{ fontFamily: fontSemiBold, fontSize: size * 0.5, color: C.ink }}>{thread.initial}</RNText>
        </View>
      );
    }
    return <Image source={thread.avatar ?? teacherAvatar} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  function Bubble({ msg }) {
    const mine = msg.mine;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start', width: '100%' }}>
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
            <View style={{ borderLeftWidth: 2, borderLeftColor: C.brand, paddingLeft: 6, marginBottom: 4 }}>
              <RNText numberOfLines={1} style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>
                {msg.replyTo.text}
              </RNText>
            </View>
          ) : null}
          <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.ink, lineHeight: 21 }}>{msg.text}</RNText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
            <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{msg.time}</RNText>
            {mine ? <DoubleCheckIcon size={16} color={msg.seen ? C.brand : C.gray} /> : null}
          </View>
          {msg.reaction ? (
            <View style={{ position: 'absolute', bottom: -12, right: 8, backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 4, paddingVertical: 1, elevation: 2, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 3 }}>
              <RNText style={{ fontSize: 14 }}>{msg.reaction}</RNText>
            </View>
          ) : null}
        </Pressable>
      </View>
    );
  }

  const hasText = input.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.page }}>
      {/* Header */}
      <View style={{ backgroundColor: C.page, shadowColor: '#2D2D2D', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, zIndex: 2 }}>
        <SafeAreaView edges={['top']}>
          <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
            <Pressable onPress={() => router.back()} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftIcon size={24} color={C.ink} />
            </Pressable>
            <Avatar size={40} />
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink }}>{thread.name}</RNText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.online }} />
                <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.online }}>
                  {otherTyping ? 'typing…' : 'Online'}
                </RNText>
              </View>
            </View>
            <Pressable onPress={() => setMuted((v) => !v)} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: muted ? 1 : 0.6 }}>
              <MuteIcon size={24} color={C.ink} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollDown}
        >
          {/* Date chip */}
          <View style={{ alignSelf: 'center', backgroundColor: C.chip, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}>
            <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray }}>Today</RNText>
          </View>

          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {otherTyping ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Avatar size={40} />
              <View style={{ backgroundColor: C.bubbleIn, paddingHorizontal: 14, paddingVertical: 12, borderTopRightRadius: 15, borderBottomLeftRadius: 15, borderBottomRightRadius: 15 }}>
                <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.gray, letterSpacing: 2 }}>•••</RNText>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Reply preview */}
        {replyingTo ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8 }}>
            <View style={{ flex: 1, borderLeftWidth: 2, borderLeftColor: C.brand, paddingLeft: 8 }}>
              <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.brand }}>Replying to</RNText>
              <RNText numberOfLines={1} style={{ fontFamily: fontRegular, fontSize: 13, color: C.gray }}>{replyingTo.text}</RNText>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
              <RNText style={{ fontFamily: fontMedium, fontSize: 18, color: C.gray }}>✕</RNText>
            </Pressable>
          </View>
        ) : null}

        {/* Input bar */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: C.page }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
            <View style={{ flex: 1, height: 48, backgroundColor: C.bubbleIn, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8 }}>
              <EmojiIcon size={24} color={C.gray} />
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Message"
                placeholderTextColor={C.gray}
                style={{ flex: 1, fontFamily: fontRegular, fontSize: 14, color: C.ink, padding: 0 }}
                multiline
              />
              <AttachIcon size={24} color={C.gray} />
            </View>
            <Pressable
              onPress={send}
              style={{ width: 48, height: 48, borderRadius: 20, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center' }}
            >
              {hasText ? <SendIcon size={24} color={C.white} /> : <MicIcon size={24} color={C.white} />}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Long-press: reactions + reply menu */}
      <Modal visible={!!menuFor} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenuFor(null)}>
        <Pressable onPress={() => setMenuFor(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ gap: 12, alignItems: 'stretch', width: '100%', maxWidth: 320 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.white, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 8 }}>
              {REACTIONS.map((e) => (
                <Pressable key={e} onPress={() => addReaction(e)} hitSlop={6}>
                  <RNText style={{ fontSize: 26 }}>{e}</RNText>
                </Pressable>
              ))}
            </View>
            {menuMessage ? (
              <View style={{ backgroundColor: C.white, borderRadius: 20, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => {
                    setReplyingTo({ id: menuMessage.id, text: menuMessage.text });
                    setMenuFor(null);
                  }}
                  style={{ paddingVertical: 14, paddingHorizontal: 16 }}
                >
                  <RNText style={{ fontFamily: fontMedium, fontSize: 16, color: C.ink }}>Reply</RNText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
