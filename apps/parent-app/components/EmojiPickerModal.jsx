import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text as RNText, View } from 'react-native';

/**
 * A fuller set of reactions than the six on the quick row.
 *
 * Grouped rather than one long grid: scanning a hundred faces for the right one
 * is slower than jumping to the category you meant. Kept deliberately small —
 * this is a nursery chat, not a keyboard.
 */
const GROUPS = [
  {
    label: 'Smileys',
    emojis: ['😀', '😄', '😊', '🙂', '😉', '😍', '🥰', '😘', '😂', '🤣', '😅', '😇', '🤗', '🤔', '😴', '😢', '😭', '😮', '😯', '😳'],
  },
  {
    label: 'Gestures',
    emojis: ['👍', '👎', '👌', '👏', '🙌', '🤝', '🙏', '💪', '✌️', '🤞', '👋', '🫶'],
  },
  {
    label: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '💖', '💕', '💗'],
  },
  {
    label: 'Nursery',
    emojis: ['🌟', '⭐', '🎉', '🎈', '🎂', '🍎', '🥪', '🧃', '😴', '🚼', '🧸', '🖍️', '📚', '⚽', '🎨', '🌈'],
  },
];

export default function EmojiPickerModal({ visible, onClose, onSelect, fontFamily }) {
  const [group, setGroup] = useState(0);
  const active = GROUPS[group];

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ backgroundColor: '#FEFEFE', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, maxHeight: '60%' }}
        >
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#00000022' }} />
          </View>

          <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 8, paddingBottom: 8 }}>
            {GROUPS.map((g, i) => (
              <Pressable
                key={g.label}
                onPress={() => setGroup(i)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: i === group ? '#DFEBD1' : 'transparent',
                }}
              >
                <RNText style={{ fontFamily, fontSize: 13, color: '#333333' }}>{g.label}</RNText>
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 4 }}>
            {active.emojis.map((e) => (
              <Pressable
                key={e}
                onPress={() => onSelect(e)}
                style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}
              >
                <RNText style={{ fontSize: 28 }}>{e}</RNText>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
