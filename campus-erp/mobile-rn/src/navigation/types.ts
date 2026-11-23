import {NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Faculty: undefined;
  Courses: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Attendance: undefined;
  Exams: undefined;
  Assignments: undefined;
  Fees: undefined;
  Notifications: undefined;
  Chat: undefined;
  AI: undefined;
  Settings: undefined;
};
