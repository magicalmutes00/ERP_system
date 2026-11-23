import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {useAppSelector} from '../store';
import {colors} from '../theme/colors';
import {RootStackParamList, MainTabParamList} from './types';
import {SplashScreen} from '../screens/SplashScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {DashboardScreen} from '../screens/DashboardScreen';
import {StudentsScreen} from '../screens/StudentsScreen';
import {FacultyScreen} from '../screens/FacultyScreen';
import {CoursesScreen} from '../screens/CoursesScreen';
import {MoreScreen} from '../screens/MoreScreen';
import {AttendanceScreen} from '../screens/AttendanceScreen';
import {ExamsScreen} from '../screens/ExamsScreen';
import {AssignmentsScreen} from '../screens/AssignmentsScreen';
import {FeesScreen} from '../screens/FeesScreen';
import {NotificationsScreen} from '../screens/NotificationsScreen';
import {ChatScreen} from '../screens/ChatScreen';
import {AIScreen} from '../screens/AIScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {TabIcon} from '../components/icons';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({color, size, focused}) => {
          const key = route.name.toLowerCase();
          return <TabIcon name={key} color={color} size={size} focused={focused} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Faculty" component={FacultyScreen} />
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const {isAuthenticated} = useAppSelector(s => s.auth);
  const {isInitialized} = useAppSelector(s => s.init);

  if (!isInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="Exams" component={ExamsScreen} />
            <Stack.Screen name="Assignments" component={AssignmentsScreen} />
            <Stack.Screen name="Fees" component={FeesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="AI" component={AIScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
