import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { useAppContext } from '../store';
import goalService from '../services/firestore/goalService';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';
import ExpandableMacroGoalItem from '../components/common/ExpandableMacroGoalItem';
import GoalOnboarding, { shouldShowOnboarding } from '../components/common/GoalOnboarding';

const MacroGoalsListScreen = ({ navigation }) => {
  const { state, dispatch } = useAppContext();
  const { user } = state;
  const [macroGoals, setMacroGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const shouldShow = await shouldShowOnboarding();
      setShowOnboarding(shouldShow);
    };
    
    checkOnboarding();
  }, []);

  useEffect(() => {
    const fetchMacroGoals = async () => {
      try {
        console.log('[DIAG] MacroGoalsListScreen: Starting to fetch macro goals');
        console.log('[DIAG] MacroGoalsListScreen: User state:', user ? { uid: user.uid, email: user.email } : 'No user');
        
        setLoading(true);
        if (user && user.uid) {
          console.log(`[DIAG] MacroGoalsListScreen: Calling getMacroGoals with userId: ${user.uid}`);
          const goals = await goalService.getMacroGoals(user.uid);
          console.log(`[DIAG] MacroGoalsListScreen: Received ${goals.length} macro goals from service`);
          setMacroGoals(goals);
        } else {
          console.warn('[DIAG] MacroGoalsListScreen: No user or user.uid available for fetching goals');
          setMacroGoals([]);
        }
      } catch (err) {
        console.error('Error fetching macro goals:', err);
        console.error('[DIAG] MacroGoalsListScreen: Error type:', err.name, 'Message:', err.message);
        setError('Failed to load your macro goals. Please try again.');
      } finally {
        setLoading(false);
        console.log('[DIAG] MacroGoalsListScreen: Completed fetchMacroGoals (success or failure)');
      }
    };

    console.log('[DIAG] MacroGoalsListScreen: useEffect triggered, about to fetch goals');
    fetchMacroGoals();
  }, [user]);

  const handleEditMacroGoal = (goalId) => {
    navigation.navigate('EditMacroGoal', { goalId });
  };

  const renderMacroGoalItem = ({ item }) => (
    <ExpandableMacroGoalItem
      macroGoal={item}
      onEdit={handleEditMacroGoal}
      navigation={navigation}
    />
  );

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Macro Goals</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {/* Toggle between all/regular/anti goals */}}
        >
          <Text style={styles.filterButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
              goalService.getMacroGoals(user.uid)
                .then(goals => setMacroGoals(goals))
                .catch(err => setError('Failed to load macro goals. Please try again.'))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : macroGoals.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No macro goals yet.</Text>
          <Text style={styles.emptySubText}>Tap the + button to add your first goal!</Text>
        </View>
      ) : (
        <FlatList
          data={macroGoals}
          renderItem={renderMacroGoalItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('EditMacroGoal')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {showOnboarding && (
        <GoalOnboarding onClose={handleCloseOnboarding} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: dimensions.padding.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.margin.large,
  },
  title: {
    fontSize: dimensions.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    padding: dimensions.padding.small,
  },
  filterButtonText: {
    fontSize: dimensions.fontSize.xl,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: dimensions.padding.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: dimensions.fontSize.large,
    textAlign: 'center',
    marginBottom: dimensions.margin.medium,
    paddingHorizontal: dimensions.padding.large,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: dimensions.padding.large,
    paddingVertical: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.medium,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: dimensions.fontSize.large,
    color: colors.text,
    textAlign: 'center',
    marginBottom: dimensions.margin.small,
  },
  emptySubText: {
    fontSize: dimensions.fontSize.medium,
    color: colors.lightText,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: dimensions.margin.large,
    bottom: dimensions.margin.large,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: 32,
    color: colors.background,
  },
});

export default MacroGoalsListScreen;
