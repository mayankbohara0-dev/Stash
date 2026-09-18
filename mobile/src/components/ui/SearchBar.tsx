import React from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  placeholder = 'Search transactions',
}) => {
  return (
    <View style={styles.container}>
      {/* Leading search icon */}
      <Ionicons
        name="search-outline"
        size={18}
        color={Colors.textMuted}
        style={styles.searchIcon}
      />

      {/* Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        returnKeyType="search"
        accessibilityLabel="Search transactions"
        selectionColor={Colors.text}
      />

      {/* Trailing circular filter button */}
      <TouchableOpacity
        style={styles.filterBtn}
        onPress={onFilterPress}
        activeOpacity={0.75}
        accessibilityLabel="Filter transactions"
      >
        <Ionicons name="options-outline" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 20,
    backgroundColor: Colors.bgInset,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.base,
    paddingRight: 8,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.text,
    height: '100%',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
