// Incident Reports — parent list of a child's incidents. No dedicated Figma
// frame; styled to match the app (green header over a white sheet, cream cards).
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { AlertTriangle } from 'lucide-react-native';
import { useChildIncidents } from '@nms/data';
import { useActiveChild } from '../../../lib/active-child';

const C = {
  green: '#DFEBD1',
  sheet: '#FFFFF5',
  card: '#F8FAEE',
  ink: '#333333',
  gray: '#535353',
  brand: '#76945C',
  brandDark: '#334722',
  accent: '#E2725B',
  stroke: '#F5F5DC',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtIncidentDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export default function IncidentsScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const { activeChildId: childId } = useActiveChild();
  const { data: incidents, isLoading } = useChildIncidents(childId);
  const list = incidents ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.green }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeftIcon size={24} color={C.ink} />
          </Pressable>
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Incident Reports</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={C.brand} />
            </View>
          ) : list.length > 0 ? (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {list.map((it) => (
                <Pressable
                  key={it.id}
                  onPress={() => router.push(`/(app)/incidents/${it.id}`)}
                  style={{ backgroundColor: C.card, borderRadius: 20, padding: 12, gap: 8, flexDirection: 'row' }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: C.stroke, alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={22} color={C.accent} strokeWidth={1.75} />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, flex: 1 }} numberOfLines={1}>
                        {it.incidentType || 'Incident'}
                      </RNText>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 10,
                          backgroundColor: it.acknowledged ? C.green : 'rgba(226,114,91,0.15)',
                        }}
                      >
                        <RNText style={{ fontFamily: fontMedium, fontSize: 10, color: it.acknowledged ? C.brandDark : C.accent }}>
                          {it.acknowledged ? 'Acknowledged' : 'New'}
                        </RNText>
                      </View>
                    </View>
                    <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray, lineHeight: 18 }} numberOfLines={2}>
                      {it.description}
                    </RNText>
                    <RNText style={{ fontFamily: fontMedium, fontSize: 11, color: C.brandDark }}>
                      {fmtIncidentDate(it.incidentAt)}
                    </RNText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Image
                source={require('../../../assets/illustrations/announcement-empty.png')}
                style={{ width: 280, height: 280 }}
                resizeMode="contain"
              />
              <RNText style={{ fontFamily: fontSemiBold, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 8 }}>
                No incidents reported.
              </RNText>
              <RNText style={{ fontFamily: fontMedium, fontSize: 14, color: C.gray, textAlign: 'center', marginTop: 12 }}>
                You’ll see any incident reports for your child here.
              </RNText>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
