import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../constants/theme';
import { ChatScreen } from '../screens/main/ChatScreen';
import { HealthScreen } from '../screens/main/HealthScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ScheduleScreen } from '../screens/main/ScheduleScreen';
import type { MainTabParamList } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: {
  name: keyof MainTabParamList;
  icon: IconName;
  activeIcon: IconName;
  label: string;
  component: React.ComponentType<any>;
}[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Trang chủ', component: HomeScreen },
  { name: 'AIChat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', label: 'AI Chat', component: ChatScreen },
  { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', label: 'Lịch', component: ScheduleScreen },
  { name: 'Health', icon: 'heart-outline', activeIcon: 'heart', label: 'Sức khỏe', component: HealthScreen },
  { name: 'Profile', icon: 'person-circle-outline', activeIcon: 'person-circle', label: 'Cá nhân', component: ProfileScreen },
];

function HeaderTitle() {
  return (
    <View style={styles.headerTitle}>
      <Image source={require('../../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
      <View>
        <Text style={styles.headerEyebrow}>Trường Đại học Sao Đỏ</Text>
        <Text style={styles.headerText}>Trợ lí ảo AI của bạn</Text>
      </View>
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((item) => item.name === route.name) || TABS[0];
        return {
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={22}
                color={focused ? Colors.primary : Colors.textMuted}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]} numberOfLines={1}>
              {tab.label}
            </Text>
          ),
          tabBarStyle: {
            height: 72 + insets.bottom,
            paddingTop: Spacing.sm,
            paddingBottom: Math.max(insets.bottom, Spacing.sm),
            paddingHorizontal: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            backgroundColor: Colors.surface,
            ...Shadow.card,
          },
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerShadowVisible: false,
          headerTitle: () => <HeaderTitle />,
          headerTitleAlign: 'left',
          sceneStyle: { backgroundColor: Colors.bg },
          animation: Platform.OS === 'ios' ? 'shift' : 'fade',
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  headerEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.primary,
  },
  headerText: {
    fontSize: FontSize.md,
    fontWeight: '900',
    color: Colors.text,
  },
  iconWrap: {
    minWidth: 42,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapFocused: {
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '800',
    marginTop: 3,
  },
  tabLabelFocused: {
    color: Colors.primary,
  },
});
