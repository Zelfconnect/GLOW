import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import colors from '../../constants/colors';
import dimensions from '../../constants/dimensions';
import MicroGoalTabView from './MicroGoalTabView';
import GoalItem from './GoalItem';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ExpandableMacroGoalItem = ({ 
  macroGoal, 
  onEdit, 
  navigation,
  excludeMicroGoalIds = [],
  todaysGoals = [],
  onToggleComplete,
  onRemoveMicroGoal
}) => {
  const [expanded, setExpanded] = useState(false);
  const progress = macroGoal.progress || 0;

  // Filter today's goals that belong to this macro goal
  const todaysGoalsForMacro = todaysGoals.filter(goal => goal.macroGoalId === macroGoal.id);
  const completedTodayGoals = todaysGoalsForMacro.filter(goal => goal.completed).length;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[
      styles.container,
      macroGoal.isAntiGoal ? styles.antiGoalItem : null,
      { borderLeftColor: macroGoal.color || colors.primary }
    ]}>
      {/* Progress Bar - Now at the top of the card */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` },
              macroGoal.isAntiGoal ? styles.antiGoalProgress : null
            ]} 
          />
        </View>
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.goalHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.goalTitle}>{macroGoal.title}</Text>
            {macroGoal.isAntiGoal && <Text style={styles.antiGoalBadge}>ANTI</Text>}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(macroGoal.id)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Progress: {progress}%
          </Text>
          {todaysGoalsForMacro.length > 0 && (
            <Text style={styles.statsText}>
              Today: {completedTodayGoals}/{todaysGoalsForMacro.length}
            </Text>
          )}
        </View>

        {macroGoal.description && (
          <Text style={styles.goalDescription} numberOfLines={2}>
            {macroGoal.description}
          </Text>
        )}
      </View>

      {/* Today's Goals Section - Only show if there are relevant tasks */}
      {todaysGoalsForMacro.length > 0 ? (
        <View style={styles.todaysGoalsSection}>
          <Text style={styles.sectionTitle}>Today's Tasks ({completedTodayGoals}/{todaysGoalsForMacro.length})</Text>
          {todaysGoalsForMacro.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onPress={() => navigation.navigate('EditMicroGoal', { 
                goalId: goal.id,
                macroGoalId: goal.macroGoalId 
              })}
              onToggleComplete={onToggleComplete}
              onRemove={onRemoveMicroGoal}
            />
          ))}
        </View>
      ) : (
        // Optional: Show a message if no tasks today for this goal
        <View style={styles.noTasksTodayContainer}>
          <Text style={styles.noTasksTodayText}>No tasks scheduled for today.</Text>
        </View>
      )}

      {/* Separator before Expand button */}
      <View style={styles.separator} />

      {/* Expandable All Goals Section */}
      <TouchableOpacity 
        style={styles.expandButton}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.expandButtonText}>
          {expanded ? 'Hide All Tasks' : 'Show All Tasks'}
        </Text>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Conditionally rendered content with animation */}
      {expanded && (
        <View style={styles.expandedContentContainer}> 
          {/* Added a container for potentially better styling/layout of expanded content */}
          <MicroGoalTabView 
            macroGoalId={macroGoal.id} 
            macroGoal={macroGoal}
            navigation={navigation}
            excludeMicroGoalIds={todaysGoalsForMacro.map(g => g.id)} // Exclude today's goals if needed by tab view
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: dimensions.margin.medium,
    marginVertical: dimensions.margin.small,
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    borderLeftWidth: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  antiGoalItem: {
    borderLeftColor: colors.warning,
  },
  progressBarContainer: {
    paddingHorizontal: dimensions.padding.small,
    paddingTop: dimensions.padding.small,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  antiGoalProgress: {
    backgroundColor: colors.warning,
  },
  header: {
    padding: dimensions.padding.medium,
    paddingBottom: dimensions.padding.small, // Reduce bottom padding slightly
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: dimensions.margin.small, // Add margin below header line
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: dimensions.margin.small, // Add margin to prevent overlap with edit button
  },
  goalTitle: {
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: dimensions.margin.small,
  },
  antiGoalBadge: {
    fontSize: dimensions.fontSize.tiny,
    backgroundColor: colors.warning,
    color: colors.background,
    paddingHorizontal: dimensions.padding.small,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.small,
    fontWeight: 'bold',
  },
  editButton: {
    padding: dimensions.padding.small,
  },
  editButtonText: {
    fontSize: dimensions.fontSize.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    // Removed justifyContent: 'space-between' to allow wrapping if needed
    flexWrap: 'wrap', // Allow stats to wrap
    marginTop: dimensions.margin.tiny,
    marginBottom: dimensions.margin.small,
  },
  statsText: {
    fontSize: dimensions.fontSize.small,
    color: colors.lightText,
    fontWeight: '500',
    marginRight: dimensions.margin.medium, // Add spacing between stats
    marginBottom: dimensions.margin.tiny, // Add spacing if wraps
  },
  goalDescription: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    marginTop: dimensions.margin.tiny,
  },
  todaysGoalsSection: {
    paddingHorizontal: dimensions.padding.medium,
    paddingBottom: dimensions.padding.medium,
    // Removed top border, will use a separate separator component style
  },
  sectionTitle: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: dimensions.margin.medium, // Increased margin below title
  },
  noTasksTodayContainer: {
    paddingHorizontal: dimensions.padding.medium,
    paddingVertical: dimensions.padding.small,
    alignItems: 'center',
  },
  noTasksTodayText: {
    fontSize: dimensions.fontSize.small,
    color: colors.lightText,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: dimensions.margin.medium, // Match padding
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align text and icon
    padding: dimensions.padding.medium,
    // Removed top border and background color for cleaner integration
  },
  expandButtonText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.primary, // Keep primary color for action text
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: dimensions.fontSize.small,
    color: colors.primary,
  },
  expandedContentContainer: {
    // Container for the MicroGoalTabView when expanded
    // Add padding or margin here if needed, or style within MicroGoalTabView
    borderTopWidth: 1, // Add separator line above expanded content
    borderTopColor: colors.divider,
  },
});

export default ExpandableMacroGoalItem; 