import React, { useState } from 'react';
import { SafeAreaView, Text, Button, StyleSheet, TextInput, FlatList, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createStore } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';

const initialState = {
  transactions: [],
  totalBudget: 0,
};

const budgetReducer = (state = initialState, action) => {
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

const budgetStore = createStore(budgetReducer);

const StackNavigator = createStackNavigator();

const TransactionListScreen = ({ navigation }) => {
  const { transactions, totalBudget } = useSelector(state => state);

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text>{item.description} - ${item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Text>Transaction List (Total Budget: ${totalBudget})</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id.toString()}
      />
      <Button title="Add Transaction" onPress={() => navigation.navigate('AddTransactionScreen')} />
    </SafeAreaView>
  );
};

const AddTransactionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');

  const handleAddTransaction = () => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { id: Math.random(), description: transactionDescription, amount: parseFloat(transactionAmount) },
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={transactionDescription}
        onChangeText={setTransactionDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={transactionAmount}
        onChangeText={setTransactionAmount}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={handleAddTransaction} />
    </SafeAreaView>
  );
};

const BudgetApp = () => {
  return (
    <Provider store={budgetStore}>
      <NavigationContainer>
        <StackNavigator.Navigator initialRouteName="TransactionListScreen">
          <StackNavigator.Screen name="TransactionListScreen" component={TransactionListScreen} options={{ title: 'Transactions' }} />
          <StackNavigator.Screen name="AddTransactionScreen" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
        </StackNavigator.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  input: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  transactionItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default BudgetApp;