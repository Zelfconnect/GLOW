import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppContext } from '../store';
import { Text, View } from 'react-native';
import colors from '../constants/colors';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MacroGoalsListScreen from '../screens/MacroGoalsListScreen';
import MicroGoalsListScreen from '../screens/MicroGoalsListScreen';
import EditMacroGoalScreen from '../screens/EditMacroGoalScreen';
import EditMicroGoalScreen from '../screens/EditMicroGoalScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import GoalsTabScreen from '../screens/GoalsTabScreen';
import ChatScreen from '../screens/ChatScreen';

// Create navigators
const AuthStack = createStackNavigator();
const GoalsStack = createStackNavigator();
const ChatStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

// Tab icons as components
const TabIcon = ({ focused, name }) => {
  // Emoji mapping - simplified as font size changes handle focus
  const emojis = {
    Goals: '🎯',
    Chat: '💬',
    Settings: '⚙️'
  };
  
  return (
    // Simplified View, only contains the emoji
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      // Removed top padding, rely on navigator styling
    }}>
      <Text style={{ 
        fontSize: focused ? 28 : 24, // Slightly larger focused emoji
        color: focused ? colors.primary : colors.lightText, 
        // Removed marginBottom
      }}>
        {emojis[name]}
      </Text>
      {/* Removed the Text label for the name */}
    </View>
  );
};

// Auth Navigator for unauthenticated users
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Hide header for auth screens
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Goals Stack Navigator
const GoalsStackNavigator = () => {
  return (
    <GoalsStack.Navigator
      initialRouteName="GoalsTab"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <GoalsStack.Screen 
        name="GoalsTab" 
        component={GoalsTabScreen} 
        options={{ title: 'My Goals' }}
      />
      <GoalsStack.Screen 
        name="EditMacroGoal" 
        component={EditMacroGoalScreen} 
        options={({ route }) => ({ 
          title: route.params?.goalId ? 'Edit Macro Goal' : 'Create Macro Goal' 
        })} 
      />
      <GoalsStack.Screen 
        name="EditMicroGoal" 
        component={EditMicroGoalScreen} 
        options={({ route }) => ({ 
          title: route.params?.goalId ? 'Edit Micro Goal' : 'Create Micro Goal' 
        })} 
      />
      <GoalsStack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Goal Details' })} 
      />
      {/* For backward compatibility, keep these but they might not be directly accessed */}
      <GoalsStack.Screen 
        name="MacroGoalsList" 
        component={MacroGoalsListScreen} 
        options={{ title: 'Macro Goals' }}
      />
      <GoalsStack.Screen 
        name="MicroGoalsList" 
        component={MicroGoalsListScreen} 
        options={({ route }) => ({ title: route.params?.title || 'Micro Goals' })} 
      />
    </GoalsStack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ChatStack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: 'AI Coach' }}
      />
    </ChatStack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SettingsStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
};

// Main Tab Navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      initialRouteName="Goals"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightText,
        tabBarStyle: {
          height: 60, // Adjusted height slightly
          paddingBottom: 5, // Adjusted padding
          paddingTop: 5,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          backgroundColor: colors.background,
        },
        tabBarLabelStyle: { // Style for the default label
          fontSize: 12,
          fontWeight: '600', 
        },
        headerShown: false
      }}
    >
      <MainTab.Screen 
        name="Goals" 
        component={GoalsStackNavigator}
        options={{
          // tabBarLabel: 'Goals', // Optional: Explicitly set label if needed
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Goals" />,
        }}
      />
      <MainTab.Screen 
        name="Chat" 
        component={ChatStackNavigator}
        options={{
          // tabBarLabel: 'Chat', // Optional: Explicitly set label if needed
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Chat" />,
        }}
      />
      <MainTab.Screen 
        name="Settings" 
        component={SettingsStackNavigator}
        options={{
          // tabBarLabel: 'Settings', // Optional: Explicitly set label if needed
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="Settings" />,
        }}
      />
    </MainTab.Navigator>
  );
};

// Root navigator that decides which stack to show based on auth state
const AppNavigator = () => {
  const { state } = useAppContext();
  const isAuthenticated = !!state.user; // Check if user exists in state
  
  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
};

export default AppNavigator; 