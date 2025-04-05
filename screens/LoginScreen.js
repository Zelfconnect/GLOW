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
  Alert
} from 'react-native';
import { useAppContext } from '../store';
import authService from '../services/auth/authService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const LoginScreen = ({ navigation }) => {
  const { dispatch } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const userCredential = await authService.login(email, password);
      
      // Authentication successful, update global state
      dispatch({ 
        type: 'SET_USER', 
        payload: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName
        } 
      });
      
      // No need to navigate here as App.js will handle navigation based on auth state
    } catch (error) {
      // Handle authentication errors with user-friendly messages
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password');
      return;
    }

    authService.resetPassword(email)
      .then(() => {
        Alert.alert(
          'Password Reset Email Sent', 
          'Please check your email to reset your password'
        );
      })
      .catch(error => {
        let errorMessage = 'Failed to send password reset email. Please try again.';
        
        if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address';
        } else if (error.code === 'auth/user-not-found') {
          // For security reasons, we might want to show the same message even if user doesn't exist
          errorMessage = 'If an account exists with this email, a password reset link will be sent';
        }
        
        Alert.alert('Error', errorMessage);
        console.error('Password reset error:', error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>MicroGoal</Text>
          <Text style={styles.subtitle}>Building habits that matter</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
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

            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToSignup}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
    alignItems: 'center',
    marginBottom: dimensions.margin.large,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: dimensions.margin.medium,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: dimensions.fontSize.small,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: colors.text,
    fontSize: dimensions.fontSize.medium,
  },
  signupButtonText: {
    color: colors.primary,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 