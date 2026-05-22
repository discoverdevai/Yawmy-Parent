import React from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, Text, Card, Button } from '@nms/ui';
import { useAuth } from '@nms/data';
import { changeLocale } from '@nms/i18n/bootstrap';

export default function AdminHome() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <Text variant="heading" className="mb-1">
        {t('admin:welcome', { name: user?.name ?? '' })}
      </Text>
      <Text tone="muted" className="mb-6">
        {t('admin:subtitle')}
      </Text>

      <Card className="mb-4">
        <Text variant="title" className="mb-2">
          {t('common:tabs.dashboard')}
        </Text>
        <Text tone="muted">{t('common:states.empty')}</Text>
      </Card>

      <Button
        variant="secondary"
        block
        onPress={async () => {
          const next = i18n.language === 'ar' ? 'en' : 'ar';
          await changeLocale(next);
        }}
        className="mb-3"
      >
        {t('common:switchLanguage')}
      </Button>

      <Button variant="ghost" block onPress={signOut}>
        {t('common:account.signOut')}
      </Button>
    </Screen>
  );
}
