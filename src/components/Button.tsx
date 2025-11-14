// This file is a direct copy from your original project
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  loading = false,
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style, isDisabled && styles.disabled]}
      disabled={isDisabled}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: '#9CA3AF',
  },
});