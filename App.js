import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`...`;
const Header = styled.h2`...`;
const Button = styled.button`...`;

const initialState = {
  balance: 0,
  transactions: [],
  budgets: [],
};

const actions = {
  SET_FINANCES: 'SET_FINANCES',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
};

const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch (action.type) {
    case actions.SET_FINANCES:
      return { ...state, ...action.payload };
    case actions.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    default:
      return state;
  }
};

const memoize = (fn) => {
  let cache = {};
  return (...args) => {
    let n = args[0]; 
    if (n in cache) {
      console.log('Fetching from cache');
      return cache[n];
    }
    else {
      console.log('Calculating result');
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  }
}

const heavyComputation = memoize((transactions) => {
  return transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
});

const FinanceManagementApp = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    async function fetchFinances() {
      const response = await axios.get('/api/finances');
      dispatch({ type: actions.SET_FINANCES, payload: response.data });
    }
    fetchFinances();
  }, []);

  const addTransaction = (transaction) => {
    dispatch({ type: actions.ADD_TRANSACTION, payload: transaction });
  };

  const total = useMemo(() => heavyComputation(state.transactions), [state.transactions]);

  return (
    <FinanceContext.Provider value={{ state, addTransaction }}>
      <Container>
        <Header>Personal Finance Dashboard</Header>
        <DisplayBalance balance={state.balance} />
        <TransactionList transactions={state.transactions} />
        <AddTransactionForm addTransaction={addTransaction} />
      </Container>
    </FinanceContext.Provider>
  );
};

const useFinance = () => useContext(FinanceContext);

export default FinanceManagementApp;
export { useFinance };