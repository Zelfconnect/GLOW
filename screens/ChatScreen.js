import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAppContext } from '../store';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';
import geminiService from '../services/ai/geminiService';
import goalService from '../services/firestore/goalService';

const ChatScreen = () => {
  const { state } = useAppContext();
  const { user } = state;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [userGoals, setUserGoals] = useState({
    macroGoals: [],
    microGoals: []
  });
  
  const flatListRef = useRef(null);
  
  // Initial welcome messages
  useEffect(() => {
    const welcomeMessages = [
      {
        id: Date.now().toString(),
        text: 'Welcome to MicroGoal AI Coach! I\'m here to help you stay accountable and motivated.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      },
      {
        id: (Date.now() + 1).toString(),
        text: 'You can ask me questions about your goals, or ask for advice and motivation.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      }
    ];
    
    setMessages(welcomeMessages);
    
    // Load goal data and provide initial coaching if user is logged in
    const loadInitialAdvice = async () => {
      try {
        if (user && user.uid) {
          setIsLoading(true);
          
          // Fetch both macro and micro goals
          const macroGoals = await goalService.getMacroGoals(user.uid);
          const microGoals = await goalService.getTodaysMicroGoals(user.uid);
          
          // Store goals in state for later use
          setUserGoals({
            macroGoals,
            microGoals
          });
          
          if (macroGoals.length > 0) {
            // Get AI advice based on user's goals and completions
            const advice = await geminiService.getGoalCoachingAdvice(macroGoals, microGoals);
            
            setMessages(prev => [
              ...prev,
              {
                id: Date.now().toString(),
                text: advice,
                sender: 'ai',
                timestamp: new Date().toISOString(),
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error getting initial advice:', error);
        
        // Add a fallback message if there's an error
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "I'm having trouble analyzing your goals right now. Please try asking me a question about your goals or habits.",
            sender: 'ai',
            timestamp: new Date().toISOString(),
          }
        ]);
      } finally {
        setIsLoading(false);
        setInitializing(false);
      }
    };
    
    loadInitialAdvice();
  }, [user]);
  
  // Refresh goals data when user interacts with the AI
  const refreshGoalsData = async () => {
    if (!user || !user.uid) return;
    
    try {
      const macroGoals = await goalService.getMacroGoals(user.uid);
      const microGoals = await goalService.getTodaysMicroGoals(user.uid);
      
      setUserGoals({
        macroGoals,
        microGoals
      });
      
      return { macroGoals, microGoals };
    } catch (error) {
      console.error('Error refreshing goals data:', error);
      return userGoals; // Return existing data on error
    }
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Clear input and add user message to the list
    setInputText('');
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      
      // Refresh goals data to get the most current context
      const { macroGoals, microGoals } = await refreshGoalsData();
      
      // Check if the user is asking about goals or habits
      const messageText = userMessage.text.toLowerCase();
      const isGoalRelated = messageText.includes('goal') || 
                            messageText.includes('habit') || 
                            messageText.includes('progress') ||
                            messageText.includes('streak');
      
      let response;
      
      if (isGoalRelated && (macroGoals.length > 0 || microGoals.length > 0)) {
        // For goal-related questions, use the enhanced coaching advice method
        response = await geminiService.getGoalCoachingAdvice(macroGoals, microGoals);
      } else {
        // For general questions, use the standard chat
        response = await geminiService.sendMessage(
          userMessage.text, 
          messages.slice(-10) // Send last 10 messages for context
        );
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date().toISOString(),
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Error',
        'Failed to get a response. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMessage = ({ item }) => (
    <View 
      style={[
        styles.messageContainer, 
        item.sender === 'user' ? styles.userMessage : styles.aiMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Coach</Text>
        {initializing && <Text style={styles.subtitle}>Initializing...</Text>}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Ask for advice or motivation..."
          placeholderTextColor={colors.lightText}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading && !initializing}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!inputText.trim() || isLoading || initializing) && styles.disabledButton
          ]} 
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading || initializing}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: dimensions.padding.medium,
    paddingTop: dimensions.padding.large,
    alignItems: 'center',
  },
  title: {
    fontSize: dimensions.fontSize.xl,
    fontWeight: 'bold',
    color: colors.background,
  },
  subtitle: {
    fontSize: dimensions.fontSize.small,
    color: colors.background,
    opacity: 0.8,
    marginTop: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: dimensions.padding.medium,
    paddingBottom: dimensions.padding.large,
  },
  messageContainer: {
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    marginBottom: dimensions.margin.medium,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    lineHeight: dimensions.fontSize.medium * 1.4,
  },
  timestamp: {
    color: colors.background,
    fontSize: dimensions.fontSize.tiny,
    opacity: 0.7,
    alignSelf: 'flex-end',
    marginTop: dimensions.margin.small,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: dimensions.padding.small,
    backgroundColor: colors.lightBackground,
    borderRadius: dimensions.borderRadius.medium,
    marginBottom: dimensions.margin.small,
    marginHorizontal: dimensions.margin.medium,
  },
  loadingText: {
    color: colors.text,
    marginLeft: dimensions.margin.small,
    fontSize: dimensions.fontSize.small,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: dimensions.padding.medium,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    color: colors.text,
    marginRight: dimensions.margin.small,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: dimensions.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
});

export default ChatScreen; 