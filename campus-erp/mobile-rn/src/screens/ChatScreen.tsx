import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '../theme';
import {Send} from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const seedMessages: Message[] = [
  {id: '1', text: 'Hi! How can I help you today?', sender: 'other', time: '10:00'},
  {id: '2', text: 'I have a question about my attendance', sender: 'me', time: '10:01'},
  {id: '3', text: 'Of course! What would you like to know?', sender: 'other', time: '10:02'},
];

export function ChatScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>(seedMessages);

  const send = () => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    };
    setMessages(m => [...m, newMsg]);
    setText('');
    setTimeout(() => {
      setMessages(m => [
        ...m,
        {
          id: String(Date.now() + 1),
          text: 'Thanks for your message! I will get back to you shortly.',
          sender: 'other',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        },
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Support</Text>
          <Text style={styles.headerSub}>Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View
            style={[
              styles.bubble,
              item.sender === 'me' ? styles.bubbleMe : styles.bubbleOther,
            ]}>
            <Text
              style={[
                styles.bubbleText,
                item.sender === 'me' && {color: '#FFFFFF'},
              ]}>
              {item.text}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {color: '#FFFFFF', fontWeight: fontWeight.bold},
  headerTitle: {fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text},
  headerSub: {fontSize: fontSize.xs, color: colors.success},
  list: {padding: spacing.lg, gap: spacing.sm},
  bubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {fontSize: fontSize.sm, color: colors.text, lineHeight: 20},
  time: {fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end'},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
