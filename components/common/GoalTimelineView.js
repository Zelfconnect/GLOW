import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../../constants/colors';
import dimensions from '../../constants/dimensions';
import goalService from '../../services/firestore/goalService';

/**
 * A component that displays a timeline view of habit completion.
 * Shows the previous two days, the current day, and upcoming days in the week.
 * 
 * @param {Object} props
 * @param {Object} props.goal - The goal data object
 * @param {string} props.goal.id - Goal ID
 * @param {boolean} props.goal.completed - Whether the goal is completed today
 * @param {Object} props.goal.lastCompleted - Firestore timestamp of last completion
 * @param {Function} props.onToggleComplete - Function to call when completion status is toggled
 */
const GoalTimelineView = ({ goal, onToggleComplete }) => {
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  
  useEffect(() => {
    const loadTimelineData = async () => {
      // Generate array of days for the timeline
      // Includes previous 2 days, today, and next 4 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const days = [];
      
      // Add previous 2 days
      for (let i = 2; i > 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Check completion status from history
        const isCompleted = await wasCompletedOnDate(goal, date);
        
        days.push({
          date,
          dayName: getDayName(date),
          dayNumber: date.getDate(),
          isPast: true,
          isToday: false,
          isSelected: false,
          isCompleted
        });
      }
      
      // Add today
      days.push({
        date: new Date(today),
        dayName: 'Today',
        dayNumber: today.getDate(),
        isPast: false,
        isToday: true,
        isSelected: true,
        isCompleted: goal.completed
      });
      
      // Add next 4 days
      for (let i = 1; i <= 4; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        days.push({
          date,
          dayName: getDayName(date),
          dayNumber: date.getDate(),
          isPast: false,
          isToday: false,
          isSelected: false,
          isCompleted: false // Future dates can't be completed yet
        });
      }
      
      setWeekDays(days);
      setSelectedDay(days.find(day => day.isToday));
    };
    
    loadTimelineData();
  }, [goal]);
  
  // Check if a goal was completed on a specific date using the completionHistory array
  const wasCompletedOnDate = async (goal, date) => {
    // If goal has a completionHistory array, use it (client-side check)
    if (goal.completionHistory && Array.isArray(goal.completionHistory)) {
      const dateStr = date.toISOString().split('T')[0]; 
      return goal.completionHistory.includes(dateStr);
    }
    
    // Otherwise, use the service (server-side check) - this is a fallback
    try {
      return await goalService.wasCompletedOnDate(goal.id, date);
    } catch (error) {
      console.error('Error checking completion history:', error);
      return false;
    }
  };
  
  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };
  
  const handleDaySelect = (day) => {
    // Only allow selecting today or past days
    if (!day.isPast && !day.isToday) return;
    
    setSelectedDay(day);
    
    // Update the weekDays state to reflect the selected day
    setWeekDays(prevDays => 
      prevDays.map(d => ({
        ...d,
        isSelected: d.date.getTime() === day.date.getTime()
      }))
    );
    
    // If selecting today, allow toggling completion
    if (day.isToday) {
      onToggleComplete(goal.id, !goal.completed);
    }
    // Future version could allow setting/viewing past completions
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timeline View</Text>
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timelineScroll}
        contentContainerStyle={styles.timelineContent}
      >
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayItem,
              day.isSelected && styles.selectedDay,
              day.isToday && styles.todayItem
            ]}
            onPress={() => handleDaySelect(day)}
            disabled={!day.isPast && !day.isToday}
          >
            <Text style={[
              styles.dayName, 
              day.isSelected && styles.selectedDayText,
              day.isToday && styles.todayText,
              (!day.isPast && !day.isToday) && styles.futureText
            ]}>
              {day.dayName}
            </Text>
            
            <View style={[
              styles.dateCircle,
              day.isSelected && styles.selectedDateCircle,
              day.isToday && styles.todayCircle,
              day.isCompleted && styles.completedCircle,
              (!day.isPast && !day.isToday) && styles.futureCircle
            ]}>
              <Text style={[
                styles.dateNumber,
                day.isSelected && styles.selectedDateText,
                day.isCompleted && styles.completedDateText
              ]}>
                {day.dayNumber}
              </Text>
            </View>
            
            {day.isCompleted && (
              <View style={styles.completedIndicator}>
                <Text style={styles.completedIndicatorText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {selectedDay && selectedDay.isToday && (
        <TouchableOpacity
          style={[
            styles.toggleButton,
            goal.completed && styles.toggleButtonCompleted
          ]}
          onPress={() => onToggleComplete(goal.id, !goal.completed)}
        >
          <Text style={styles.toggleButtonText}>
            {goal.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: dimensions.margin.medium,
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  title: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.medium,
  },
  timelineScroll: {
    flexDirection: 'row',
  },
  timelineContent: {
    paddingVertical: dimensions.padding.small,
    paddingHorizontal: dimensions.padding.tiny,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: dimensions.margin.small,
    width: 60,
    paddingVertical: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  selectedDay: {
    backgroundColor: colors.backgroundLight,
  },
  todayItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: dimensions.fontSize.small,
    color: colors.lightText,
    marginBottom: dimensions.margin.small,
  },
  selectedDayText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  todayText: {
    color: colors.primary,
  },
  futureText: {
    color: colors.lightText,
    opacity: 0.6,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    marginVertical: dimensions.margin.small,
  },
  selectedDateCircle: {
    backgroundColor: colors.primary,
  },
  todayCircle: {
    backgroundColor: colors.primary,
  },
  completedCircle: {
    backgroundColor: colors.success,
  },
  futureCircle: {
    backgroundColor: colors.backgroundLight,
    opacity: 0.6,
  },
  dateNumber: {
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text,
  },
  selectedDateText: {
    color: colors.background,
  },
  completedDateText: {
    color: colors.background,
  },
  completedIndicator: {
    marginTop: dimensions.margin.small,
  },
  completedIndicatorText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.success,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: dimensions.margin.large,
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    paddingVertical: dimensions.padding.medium,
    alignItems: 'center',
  },
  toggleButtonCompleted: {
    backgroundColor: colors.success,
  },
  toggleButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: dimensions.fontSize.medium,
  },
});

export default GoalTimelineView; 