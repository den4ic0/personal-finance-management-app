import React from 'react';
import { SafeAreaView, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const initialState = {
  transactions: [],
  totalBudget: 0,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
        totalBudget: state.totalBudget - action.payload.amount,
      };
    default:
      return state;
  }
};

const store = createStore(reducer);

const Stack = createStackNavigator();

const TransactionList = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <Text>Transaction List</Text>
    <Button title="Add Transaction" onPress={() => navigation.navigate('AddTransaction')} />
  </SafeAreaView>
);

const AddTransaction = () => (
  <SafeAreaView style={styles.container}>
    <Text>Add Transaction</Text>
  </SafeAreaView>
);

const MainComponent = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TransactionList">
          <Stack.Screen name="TransactionList" component={TransactionList} options={{ title: 'Transactions' }} />
          <Stack.Screen name="AddTransaction" component={AddTransaction} options={{ title: 'Add Transaction' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainComponent;