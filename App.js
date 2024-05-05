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
      try {
        if (!action.payload || typeof action.payload.amount !== 'number') {
          console.error('Invalid transaction payload:', action.payload);
          throw new Error('Invalid transaction data');
        }
        return {
          ...state,
          transactions: [action.payload, ...state.transactions],
          error: null
        };
      } catch (error) {
        return { ...state, error: error.message };
      }
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
      let result;
      try {
        result = fn(n);
        cache[n] = result;
      } catch (error) {
        console.error('Failed to compute:', error);
        result = 0; 
      }
      return result;
    }
  }
}

const heavyComputation = memoize((transactions) => {
  if (!Array.isArray(transactions)) throw new Error("Invalid transactions array");
  return transactions.reduce((acc, transaction) => {
    if (typeof transaction.amount !== 'number') throw new Error("Invalid transaction amount");
    return acc + transaction.amount;
  }, 0);
});

const FinanceManagementApp = () => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    let isMounted = true;
    async function fetchFinances() {
      try {
        const response = await axios.get('/api/finances');
        if (isMounted) {
          dispatch({ type: actions.SET_FINANCES, payload: response.data });
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error.response && error.response.data.message ? error.response.data.message : "Failed to fetch finances. Please try again.";
          dispatch({ type: actions.SET_ERROR, payload: errorMessage });
          console.error('Fetch error:', error);
        }
      }
    }
    fetchFinances();
    return () => { isMounted = false; };
  }, []);

  const addTransaction = (transaction) => {
    try {
      if (!transaction || typeof transaction.amount !== 'number') {
        throw new Error("Invalid transaction data");
      }
      dispatch({ type: actions.ADD_TRANSACTION, payload: transaction });
    } catch (error) {
      console.error('Add transaction error:', error);
      dispatch({ type: actions.SET_ERROR, payload: error.message });
    }
  };

  const total = useMemo(() => {
    try {
      return heavyComputation(state.transactions);
    } catch (error) {
      console.error('Failed to compute total: ', error);
      dispatch({ type: actions.SET_ERROR, payload: 'Failed to compute total. Please check transaction data.' });
      return 0;
    }
  }, [state.transactions]);

  return (
    <FinanceContext.Provider value={{ state, addTransaction }}>
      <Container>
        <Header>Personal Finance Dashboard</Header>
        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
        <DisplayBalance balance={state.balance} />
        <TransactionList transactions={state.transactions} />
        <AddTransactionForm addTransaction={addTransaction} />
        {/* Assuming DisplayBalance, TransactionList, AddTransactionForm are implemented elsewhere */}
      </Container>
    </FinanceContext.Provider>
  );
};

const useFinance = () => useContext(FinanceContext);

export default FinanceManagementApp;
export { useFinance };