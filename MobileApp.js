import React, { memo } from 'react';

const TransactionListScreen = memo(({ navigation }) => {
});

const AddTransactionScreen = memo(({ navigation }) => {
});
```

```jsx
import React, { useState, useCallback } from 'react';

const AddTransactionScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleAddTransaction = useCallback(() => {
    if (transactionDescription && transactionAmount) {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: { id: Math.random(), description: transactionDescription, amount: parseFloat(transactionAmount) },
      });
      navigation.goBack();
    }
  }, [transactionDescription, transactionAmount, dispatch, navigation]);
};