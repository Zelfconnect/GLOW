import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Switch
} from 'react-native';
import { useAppContext } from '../store';
import colors from '../constants/colors';
import dimensions from '../constants/dimensions';

const SettingsScreen = () => {
  const { state, dispatch } = useAppContext();
  const { user } = state;

  const handleLogout = async () => {
    try {
      // Dispatch logout action - assuming you have this in your context
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{user?.email || 'Not available'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Theme</Text>
          <Switch 
            value={false} 
            // This would normally update a state or context
            onValueChange={() => {}} 
            trackColor={{ false: colors.lightBackground, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch 
            value={true}
            // This would normally update a state or context
            onValueChange={() => {}} 
            trackColor={{ false: colors.lightBackground, true: colors.primary }}
            thumbColor={colors.background}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: dimensions.padding.medium,
  },
  title: {
    fontSize: dimensions.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.large,
  },
  section: {
    marginBottom: dimensions.margin.large,
    backgroundColor: colors.cardBackground,
    borderRadius: dimensions.borderRadius.medium,
    padding: dimensions.padding.medium,
  },
  sectionTitle: {
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: dimensions.margin.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: dimensions.padding.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBackground,
  },
  settingLabel: {
    fontSize: dimensions.fontSize.medium,
    color: colors.text,
  },
  settingValue: {
    fontSize: dimensions.fontSize.medium,
    color: colors.textLight,
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: dimensions.padding.medium,
    borderRadius: dimensions.borderRadius.medium,
    alignItems: 'center',
    marginTop: dimensions.margin.large,
    marginBottom: dimensions.margin.xxl,
  },
  logoutButtonText: {
    color: colors.background,
    fontSize: dimensions.fontSize.large,
    fontWeight: 'bold',
  },
});

export default SettingsScreen; 