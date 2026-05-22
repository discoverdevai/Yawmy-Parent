// Curved bottom-nav with the centre-FAB chat squircle. Pixel-aligned with
// the Figma `nav bar` instance (frame `606:38231`). The four labelled items
// hug the edges; the FAB sits in the notch carved out of the SVG bg.
import React from 'react';
import { Dimensions, Image, Pressable, Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import {
  HomeIcon,
  ProfileCircleIcon,
  MessagesIcon,
  NavBackground,
  FabSquircle,
} from '@nms/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;

const C = {
  page: '#FFFFF5',
  cardSec: '#FCFCEC',
  brand: '#76945C',
  muted: '#535353',
  fefe: '#FEFEFE',
};

// Routes the nav knows how to navigate to. Any key without an entry no-ops
// (defensive for the unbuilt tabs — Daily Log gets wired here as soon as
// the route file lands).
const ROUTES = {
  home: '/(app)',
  log: '/(app)/daily-log',
  news: '/(app)/news',
  profile: '/(app)/profile',
  fab: '/(app)/chat',
};

const ITEMS_LEFT = [
  { key: 'home', label: 'Home', kind: 'svg', Icon: HomeIcon },
  {
    key: 'log',
    label: 'Daily Log',
    kind: 'png',
    source: require('../assets/icons/daily-log.png'),
  },
];
const ITEMS_RIGHT = [
  {
    key: 'news',
    label: 'News',
    kind: 'png',
    source: require('../assets/icons/news.png'),
  },
  { key: 'profile', label: 'Profile', kind: 'svg', Icon: ProfileCircleIcon },
];

function NavItem({ item, isActive, onPress, fontMedium }) {
  const color = isActive ? C.brand : C.muted;
  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 8 }}>
      {item.kind === 'svg' ? (
        <item.Icon size={24} color={color} />
      ) : (
        <Image
          source={item.source}
          style={{ width: 24, height: 24, tintColor: color }}
          resizeMode="contain"
        />
      )}
      <RNText
        style={{ fontFamily: fontMedium, fontSize: 14, color }}
        numberOfLines={1}
      >
        {item.label}
      </RNText>
    </Pressable>
  );
}

export function BottomNav({ active = 'home', onTap }) {
  const { i18n } = useTranslation();
  const fontMedium = i18n.language === 'ar' ? 'Amiri' : 'Lora-Medium';

  const handleTap = (key) => {
    if (onTap) {
      onTap(key);
      return;
    }
    const target = ROUTES[key];
    if (target) router.push(target);
  };

  const fabSize = 56;
  const fabLeft = SCREEN_WIDTH / 2 - fabSize / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 89,
        pointerEvents: 'box-none',
      }}
    >
      {/* Curved background — sits at the bottom 70px of the 89-tall frame */}
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 19, height: 70 }}
      >
        <NavBackground width={SCREEN_WIDTH} height={70} color={C.cardSec} />
      </View>

      {/* FAB — sticks up out of the notch */}
      <Pressable
        onPress={() => handleTap('fab')}
        style={{
          position: 'absolute',
          left: fabLeft,
          top: 0,
          width: fabSize,
          height: fabSize,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        }}
      >
        <FabSquircle size={fabSize} color={C.brand} />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <MessagesIcon size={26} color={C.fefe} />
        </View>
      </Pressable>

      {/* 4 nav items — 2 left + 2 right of the FAB */}
      <View
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          top: 31,
          bottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'box-none',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40 }}>
          {ITEMS_LEFT.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              isActive={item.key === active}
              onPress={() => handleTap(item.key)}
              fontMedium={fontMedium}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 40 }}>
          {ITEMS_RIGHT.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              isActive={item.key === active}
              onPress={() => handleTap(item.key)}
              fontMedium={fontMedium}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
