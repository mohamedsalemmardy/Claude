import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Colors } from '../../utils/colors';
import { useApp } from '../../store/AppContext';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  editable?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  editable = true,
}) => {
  const { state } = useApp();
  const isRTL = state.isRTL;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isRTL && styles.labelRTL]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isRTL && styles.inputRTL,
          multiline && styles.multiline,
          error && styles.inputError,
          !editable && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.disabled}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        textAlign={isRTL ? 'right' : 'left'}
      />
      {error && <Text style={[styles.error, isRTL && styles.errorRTL]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  labelRTL: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputRTL: {
    textAlign: 'right',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.background,
    color: Colors.textSecondary,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
  errorRTL: {
    textAlign: 'right',
  },
});
