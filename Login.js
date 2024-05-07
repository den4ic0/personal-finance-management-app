import React, { useState } from 'react';
import { Formik } from 'formik';
import axios from 'axios';
import { AuthContext, useAuth } from './AuthContext';
import AuthSchema from './AuthSchema';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthError(null);
  };

  const handleAuthError = (error, message) => {
    console.error(`${message}:`, error);
    setAuthError(message);
    setLoading(false);
  };

  const logIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { email, password });
      handleLoginSuccess(response.data.user);
    } catch (error) {
      handleAuthError(error, "Failed to log in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { email, password });
      await logIn(email, password);
    } catch (error) {
      handleAuthError(error, "Failed to sign up. Please try again.");
    }
  };

  const logOut = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, login: logIn, register: signUp, logout: logOut, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthForm = ({ isLogin }) => {
  const { login, register, loading, authError } = useAuth();

  const handleSubmit = (values) => {
    const { email, password } = values;
    const action = isLogin ? login : register;
    action(email, password);
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={AuthSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <FieldGroup
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            value={values.email}
            error={touched.email && errors.email}
            loading={loading}
          />
          <FieldGroup
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={values.password}
            error={touched.password && errors.password}
            loading={loading}
          />
          {authError && <div>{authError}</div>}
          <button type="submit" disabled={loading}>{isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
      )}
    </Formik>
  );
};

const FieldGroup = ({ name, type, placeholder, onChange, value, error, loading }) => (
  <div>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      disabled={loading}
    />
    {error && <div>{error}</div>}
  </div>
);