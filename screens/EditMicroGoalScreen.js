import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const EditMicroGoalScreen = ({ route, navigation }) => {
  const { goalId, macroGoalId } = route.params || {};
  const isEditing = !!goalId;
  const { state } = useAppContext();
  const { user } = state;

  const [loading, setLoading] = useState(isEditing);
  const [title, setTitle] = useState('');
  const [xpValue, setXpValue] = useState('10');
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableMacroGoals, setAvailableMacroGoals] = useState([]);
  const [selectedMacroGoalId, setSelectedMacroGoalId] = useState(macroGoalId || '');

  // Fetch all macro goals for selection
  useEffect(() => {
    const fetchMacroGoals = async () => {
      try {
        const goals = await goalService.getMacroGoals(user.uid);
        setAvailableMacroGoals(goals);
        
        // If no macro goal ID is provided and there are available goals, select the first one
        if (!macroGoalId && goals.length > 0 && !selectedMacroGoalId) {
          setSelectedMacroGoalId(goals[0].id);
        }
      } catch (error) {
        console.error('Error fetching macro goals:', error);
        Alert.alert('Error', 'Failed to load macro goals');
      }
    };

    fetchMacroGoals();
  }, [user.uid, macroGoalId]);

  // Fetch existing micro goal data if editing
  useEffect(() => {
    if (isEditing && goalId) {
      const fetchGoalDetails = async () => {
        try {
          setLoading(true);
          
          // Get all micro goals for the macro goal and find the one we need
          const microGoals = await goalService.getMicroGoals(macroGoalId);
          const goal = microGoals.find(g => g.id === goalId);
          
          if (goal) {
            setTitle(goal.title || '');
            setXpValue(goal.xpValue ? goal.xpValue.toString() : '10');
            setFrequency(goal.frequency || 'daily');
            
            // Handle custom days if applicable
            if (goal.frequency === 'custom' && goal.customDays) {
              const daysObject = {};
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              
              dayNames.forEach(day => {
                daysObject[day] = goal.customDays.includes(day);
              });
              
              setCustomDays(daysObject);
            }
            
            setSelectedMacroGoalId(goal.macroGoalId);
          } else {
            Alert.alert('Error', 'Goal not found');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error fetching goal details:', error);
          Alert.alert('Error', 'Failed to load goal details');
        } finally {
          setLoading(false);
        }
      };

      fetchGoalDetails();
    }
  }, [goalId, macroGoalId, isEditing, navigation]);

  const toggleDay = (day) => {
    setCustomDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!selectedMacroGoalId) {
      Alert.alert('Error', 'Please select a macro goal');
      return;
    }

    // For custom frequency, ensure at least one day is selected
    if (frequency === 'custom' && !Object.values(customDays).some(val => val)) {
      Alert.alert('Error', 'Please select at least one day for your custom schedule');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert customDays object to array of day names for storage
      const customDaysArray = frequency === 'custom' 
        ? Object.entries(customDays)
            .filter(([_, isSelected]) => isSelected)
            .map(([day]) => day)
        : [];
      
      const goalData = {
        title: title.trim(),
        xpValue: parseInt(xpValue, 10) || 10,
        frequency,
        customDays: customDaysArray,
        userId: user.uid,
        macroGoalId: selectedMacroGoalId,
        isArchived: false,
        completed: false
      };

      if (isEditing) {
        await goalService.updateMicroGoal(goalId, goalData);
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        await goalService.createMicroGoal(goalData);
        Alert.alert('Success', 'Goal created successfully');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} goal`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFrequencyOption = (option, label) => (
    <TouchableOpacity
      style={[
        styles.frequencyOption,
        frequency === option && styles.selectedFrequencyOption
      ]}
      onPress={() => setFrequency(option)}
    >
      <Text 
        style={[
          styles.frequencyOptionText,
          frequency === option && styles.selectedFrequencyOptionText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDayToggle = (day, label) => (
    <TouchableOpacity 
      style={[
        styles.dayToggle,
        customDays[day] && styles.selectedDayToggle
      ]}
      onPress={() => toggleDay(day)}
    >
      <Text 
        style={[
          styles.dayToggleText,
          customDays[day] && styles.selectedDayToggleText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{isEditing ? 'Edit Micro Goal' : 'Create Micro Goal'}</Text>
      
      {!macroGoalId && (
        <View style={styles.section}>
          <Text style={styles.label}>Select Macro Goal</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.macroGoalsScrollView}
          >
            {availableMacroGoals.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.macroGoalOption,
                  selectedMacroGoalId === goal.id && styles.selectedMacroGoalOption,
                  { borderLeftColor: goal.color || colors.primary }
                ]}
                onPress={() => setSelectedMacroGoalId(goal.id)}
              >
                <Text style={styles.macroGoalTitle} numberOfLines={1}>
                  {goal.title}
                </Text>
                {goal.isAntiGoal && (
                  <Text style={styles.antiGoalBadge}>ANTI</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter goal title"
          placeholderTextColor={colors.lightText}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>XP Value</Text>
        <TextInput
          style={styles.input}
          value={xpValue}
          onChangeText={setXpValue}
          placeholder="Enter XP value"
          placeholderTextColor={colors.lightText}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyOptions}>
          {renderFrequencyOption('daily', 'Daily')}
          {renderFrequencyOption('weekdays', 'Weekdays')}
          {renderFrequencyOption('weekends', 'Weekends')}
          {renderFrequencyOption('custom', 'Custom')}
        </View>
      </View>
      
      {frequency === 'custom' && (
        <View style={styles.section}>
          <Text style={styles.label}>Select Days</Text>
          <View style={styles.daysContainer}>
            {renderDayToggle('sunday', 'S')}
            {renderDayToggle('monday', 'M')}
            {renderDayToggle('tuesday', 'T')}
            {renderDayToggle('wednesday', 'W')}
            {renderDayToggle('thursday', 'T')}
            {renderDayToggle('friday', 'F')}
            {renderDayToggle('saturday', 'S')}
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.submitButton,
          submitting && styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: dimensions.padding.medium,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: dimensions.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.large,
  },
  section: {
    marginBottom: dimensions.margin.large,
  },
  label: {
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
    marginBottom: dimensions.margin.small,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
  },
  frequencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  frequencyOption: {
    backgroundColor: colors.lightBackground,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    minWidth: '22%',
    alignItems: 'center',
    marginBottom: dimensions.margin.small,
  },
  selectedFrequencyOption: {
    backgroundColor: colors.primary,
  },
  frequencyOptionText: {
    color: colors.text,
    fontSize: dimensions.fontSize.small,
  },
  selectedFrequencyOptionText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dimensions.margin.small,
  },
  dayToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayToggle: {
    backgroundColor: colors.primary,
  },
  dayToggleText: {
    fontSize: dimensions.fontSize.small,
    color: colors.text,
  },
  selectedDayToggleText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  macroGoalsScrollView: {
    marginTop: dimensions.margin.small,
  },
  macroGoalOption: {
    marginRight: dimensions.margin.medium,
    paddingHorizontal: dimensions.padding.medium,
    paddingVertical: dimensions.padding.small,
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    borderLeftWidth: 4,
    minWidth: 120,
    justifyContent: 'center',
  },
  selectedMacroGoalOption: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  macroGoalTitle: {
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
  },
  antiGoalBadge: {
    fontSize: dimensions.fontSize.tiny,
    backgroundColor: colors.warning,
    color: colors.background,
    paddingHorizontal: dimensions.padding.tiny,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.small,
    alignSelf: 'flex-start',
    marginTop: dimensions.margin.tiny,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: dimensions.margin.medium,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
});

export default EditMicroGoalScreen; 