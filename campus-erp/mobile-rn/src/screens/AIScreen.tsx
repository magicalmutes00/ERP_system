import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {aiApi} from '../api';
import {
  appleTheme,
  appleSpacing,
  appleRadius,
  appleTypography,
  appleShadow,
} from '../theme/apple';
import {AppleNavBar} from '../components/AppleNavBar';
import {AppleCard} from '../components/AppleCard';
import {AppleButton} from '../components/AppleButton';
import {Brain, Sparkles} from 'lucide-react-native';

interface ChatMsg {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export function AIScreen() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: '0',
      role: 'ai',
      text: "Hi! I'm your AI campus assistant. Ask me about attendance, performance, or anything else!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const ask = async () => {
    if (!prompt.trim()) return;
    const userMsg: ChatMsg = {id: String(Date.now()), role: 'user', text: prompt};
    setMessages(m => [...m, userMsg]);
    const q = prompt;
    setPrompt('');
    setLoading(true);
    try {
      const res = await aiApi.chat({message: q});
      const answer =
        res?.data?.answer ??
        res?.data?.data?.answer ??
        res?.data?.message ??
        'I could not generate a response.';
      setMessages(m => [
        ...m,
        {id: String(Date.now() + 1), role: 'ai', text: String(answer)},
      ]);
    } catch (e: any) {
      setMessages(m => [
        ...m,
        {id: String(Date.now() + 1), role: 'ai', text: `Error: ${e?.message ?? 'unknown'}`},
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}>
      <AppleNavBar title="AI Assistant" />
      
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled">
        {messages.map(m => (
          <View key={m.id} style={[styles.bubbleContainer, m.role === 'user' && styles.userContainer]}>
            {m.role === 'ai' && (
              <View style={styles.aiIconWrap}>
                <Sparkles size={14} color={appleTheme.colors.systemPurple} />
              </View>
            )}
            <View style={[styles.bubble, m.role === 'user' && styles.userBubble]}>
              <Text style={[styles.text, m.role === 'user' && {color: '#FFFFFF'}]}>{m.text}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubbleContainer, styles.userContainer]}>
            <View style={[styles.bubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={appleTheme.colors.systemBlue} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything…"
          placeholderTextColor={appleTheme.colors.tertiaryLabel}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && {opacity: 0.6}]}
          onPress={ask}
          disabled={loading}>
          <Brain size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
  },
  list: {
    padding: appleTheme.spacing.page,
    gap: appleTheme.spacing.md,
    paddingBottom: appleTheme.spacing.lg,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appleTheme.spacing.sm,
  },
  userContainer: {
    flexDirection: 'row-reverse',
  },
  aiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '85%',
    padding: appleTheme.spacing.md,
    borderRadius: appleTheme.radius.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appleTheme.spacing.sm,
  },
  userBubble: {
    backgroundColor: appleTheme.colors.systemBlue,
    borderBottomRightRadius: 4,
    ...appleTheme.shadow.sm,
  },
  text: {
    flex: 1,
    color: appleTheme.colors.label,
    fontSize: appleTheme.typography.body.fontSize,
    lineHeight: appleTheme.typography.body.lineHeight,
    letterSpacing: appleTheme.typography.body.letterSpacing,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: appleTheme.spacing.md,
    backgroundColor: appleTheme.colors.secondarySystemBackground,
    borderTopWidth: 1 / 3,
    borderTopColor: appleTheme.colors.separator,
    gap: appleTheme.spacing.sm,
    ...appleTheme.shadow.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: appleTheme.colors.separator,
    borderRadius: appleTheme.radius.full,
    paddingHorizontal: appleTheme.spacing.lg,
    paddingVertical: appleTheme.spacing.sm,
    color: appleTheme.colors.label,
    backgroundColor: appleTheme.colors.systemBackground,
    fontSize: appleTheme.typography.body.fontSize,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appleTheme.colors.systemBlue,
    alignItems: 'center',
    justifyContent: 'center',
    ...appleTheme.shadow.md,
  },
  loadingBubble: {
    backgroundColor: appleTheme.colors.systemBackground,
  },
});
