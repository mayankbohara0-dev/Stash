import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { api } from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { AIMessage } from '../../types';

const SUGGESTED_QUESTIONS = [
  "Where did most of my money go this month?",
  "What's my monthly savings rate?",
  "How much did I spend on dining out?",
  "What subscriptions am I currently paying for?",
  "How can I cut down my unnecessary expenses?",
  "Can I afford an upcoming ₹5,000 purchase?",
];

export const AIScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response: any = await api.post(API_ENDPOINTS.aiChat, {
        message: trimmed,
        conversation_id: conversationId,
      });
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
      };
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble retrieving your financial records right now. Please try again shortly.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isLoading, conversationId]);

  const renderFormattedText = (text: string, isUser: boolean) => {
    // Basic markdown bold parser (**bold**) and bullet cleaner
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isBullet ? line.trim().replace(/^[\*\-]\s+/, '') : line;
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

      return (
        <View key={lineIdx} style={[styles.textLine, isBullet && styles.bulletLine]}>
          {isBullet && <Text style={[styles.bulletDot, isUser && styles.userMessageText]}>• </Text>}
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIdx} style={[styles.boldText, isUser && styles.userMessageText]}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return part;
            })}
          </Text>
        </View>
      );
    });
  };

  const renderMessage = useCallback(({ item }: { item: AIMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color={Colors.text} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {renderFormattedText(item.content, isUser)}
        </View>
      </View>
    );
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.iconRing}>
        <View style={styles.aiIconLarge}>
          <Ionicons name="sparkles" size={32} color={Colors.text} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>Stash AI</Text>
      <Text style={styles.emptySubtitle}>Private Financial Intelligence</Text>

      <View style={styles.disclaimer}>
        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.income} />
        <Text style={styles.disclaimerText}>
          Trained on your real spending, budgets, and savings history.
        </Text>
      </View>

      <View style={styles.suggestionsHeader}>
        <Text style={styles.suggestionsLabel}>SUGGESTED PROMPTS</Text>
      </View>

      <View style={styles.suggestions}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <TouchableOpacity key={i} style={styles.suggestion} onPress={() => sendMessage(q)} activeOpacity={0.75}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.suggestionText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Stash AI</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={messages.length === 0 ? styles.emptyContent : styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingBubble}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={14} color={Colors.text} />
            </View>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={Colors.text} />
              <Text style={styles.analyzingText}>Analyzing your transactions...</Text>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your finances..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
              onSubmitEditing={() => sendMessage(input)}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={!input.trim() || isLoading ? Colors.textMuted : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.income,
  },
  statusText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },

  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  emptyContent: {
    flexGrow: 1,
  },

  emptyState: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  aiIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  disclaimerText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  suggestionsHeader: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  suggestionsLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  suggestions: {
    width: '100%',
    gap: Spacing.sm,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.text,
    lineHeight: 20,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: Radius.xl,
    padding: Spacing.md,
  },
  aiBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.surface,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderAlt,
  },
  messageText: {
    fontSize: Typography.base,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text,
  },
  textLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 2,
  },
  bulletLine: {
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  boldText: {
    fontWeight: '700',
    color: Colors.text,
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyzingText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },

  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingLeft: Spacing.base,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.text,
    maxHeight: 90,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.silverTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceHigh,
  },
});
