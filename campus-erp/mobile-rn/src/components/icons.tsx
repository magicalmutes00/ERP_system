import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Grid3x3,
  LucideIcon,
} from 'lucide-react-native';

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  students: Users,
  faculty: GraduationCap,
  courses: BookOpen,
  more: Grid3x3,
};

export function TabIcon({name, color, size = 22, focused}: {name: string; color: string; size?: number; focused?: boolean}) {
  const Cmp = iconMap[name] ?? Home;
  return (
    <View style={styles.wrap}>
      <Cmp size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
});
