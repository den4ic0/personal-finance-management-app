import React, { createContext, useContext, useState } from 'react';
import { Formik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';

const AuthenticationContext = createContext();

export const useAuthentication = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const authenticateUser = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { email, password });
      setAuthenticatedUser(response.data.user);
    } catch (error) {
      console.error("User login failed:", error);
    }
  };

  const createUserAccount = async (email, password) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { email, password });
      authenticateUser(email, password); // Reuse authenticateUser function for logging in after registration.
    } catch (error) {
      console.error("User registration failed:", error);
    }
  };

  const signOutUser = () => {
    setAuthenticatedUser(null);
  };

  return (
    <AuthenticationContext.Provider value={{ user: authenticatedUser, login: authenticateUser, register: createUserAccount, logout: signOutUser }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

const AuthenticationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const AuthenticationForm = ({ isLogin }) => {
  const { login: authenticateUser, register: createUserAccount } = useAuthentication();

  const handleFormSubmission = (values) => {
    if (isLogin) {
      authenticateUser(values.email, values.password);
    } else {
      createUserAccount(values.email, values.password);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={AuthenticationSchema}
      onSubmit={handleFormSubmission}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              value={values.email}
            />
            {touched.email && errors.email && <div>{errors.email}</div>}
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              value={values.password}
            />
            {touched.password && errors.password && <div>{errors.password}</div>}
          </div>
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
      )}
    </Formik>
  );
};