import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';
import ExpandableMacroGoalItem from '../components/common/ExpandableMacroGoalItem';
import GoalOnboarding, { shouldShowOnboarding } from '../components/common/GoalOnboarding';

const GoalsTabScreen = ({ navigation }) => {
  const { state } = useAppContext();
  const { user } = state;
  
  const [macroGoals, setMacroGoals] = useState([]);
  const [todaysGoals, setTodaysGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const shouldShow = await shouldShowOnboarding();
      setShowOnboarding(shouldShow);
    };
    
    checkOnboarding();
  }, []);

  const fetchAllGoals = useCallback(async () => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      const [macroGoalsData, todaysGoalsData] = await Promise.all([
        goalService.getMacroGoals(user.uid),
        goalService.getTodaysMicroGoals(user.uid)
      ]);
      
      setMacroGoals(macroGoalsData);
      setTodaysGoals(todaysGoalsData);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load your goals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAllGoals();
    }, [fetchAllGoals])
  );

  const handleToggleCompletion = async (goalId, completed) => {
    try {
      await goalService.updateGoalCompletion(goalId, completed);
      
      // Update local state
      setTodaysGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed } : goal
        )
      );
    } catch (err) {
      console.error('Error toggling goal completion:', err);
      Alert.alert("Error", "Failed to update goal completion. Please try again.");
    }
  };

  const handleRemoveMicroGoal = (goalId) => {
    Alert.alert(
      "Remove Goal",
      "Are you sure you want to remove this goal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Find the goal to get its macroGoalId
              const goalToRemove = todaysGoals.find(goal => goal.id === goalId);
              
              if (goalToRemove) {
                await goalService.deleteMicroGoal(goalToRemove.macroGoalId, goalId);
                
                // Update local state
                setTodaysGoals(prevGoals => 
                  prevGoals.filter(goal => goal.id !== goalId)
                );
              }
            } catch (err) {
              console.error('Error removing micro goal:', err);
              Alert.alert("Error", "Failed to remove the goal. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleEditMacroGoal = (goalId) => {
    navigation.navigate('EditMacroGoal', { goalId });
  };

  const handleAddMacroGoal = () => {
    navigation.navigate('EditMacroGoal');
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleRetry = () => {
    fetchAllGoals();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Goals</Text>
        </View>

        {loading ? (
          // Show loading indicator within the scroll view area
          <View style={styles.centeredMessageContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          // Show error message within the scroll view area
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : macroGoals.length === 0 ? (
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first goal!</Text>
          </View>
        ) : (
          <View style={styles.goalsContainer}>
            {macroGoals.map((goal, index) => (
              <View key={goal.id} style={index !== macroGoals.length - 1 ? styles.goalItemMargin : null}>
                <ExpandableMacroGoalItem
                  macroGoal={goal}
                  onEdit={handleEditMacroGoal}
                  navigation={navigation}
                  todaysGoals={todaysGoals}
                  onToggleComplete={handleToggleCompletion}
                  onRemoveMicroGoal={handleRemoveMicroGoal}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Keep FAB outside the ScrollView for fixed positioning */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddMacroGoal}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {showOnboarding && (
        <GoalOnboarding onClose={handleCloseOnboarding} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: dimensions.padding.medium, // Add horizontal padding
    paddingBottom: dimensions.padding.xxlarge, // Add bottom padding for FAB
  },
  header: {
    paddingTop: dimensions.padding.medium,    // Adjust header padding
    paddingBottom: dimensions.padding.medium,
  },
  headerTitle: {
    fontSize: dimensions.fontSize.xxlarge, // Slightly larger title
    fontWeight: 'bold',
    color: colors.text,
  },
  goalsContainer: {
    // Remove vertical padding here, spacing handled by goalItemMargin
  },
  goalItemMargin: {
    marginBottom: dimensions.margin.medium, // Add space between goal items
  },
  // Renamed centeredContainer to centeredMessageContainer for clarity
  centeredMessageContainer: {
    flexGrow: 1, // Allow container to grow if needed
    justifyContent: 'center',
    alignItems: 'center',
    padding: dimensions.padding.large,
    minHeight: 200, // Ensure some minimum height for centering
  },
  emptyText: {
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.small,
  },
  emptySubText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    textAlign: 'center',
  },
  errorText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.error,
    marginBottom: dimensions.margin.medium,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: dimensions.padding.medium, // Make padding consistent with submitButton
    borderRadius: dimensions.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: dimensions.fontSize.large, // Make font size consistent with submitButtonText
  },
  addButton: {
    position: 'absolute',
    bottom: dimensions.margin.large,
    right: dimensions.margin.large,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.xxlarge,
    lineHeight: dimensions.fontSize.xxlarge * 1.1, // Adjust line height for centering '+'
  },
});

export default GoalsTabScreen; 