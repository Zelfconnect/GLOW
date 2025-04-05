import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';
import GoalTimelineView from '../components/common/GoalTimelineView';

const GoalDetailScreen = ({ route, navigation }) => {
  const { goalId, title } = route.params || {};
  const { state } = useAppContext();
  const { user } = state;
  
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoalDetails = async () => {
      try {
        setLoading(true);
        // This would normally call a specific function to get a single goal
        // For now, we'll simulate it with a placeholder
        const goals = await goalService.getTodaysMicroGoals(user.uid);
        const foundGoal = goals.find(g => g.id === goalId);
        
        if (foundGoal) {
          setGoal(foundGoal);
        } else {
          setError('Goal not found');
        }
      } catch (err) {
        console.error('Error fetching goal details:', err);
        setError('Failed to load goal details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (goalId) {
      fetchGoalDetails();
    } else {
      setError('No goal ID provided');
      setLoading(false);
    }
  }, [goalId, user.uid]);

  const handleToggleCompletion = async () => {
    if (!goal) return;

    try {
      await goalService.updateGoalCompletion(goal.id, !goal.completed);
      setGoal({
        ...goal,
        completed: !goal.completed
      });
    } catch (err) {
      console.error('Error toggling goal completion:', err);
      setError('Failed to update goal. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal?.title || title}</Text>
      </View>

      <View style={styles.detailContainer}>
        <View style={styles.statusContainer}>
          <Text style={styles.labelText}>Status:</Text>
          <Text style={[
            styles.statusText, 
            goal?.completed ? styles.completedText : styles.pendingText
          ]}>
            {goal?.completed ? 'Completed' : 'Pending'}
          </Text>
        </View>

        {goal?.streak > 0 && (
          <View style={styles.streakContainer}>
            <Text style={styles.labelText}>Current Streak:</Text>
            <Text style={styles.streakText}>🔥 {goal.streak} {goal.streak === 1 ? 'day' : 'days'}</Text>
          </View>
        )}

        {goal?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.labelText}>Description:</Text>
            <Text style={styles.descriptionText}>{goal.description}</Text>
          </View>
        )}
      </View>

      {goal && (
        <GoalTimelineView 
          goal={goal} 
          onToggleComplete={handleToggleCompletion} 
        />
      )}

      <TouchableOpacity 
        style={[
          styles.completionButton, 
          goal?.completed ? styles.unmarkButton : styles.markButton
        ]}
        onPress={handleToggleCompletion}
      >
        <Text style={styles.completionButtonText}>
          {goal?.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => {
          // Navigate to edit screen for this goal
          if (goal?.macroGoalId) {
            navigation.navigate('EditMicroGoal', { 
              goalId: goal.id,
              macroGoalId: goal.macroGoalId
            });
          }
        }}
      >
        <Text style={styles.editButtonText}>Edit Goal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: dimensions.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBackground,
  },
  title: {
    fontSize: dimensions.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailContainer: {
    padding: dimensions.padding.medium,
    backgroundColor: colors.cardBackground,
    margin: dimensions.margin.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.margin.medium,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.margin.medium,
  },
  descriptionContainer: {
    marginBottom: dimensions.margin.medium,
  },
  labelText: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: dimensions.margin.small,
  },
  statusText: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  completedText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
  },
  streakText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.accent,
  },
  descriptionText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
    marginTop: dimensions.margin.small,
  },
  completionButton: {
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    alignItems: 'center',
    margin: dimensions.margin.medium,
  },
  markButton: {
    backgroundColor: colors.success,
  },
  unmarkButton: {
    backgroundColor: colors.warning,
  },
  completionButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  editButton: {
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    alignItems: 'center',
    margin: dimensions.margin.medium,
    backgroundColor: colors.primary,
  },
  editButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.error,
    fontSize: dimensions.fontSize.large,
    marginBottom: dimensions.margin.medium,
  },
  button: {
    backgroundColor: colors.primary,
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  buttonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default GoalDetailScreen; 