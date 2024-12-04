import React from 'react';
import { StyleSheet, View } from 'react-native';
import Home from './components/Home'; 

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <Home />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F9', 
    alignItems: 'center',
    justifyContent: 'center',
  },
});
