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

const TransactionList = ({ navigation }) => {
  const { transactions, totalBudget } = useSelector(state => state);

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item.description} - ${item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text>Transaction List (Total Budget: ${totalBudget})</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <Button title="Add Transaction" onPress={() => navigation.navigate('AddTransaction')} />
    </SafeAreaView>
  );
};

const AddTransaction = ({ navigation }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const addTransaction = () => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { id: Math.random(), description, amount: parseFloat(amount) },
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Submit" onPress={addTransaction} />
    </SafeAreaView>
  );
};

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
    margin: 20,
  },
  input: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  listItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default MainComponent;