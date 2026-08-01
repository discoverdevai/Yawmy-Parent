// Photo View — pixel-aligned with Figma `598:77458`. A single full-bleed photo
// with a floating back button. The `day`/`index` params select which photo
// from the gallery to show.
import React from 'react';
import { Pressable, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { AuthImage } from '../../../../components/AuthImage';

const C = {
  bg: '#000000',
  backBg: '#FCFCEC',
  stroke: '#F5F5DC',
  ink: '#333333',
};

export default function PhotoViewScreen() {
  const params = useLocalSearchParams();
  const uri = params.uri ? String(params.uri) : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      {uri ? (
        <AuthImage uri={uri} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} resizeMode="cover" />
      ) : null}

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            marginLeft: 16,
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: C.backBg,
            borderWidth: 1,
            borderColor: C.stroke,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeftIcon size={24} color={C.ink} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
