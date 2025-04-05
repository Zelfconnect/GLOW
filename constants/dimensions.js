import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default {
  screenWidth: width,
  screenHeight: height,
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xl: 32
  },
  margin: {
    small: 8,
    medium: 16,
    large: 24,
    xl: 32
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    round: 9999
  },
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
  }
}; 