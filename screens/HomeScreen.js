import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';
import GoalTimelineView from '../components/common/GoalTimelineView';

const HomeScreen = ({ navigation }) => {
  const { state } = useAppContext();
  const { user } = state;
  const [todaysMicroGoals, setTodaysMicroGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  useEffect(() => {
    const fetchTodaysGoals = async () => {
      try {
        console.log('[DIAG] HomeScreen: Starting to fetch today\'s goals');
        console.log('[DIAG] HomeScreen: User state:', user ? { uid: user.uid, email: user.email } : 'No user');
        
        setLoading(true);
        if (user && user.uid) {
          console.log(`[DIAG] HomeScreen: Calling getTodaysMicroGoals with userId: ${user.uid}`);
          const goals = await goalService.getTodaysMicroGoals(user.uid);
          console.log(`[DIAG] HomeScreen: Received ${goals.length} goals from service`);
          setTodaysMicroGoals(goals);
        } else {
          console.warn('[DIAG] HomeScreen: No user or user.uid available for fetching goals');
          setTodaysMicroGoals([]);
        }
      } catch (err) {
        console.error('Error fetching today\'s goals:', err);
        console.error('[DIAG] HomeScreen: Error type:', err.name, 'Message:', err.message);
        setError('Failed to load today\'s goals. Please try again.');
      } finally {
        setLoading(false);
        console.log('[DIAG] HomeScreen: Completed fetchTodaysGoals (success or failure)');
      }
    };

    console.log('[DIAG] HomeScreen: useEffect triggered, about to fetch goals');
    fetchTodaysGoals();
  }, [user]);

  const handleToggleCompletion = async (goalId, currentStatus) => {
    try {
      await goalService.updateGoalCompletion(goalId, !currentStatus);
      
      // Update local state after successful Firestore update
      setTodaysMicroGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed: !currentStatus } : goal
        )
      );
    } catch (err) {
      console.error('Error toggling goal completion:', err);
      setError('Failed to update goal. Please try again.');
    }
  };

  const handleGoalPress = (goalId) => {
    // Toggle expanded state for the goal
    setExpandedGoalId(prevId => prevId === goalId ? null : goalId);
  };

  const renderGoalItem = ({ item }) => (
    <View>
      <TouchableOpacity 
        style={[styles.goalItem, item.completed ? styles.completedGoal : styles.incompleteGoal]}
        onPress={() => handleGoalPress(item.id)}
      >
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => handleToggleCompletion(item.id, item.completed)}
        >
          {item.completed && <View style={styles.checkboxInner} />}
        </TouchableOpacity>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          {item.streak > 0 && (
            <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Show timeline view if this goal is expanded */}
      {expandedGoalId === item.id && (
        <View style={styles.expandedContent}>
          <GoalTimelineView 
            goal={item} 
            onToggleComplete={handleToggleCompletion} 
          />
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('GoalDetail', { goalId: item.id, title: item.title })}
          >
            <Text style={styles.viewDetailsButtonText}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Goals</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              goalService.getTodaysMicroGoals(user.uid)
                .then(goals => setTodaysMicroGoals(goals))
                .catch(err => setError('Failed to load today\'s goals. Please try again.'))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : todaysMicroGoals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No goals for today.</Text>
          <Text style={styles.emptySubText}>Add micro goals to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={todaysMicroGoals}
          renderItem={renderGoalItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('MacroGoalsList')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: dimensions.padding.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.margin.large,
  },
  title: {
    fontSize: dimensions.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: dimensions.padding.small,
  },
  settingsButtonText: {
    fontSize: dimensions.fontSize.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dimensions.padding.xl,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    marginBottom: dimensions.margin.medium,
    backgroundColor: colors.cardBackground,
  },
  completedGoal: {
    opacity: 0.7,
  },
  incompleteGoal: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: dimensions.borderRadius.small,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: dimensions.margin.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: dimensions.borderRadius.small - 2,
    backgroundColor: colors.primary,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: dimensions.fontSize.large,
    color: colors.text,
  },
  streakText: {
    fontSize: dimensions.fontSize.small,
    color: colors.accent,
    marginTop: dimensions.margin.small,
  },
  addButton: {
    position: 'absolute',
    right: dimensions.margin.large,
    bottom: dimensions.margin.large,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    color: colors.background,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: dimensions.margin.medium,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.padding.large,
    paddingVertical: dimensions.padding.small,
    borderRadius: dimensions.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: dimensions.fontSize.large,
    color: colors.textLight,
    marginBottom: dimensions.margin.small,
  },
  emptySubText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.textLight,
  },
  expandedContent: {
    marginHorizontal: dimensions.margin.medium,
    marginTop: -dimensions.margin.small,
    marginBottom: dimensions.margin.medium,
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: dimensions.borderRadius.medium,
    borderBottomRightRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.small,
    borderWidth: 1,
    borderColor: colors.divider,
    borderTopWidth: 0,
  },
  viewDetailsButton: {
    alignSelf: 'center',
    paddingVertical: dimensions.padding.small,
    paddingHorizontal: dimensions.padding.medium,
    marginVertical: dimensions.margin.small,
    backgroundColor: colors.secondary,
    borderRadius: dimensions.borderRadius.medium,
  },
  viewDetailsButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 