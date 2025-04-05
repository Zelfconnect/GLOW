import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import colors from '../../constants/colors';
import dimensions from '../../constants/dimensions';

/**
 * A reusable component for displaying a goal item with completion toggle
 * 
 * @param {Object} props
 * @param {Object} props.goal - The goal data object
 * @param {string} props.goal.id - Unique identifier
 * @param {string} props.goal.title - Goal title/description
 * @param {boolean} props.goal.completed - Whether the goal is completed
 * @param {Function} props.onPress - Function to call when the goal is pressed
 * @param {Function} props.onToggleComplete - Function to call when completion status is toggled
 * @param {Function} props.onRemove - Function to call when remove button is pressed
 * @param {boolean} props.isAntiGoal - Whether this is an anti-goal (something to avoid)
 */
const GoalItem = ({ 
  goal, 
  onPress, 
  onToggleComplete,
  onRemove,
  isAntiGoal = false 
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const swipeableRef = useRef(null);

  const handleToggle = () => {
    // Animate the checkbox
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    if (onToggleComplete) {
      onToggleComplete(goal.id, !goal.completed);
    }
  };

  // Render the action shown when swiping left (Delete)
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80], // Adjust this value to control how much the button reveals
      extrapolate: 'clamp',
    });

    const handleDelete = () => {
      if (swipeableRef.current) {
        swipeableRef.current.close(); // Close the swipeable row
      }
      if (onRemove) {
        onRemove(goal.id); // Call the original onRemove function
      }
    };

    return (
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Animated.Text 
          style={[
            styles.deleteButtonText,
            { transform: [{ translateX: trans }] }
          ]}
        >
          Delete
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable 
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2} // Adjust friction for swipe feel
      rightThreshold={40} // How far user needs to swipe to trigger action
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          // Optional: Handle right swipe if needed
        }
      }}
    >
      <Animated.View style={[
        styles.container, 
        goal.completed ? styles.completedGoal : styles.incompleteGoal,
        isAntiGoal && styles.antiGoal,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <TouchableOpacity 
          style={styles.contentContainer}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <TouchableOpacity 
            style={[
              styles.checkbox,
              isAntiGoal && styles.antiGoalCheckbox,
              goal.completed && styles.completedCheckbox
            ]} 
            onPress={handleToggle}
          >
            {goal.completed && (
              <View style={[
                styles.checkboxInner,
                isAntiGoal && styles.antiGoalCheckboxInner
              ]} />
            )}
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text 
              style={[
                styles.title,
                goal.completed && styles.completedTitle
              ]}
              numberOfLines={2}
            >
              {goal.title}
            </Text>
            
            <View style={styles.metaContainer}>
              {goal.streak > 0 && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakText}>🔥 {goal.streak}</Text>
                </View>
              )}
              {goal.frequency && (
                <Text style={styles.frequencyText}>
                  {goal.frequency === 'daily' ? '📅 Daily' : 
                   goal.frequency === 'weekdays' ? '📅 Weekdays' :
                   goal.frequency === 'weekends' ? '📅 Weekends' : '📅 Custom'}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: dimensions.margin.small,
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.padding.medium,
    minHeight: 60,
  },
  completedGoal: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.8,
  },
  incompleteGoal: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  antiGoal: {
    borderLeftColor: colors.antiGoal || colors.warning,
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
  completedCheckbox: {
    backgroundColor: colors.backgroundLight,
    borderColor: colors.success,
  },
  antiGoalCheckbox: {
    borderColor: colors.antiGoal || colors.warning,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: dimensions.borderRadius.small - 2,
    backgroundColor: colors.success,
  },
  antiGoalCheckboxInner: {
    backgroundColor: colors.antiGoal || colors.warning,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.lightText,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  streakContainer: {
    backgroundColor: colors.secondary,
    borderRadius: dimensions.borderRadius.round,
    paddingHorizontal: dimensions.padding.small,
    paddingVertical: 2,
    marginRight: dimensions.margin.small,
  },
  streakText: {
    color: colors.background,
    fontSize: dimensions.fontSize.small,
    fontWeight: 'bold',
  },
  frequencyText: {
    fontSize: dimensions.fontSize.small,
    color: colors.lightText,
  },
  deleteButton: {
    backgroundColor: colors.error || '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingRight: dimensions.padding.large,
  },
  deleteButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: dimensions.fontSize.medium,
  },
});

export default GoalItem; 