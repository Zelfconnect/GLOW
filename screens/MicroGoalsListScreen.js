import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const MicroGoalsListScreen = ({ route, navigation }) => {
  const { macroGoalId, title } = route.params;
  const { state } = useAppContext();
  const { user } = state;
  const [microGoals, setMicroGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set the navigation title
    navigation.setOptions({
      title: title || 'Micro Goals'
    });

    const fetchMicroGoals = async () => {
      try {
        setLoading(true);
        const goals = await goalService.getMicroGoals(macroGoalId);
        setMicroGoals(goals);
      } catch (err) {
        console.error('Error fetching micro goals:', err);
        setError('Failed to load micro goals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMicroGoals();
  }, [macroGoalId, navigation, title]);

  const renderFrequencyText = (frequency, customDays) => {
    switch (frequency) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Weekdays (Mon-Fri)';
      case 'weekends':
        return 'Weekends (Sat-Sun)';
      case 'custom':
        if (customDays && customDays.length > 0) {
          // Format days nicely - capitalize and join with commas
          const formattedDays = customDays
            .map(day => day.charAt(0).toUpperCase() + day.slice(1))
            .join(', ');
          return `Custom: ${formattedDays}`;
        }
        return 'Custom schedule';
      default:
        return 'No schedule set';
    }
  };

  const handleToggleCompletion = async (goalId, currentStatus) => {
    try {
      await goalService.updateGoalCompletion(goalId, !currentStatus);
      
      // Update local state after successful Firestore update
      setMicroGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed: !currentStatus } : goal
        )
      );
    } catch (err) {
      console.error('Error toggling goal completion:', err);
      setError('Failed to update goal. Please try again.');
    }
  };

  const renderMicroGoalItem = ({ item }) => (
    <View style={styles.goalItem}>
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={() => handleToggleCompletion(item.id, item.completed)}
      >
        {item.completed && <View style={styles.checkboxInner} />}
      </TouchableOpacity>
      
      <View style={styles.goalContent}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditMicroGoal', { 
              goalId: item.id,
              macroGoalId: macroGoalId
            })}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.goalDetails}>
          <Text style={styles.frequencyText}>
            {renderFrequencyText(item.frequency, item.customDays)}
          </Text>
          
          {item.streak > 0 && (
            <Text style={styles.streakText}>🔥 {item.streak} day streak</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
              goalService.getMicroGoals(macroGoalId)
                .then(goals => setMicroGoals(goals))
                .catch(err => setError('Failed to load micro goals. Please try again.'))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : microGoals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No micro goals yet.</Text>
          <Text style={styles.emptySubText}>Tap the + button to add your first micro goal!</Text>
        </View>
      ) : (
        <FlatList
          data={microGoals}
          renderItem={renderMicroGoalItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('EditMicroGoal', { macroGoalId })}
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
  goalContent: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.margin.tiny,
  },
  goalTitle: {
    fontSize: dimensions.fontSize.large,
    color: colors.text,
    flex: 1,
  },
  editButton: {
    padding: dimensions.padding.tiny,
  },
  editButtonText: {
    fontSize: dimensions.fontSize.small,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: dimensions.fontSize.small,
    color: colors.textLight,
  },
  streakText: {
    fontSize: dimensions.fontSize.small,
    color: colors.accent,
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
  }
});

export default MicroGoalsListScreen;
