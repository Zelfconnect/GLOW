import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert
} from 'react-native';
import colors from '../../constants/colors';
import dimensions from '../../constants/dimensions';
import goalService from '../../services/firestore/goalService';
import GoalItem from './GoalItem';

const MicroGoalTabView = ({ 
  macroGoalId, 
  macroGoal,
  navigation,
  excludeMicroGoalIds = []
}) => {
  const [activeTab, setActiveTab] = useState('process'); // 'process' or 'outcome'
  const [microGoals, setMicroGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMicroGoals = async () => {
      try {
        setLoading(true);
        const goals = await goalService.getMicroGoals(macroGoalId);
        setMicroGoals(goals);
      } catch (err) {
        console.error('Error fetching micro goals:', err);
        setError('Failed to load micro goals');
      } finally {
        setLoading(false);
      }
    };

    fetchMicroGoals();
  }, [macroGoalId]);

  const handleToggleCompletion = async (goalId, completed) => {
    try {
      await goalService.updateGoalCompletion(goalId, completed);
      
      // Update local state
      setMicroGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId ? { ...goal, completed } : goal
        )
      );
    } catch (err) {
      console.error('Error toggling goal completion:', err);
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
              await goalService.deleteMicroGoal(macroGoalId, goalId);
              
              // Update local state
              setMicroGoals(prevGoals => 
                prevGoals.filter(goal => goal.id !== goalId)
              );
            } catch (err) {
              console.error('Error removing micro goal:', err);
              Alert.alert("Error", "Failed to remove the goal. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderTab = (tabName, label) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tabName && styles.activeTab
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text style={[
        styles.tabText,
        activeTab === tabName && styles.activeTabText
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  // Filter out any micro goals that are also in Today's Goals
  const filteredMicroGoals = microGoals.filter(goal => 
    !excludeMicroGoalIds.includes(goal.id)
  );

  const renderProcessTab = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (filteredMicroGoals.length === 0) {
      // Check if we have any goals but they're all filtered
      const allFiltered = microGoals.length > 0 && filteredMicroGoals.length === 0;
      
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            {allFiltered 
              ? 'All micro goals for this macro goal are shown in Today\'s Goals' 
              : 'No micro goals yet'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('EditMicroGoal', { macroGoalId })}
          >
            <Text style={styles.addButtonText}>Add Micro Goal</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredMicroGoals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GoalItem
            goal={item}
            onPress={() => navigation.navigate('EditMicroGoal', { 
              goalId: item.id,
              macroGoalId 
            })}
            onToggleComplete={handleToggleCompletion}
            onRemove={handleRemoveMicroGoal}
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  const renderOutcomeTab = () => (
    <View style={styles.outcomeContainer}>
      <Text style={styles.outcomeTitle}>Desired Outcome</Text>
      <Text style={styles.outcomeDescription}>
        {macroGoal.description || 'No description provided'}
      </Text>
      
      {macroGoal.target && (
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Target:</Text>
          <Text style={styles.targetValue}>{macroGoal.target}</Text>
        </View>
      )}
      
      {macroGoal.deadline && (
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Deadline:</Text>
          <Text style={styles.targetValue}>
            {new Date(macroGoal.deadline.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.editOutcomeButton}
        onPress={() => navigation.navigate('EditMacroGoal', { goalId: macroGoal.id })}
      >
        <Text style={styles.editOutcomeButtonText}>Edit Outcome</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {renderTab('process', 'Process')}
        {renderTab('outcome', 'Outcome')}
      </View>
      
      <View style={styles.tabContent}>
        {activeTab === 'process' ? renderProcessTab() : renderOutcomeTab()}
      </View>
      
      {activeTab === 'process' && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => navigation.navigate('EditMicroGoal', { macroGoalId })}
        >
          <Text style={styles.floatingAddButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundLight,
  },
  tab: {
    flex: 1,
    paddingVertical: dimensions.padding.medium,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: colors.background,
  },
  tabText: {
    color: colors.lightText,
    fontSize: dimensions.fontSize.medium,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    minHeight: 200,
    padding: dimensions.padding.medium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: dimensions.margin.medium,
  },
  emptyText: {
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: dimensions.margin.medium,
    paddingHorizontal: dimensions.padding.medium,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.padding.large,
    paddingVertical: dimensions.padding.small,
    borderRadius: dimensions.borderRadius.medium,
  },
  addButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingBottom: dimensions.padding.medium,
  },
  outcomeContainer: {
    padding: dimensions.padding.medium,
  },
  outcomeTitle: {
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    marginBottom: dimensions.margin.medium,
    color: colors.text,
  },
  outcomeDescription: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    marginBottom: dimensions.margin.large,
  },
  targetContainer: {
    flexDirection: 'row',
    marginBottom: dimensions.margin.medium,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text,
    width: 80,
  },
  targetValue: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    flex: 1,
  },
  editOutcomeButton: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.padding.large,
    paddingVertical: dimensions.padding.small,
    borderRadius: dimensions.borderRadius.medium,
    marginTop: dimensions.margin.large,
  },
  editOutcomeButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  floatingAddButton: {
    position: 'absolute',
    right: dimensions.margin.medium,
    bottom: dimensions.margin.medium,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  floatingAddButtonText: {
    fontSize: 24,
    color: colors.background,
    lineHeight: 26,
    textAlign: 'center',
  },
});

export default MicroGoalTabView; 