import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAppContext } from '../store';
import authService from '../services/auth/authService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const SignupScreen = ({ navigation }) => {
  const { dispatch } = useAppContext();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateInputs = () => {
    // Reset error
    setError('');
    
    // Check for empty fields
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    
    // Validate display name length
    if (displayName.length < 3) {
      setError('Name must be at least 3 characters');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await authService.register(email, password, displayName);
      
      // Registration successful, update global state
      dispatch({ 
        type: 'SET_USER', 
        payload: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        } 
      });
      
      // App.js will handle navigation based on auth state
    } catch (error) {
      // Handle registration errors with user-friendly messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password';
      }
      
      setError(errorMessage);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MicroGoal and start tracking your habits</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={colors.lightText}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.lightText}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.lightText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.lightText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    padding: dimensions.padding.large,
    justifyContent: 'center',
  },
  title: {
    fontSize: dimensions.fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: dimensions.margin.small,
  },
  subtitle: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: dimensions.margin.xl,
  },
  inputContainer: {
    marginBottom: dimensions.margin.large,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    fontSize: dimensions.fontSize.medium,
    marginBottom: dimensions.margin.medium,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    marginBottom: dimensions.margin.medium,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    alignItems: 'center',
    marginBottom: dimensions.margin.large,
  },
  signupButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
  },
  loginButtonText: {
    color: colors.primary,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default SignupScreen; 