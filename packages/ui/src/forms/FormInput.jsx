import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../primitives/Input';

export function FormInput({ name, control, label, placeholder, ...rest }) {
  const { t } = useTranslation('validation');
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
        const message = error?.message
          ? error.message.startsWith('validation:')
            ? t(error.message.slice('validation:'.length))
            : error.message
          : undefined;
        return (
          <Input
            label={label}
            placeholder={placeholder}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={message}
            {...rest}
          />
        );
      }}
    />
  );
}
