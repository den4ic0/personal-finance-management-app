import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`...`;
const Header = styled.h2`...`;
const Button = styled.button`...`;
const ErrorMessage = styled.p`color: red;`;

const initialState = {
  balance: 0,
  transactions: [],
  budgets: [],
  error: null,
};

const actions = {
  SET_FINANCES: 'SET_FINANCES',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_ERROR: 'SET_ERROR',
};

const FinanceContext = createContext();

const financeReducer = (state, action) => {
  switch (action.type) {
    case actions.SET_FINANCES:
      return { ...state, ...action.payload, error: null };
    case actions.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case actions.SET_ERROR:
      return { ...state, error: action.payload };
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
    } else {
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
      try {
        const response = await axios.get('/api/finances');
        dispatch({ type: actions.SET_FINANCES, payload: response.data });
      } catch (error) {
        dispatch({ type: actions.SET_ERROR, payload: "Failed to fetch finances. Please try again." });
      }
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
        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
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