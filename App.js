import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  margin: 0 auto;
  max-width: 600px;
`;

const Header = styled.h2`
  text-align: center;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  margin: 10px 0;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

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

const DisplayBalance = ({ balance }) => (
  <div>Current Balance: ${balance}</div>
);

const TransactionList = ({ transactions }) => (
  <div>
    <Header>Recent Transactions</Header>
    {transactions.map((transaction, index) => (
      <div key={index}>
        {transaction.type}: ${transaction.amount} - {transaction.date}
      </div>
    ))}
  </div>
);

const AddTransactionForm = ({ addTransaction }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const { amount, type } = event.target.elements;
    addTransaction({ type: type.value, amount: parseFloat(amount.value) });
    event.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" name="amount" placeholder="Amount" required />
      <select name="type" required>
        <option value="">Select Type</option>
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </select>
      <Button type="submit">Add Transaction</Button>
    </form>
  );
};

const useFinance = () => useContext(FinanceContext);

export default FinanceManagementApp;
export { useFinance };