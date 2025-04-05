import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  ScrollView,
  Image
} from 'react-native';
import colors from '../../constants/colors';
import dimensions from '../../constants/dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = 'goal_onboarding_shown';

const GoalOnboarding = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: "Welcome to Goal Tracking",
      description: "Let's understand how to effectively achieve your goals with our two-level approach.",
      color: colors.primary
    },
    {
      title: "Macro Goals: The Outcome",
      description: "Macro goals represent what you want to achieve - your desired end results and outcomes.",
      color: colors.secondary
    },
    {
      title: "Micro Goals: The Process",
      description: "Micro goals are the daily actions and habits that will lead you to your macro goals.",
      color: colors.success || '#28a745'
    },
    {
      title: "Focus on the Process",
      description: "By focusing on your daily micro goals (the process), you'll naturally progress toward your macro goals (the outcome).",
      color: colors.info || '#17a2b8'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.stepIndicators}>
              {steps.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.stepDot,
                    currentStep === index && styles.activeStepDot
                  ]}
                />
              ))}
            </View>

            <View style={styles.imageContainer}>
              <View 
                style={[
                  styles.imagePlaceholder,
                  { backgroundColor: steps[currentStep].color }
                ]}
              >
                <Text style={styles.imagePlaceholderText}>
                  {steps[currentStep].title}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.description}>{steps[currentStep].description}</Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            {currentStep > 0 ? (
              <TouchableOpacity style={styles.button} onPress={handlePrevious}>
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper to check if onboarding has been shown
export const shouldShowOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value !== 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return true; // Default to showing onboarding if there's an error
  }
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    height: height * 0.7,
    backgroundColor: colors.background,
    borderRadius: dimensions.borderRadius.large,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: dimensions.padding.large,
    alignItems: 'center',
  },
  stepIndicators: {
    flexDirection: 'row',
    marginBottom: dimensions.margin.large,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.divider,
    marginHorizontal: 5,
  },
  activeStepDot: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.3,
    marginBottom: dimensions.margin.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: dimensions.padding.medium,
  },
  title: {
    fontSize: dimensions.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.medium,
    textAlign: 'center',
  },
  description: {
    fontSize: dimensions.fontSize.large,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: dimensions.margin.large,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: dimensions.padding.large,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  button: {
    paddingVertical: dimensions.padding.medium,
    paddingHorizontal: dimensions.padding.large,
    borderRadius: dimensions.borderRadius.medium,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.primary,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: dimensions.padding.medium,
    paddingHorizontal: dimensions.padding.large,
    minWidth: 100,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.lightText,
    fontSize: dimensions.fontSize.medium,
  },
});

export default GoalOnboarding; 