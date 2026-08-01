// Incident Detail — full report for one incident with an Acknowledge action.
// No dedicated Figma frame; styled to match the app.
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftIcon } from '@nms/ui';
import { AlertTriangle } from 'lucide-react-native';
import { useParentIncident, useAcknowledgeIncident } from '@nms/data';

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
  white: '#FEFEFE',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export default function IncidentDetailScreen() {
  const { i18n } = useTranslation(['common']);
  const isAr = i18n.language === 'ar';
  const fontRegular = isAr ? 'Amiri' : 'Lora';
  const fontMedium = isAr ? 'Amiri' : 'Lora-Medium';
  const fontSemiBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';
  const fontBold = isAr ? 'Amiri-Bold' : 'Lora-Bold';

  const params = useLocalSearchParams();
  const id = params.id ? String(params.id) : null;
  const { data: incident, isLoading } = useParentIncident(id);
  const acknowledge = useAcknowledgeIncident();

  function Field({ label, value }) {
    if (!value) return null;
    return (
      <View style={{ gap: 6 }}>
        <RNText style={{ fontFamily: fontMedium, fontSize: 12, color: C.gray }}>{label}</RNText>
        <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.ink, lineHeight: 21 }}>{value}</RNText>
      </View>
    );
  }

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
          <RNText style={{ fontFamily: fontBold, fontSize: 20, color: C.ink }}>Incident Detail</RNText>
        </View>

        {/* White sheet */}
        <View style={{ flex: 1, backgroundColor: C.sheet, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' }}>
          {!incident ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {isLoading ? (
                <ActivityIndicator color={C.brand} />
              ) : (
                <RNText style={{ fontFamily: fontRegular, fontSize: 14, color: C.gray }}>Incident not found.</RNText>
              )}
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Summary card */}
              <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: C.stroke, alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} color={C.accent} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <RNText style={{ fontFamily: fontBold, fontSize: 18, color: C.ink }}>{incident.incidentType || 'Incident'}</RNText>
                  <RNText style={{ fontFamily: fontRegular, fontSize: 12, color: C.gray }}>{fmtDate(incident.incidentAt)}</RNText>
                </View>
              </View>

              <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 12, gap: 16 }}>
                <Field label="What happened" value={incident.description} />
                <Field label="Action taken" value={incident.actionTaken} />
                <Field label="Injury area" value={incident.injuryArea} />
                <Field label="Reported by" value={incident.authorName} />
              </View>

              {incident.acknowledged ? (
                <View style={{ backgroundColor: C.green, borderRadius: 20, padding: 12, alignItems: 'center' }}>
                  <RNText style={{ fontFamily: fontSemiBold, fontSize: 14, color: C.brandDark, textAlign: 'center' }}>
                    You acknowledged this report{incident.acknowledgedAt ? ` on ${fmtDate(incident.acknowledgedAt)}` : ''}.
                  </RNText>
                </View>
              ) : (
                <Pressable
                  onPress={acknowledge.isPending ? undefined : () => acknowledge.mutate(id)}
                  style={{
                    height: 48,
                    borderRadius: 20,
                    backgroundColor: C.brand,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: acknowledge.isPending ? 0.6 : 1,
                  }}
                >
                  <RNText style={{ fontFamily: fontBold, fontSize: 16, color: C.white }}>
                    {acknowledge.isPending ? 'Acknowledging…' : 'Acknowledge'}
                  </RNText>
                </Pressable>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
