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
import config from '../constants/config';

const EditMacroGoalScreen = ({ route, navigation }) => {
  const { goalId } = route.params || {};
  const isEditing = !!goalId;
  const { state, dispatch } = useAppContext();
  const { user } = state;

  const [loading, setLoading] = useState(isEditing);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAntiGoal, setIsAntiGoal] = useState(false);
  const [color, setColor] = useState(colors.primary);
  const [targetXP, setTargetXP] = useState('1000');
  const [submitting, setSubmitting] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const goals = await goalService.getMacroGoals(user.uid);
        setExistingGoals(goals);
        
        if (isEditing && goalId) {
          const goal = goals.find(g => g.id === goalId);
          if (goal) {
            setTitle(goal.title || '');
            setDescription(goal.description || '');
            setIsAntiGoal(goal.isAntiGoal || false);
            setColor(goal.color || colors.primary);
            setTargetXP(goal.targetXP ? goal.targetXP.toString() : '1000');
          } else {
            Alert.alert('Error', 'Goal not found');
            navigation.goBack();
          }
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        Alert.alert('Error', 'Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [goalId, user.uid, isEditing, navigation]);

  const handleDelete = () => {
    // First check if user is still authenticated
    if (!user?.uid) {
      Alert.alert(
        'Authentication Error',
        'Please log in again to delete this goal.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This will also delete all associated micro goals and cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await goalService.deleteMacroGoal(goalId);
              
              // Update local state by removing the deleted goal
              setExistingGoals(prevGoals => 
                prevGoals.filter(goal => goal.id !== goalId)
              );
              
              // Show success message with a callback to navigate back
              Alert.alert(
                'Success',
                'Goal deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting goal:', error);
              
              // Handle specific error cases
              if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                Alert.alert(
                  'Authentication Error',
                  'Please log in again to delete this goal.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Login')
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete goal. Please try again.'
                );
              }
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    // Check goal limits when creating a new goal
    if (!isEditing) {
      const regularGoals = existingGoals.filter(g => !g.isAntiGoal);
      const antiGoals = existingGoals.filter(g => g.isAntiGoal);

      if (isAntiGoal && antiGoals.length >= config.MAX_MACRO_ANTI_GOALS) {
        Alert.alert(
          'Limit Reached',
          `You can only create up to ${config.MAX_MACRO_ANTI_GOALS} anti-goals. Consider editing or removing an existing anti-goal.`
        );
        return;
      }

      if (!isAntiGoal && regularGoals.length >= config.MAX_MACRO_GOALS) {
        Alert.alert(
          'Limit Reached',
          `You can only create up to ${config.MAX_MACRO_GOALS} regular goals. Consider editing or removing an existing goal.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const goalData = {
        title: title.trim(),
        description: description.trim(),
        isAntiGoal,
        color,
        targetXP: parseInt(targetXP, 10) || 1000,
        totalXP: isEditing ? undefined : 0, // Only set totalXP to 0 for new goals
        userId: user.uid
      };

      if (isEditing) {
        await goalService.updateMacroGoal(goalId, goalData);
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        await goalService.createMacroGoal(goalData);
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

  const colorOptions = [
    colors.primary,
    colors.secondary,
    colors.success,
    colors.warning,
    colors.info,
    colors.antiGoal
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{isEditing ? 'Edit Macro Goal' : 'Create Macro Goal'}</Text>
      
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter goal title"
        placeholderTextColor={colors.lightText}
      />
      
      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter goal description"
        placeholderTextColor={colors.lightText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Is this an anti-goal?</Text>
        <Switch
          value={isAntiGoal}
          onValueChange={setIsAntiGoal}
          trackColor={{ false: colors.lightBackground, true: colors.antiGoal }}
          thumbColor={isAntiGoal ? colors.background : colors.background}
        />
      </View>
      
      <Text style={styles.label}>Goal Color</Text>
      <View style={styles.colorOptions}>
        {colorOptions.map((colorOption, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: colorOption },
              color === colorOption && styles.selectedColorOption
            ]}
            onPress={() => setColor(colorOption)}
          />
        ))}
      </View>
      
      <Text style={styles.label}>Target XP (Optional)</Text>
      <TextInput
        style={styles.input}
        value={targetXP}
        onChangeText={setTargetXP}
        placeholder="Enter target XP"
        placeholderTextColor={colors.lightText}
        keyboardType="numeric"
      />
      
      <TouchableOpacity
        style={[
          styles.submitButton,
          (submitting || deleting) && styles.disabledButton,
          { backgroundColor: isAntiGoal ? colors.antiGoal : colors.primary }
        ]}
        onPress={handleSubmit}
        disabled={submitting || deleting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Update Goal' : 'Create Goal'}
          </Text>
        )}
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity
          style={[styles.deleteButton, (submitting || deleting) && styles.disabledButton]}
          onPress={handleDelete}
          disabled={submitting || deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Goal</Text>
          )}
        </TouchableOpacity>
      )}
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
    marginBottom: dimensions.margin.medium,
  },
  textArea: {
    minHeight: 100,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.margin.medium,
  },
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: dimensions.margin.large,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.lightBackground,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    alignItems: 'center',
    marginBottom: dimensions.margin.medium,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    alignItems: 'center',
    marginTop: dimensions.margin.small,
  },
  deleteButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default EditMacroGoalScreen; 