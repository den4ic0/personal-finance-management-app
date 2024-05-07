import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

const AddTransactionScreen = ({ navigation }) => {
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  
  const dispatch = useDispatch();

  const handleTransactionAddition = useCallback(() => {
    if (transactionDescription.trim() && transactionAmount) {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: { 
          id: Math.random(), 
          description: transactionDescription.trim(), 
          amount: parseFloat(transactionAmount), 
        },
      });
      navigation.goBack();
    }
  }, [transactionDescription, transactionAmount, dispatch, navigation]);

  return (
    <div>
    </div>
  );
};

export default AddTransactionScreen;