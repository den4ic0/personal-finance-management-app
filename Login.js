import React, { createContext, useContext, useState } from 'react';
import { Formik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const logIn = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { email, password });
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Login attempt failed:", error);
    }
  };

  const signUp = async (email, password) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { email, password });
      logIn(email, password);
    } catch (error) {
      console.error("Signup attempt failed:", error);
    }
  };

  const logOut = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, login: logIn, register: signUp, logout: logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const AuthForm = ({ isLogin }) => {
  const { login, register } = useAuth();

  const onSubmit = (values) => {
    const { email, password } = values;
    if (isLogin) {
      login(email, password);
    } else {
      register(email, password);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={AuthSchema}
      onSubmit={onSubmit}
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
          <button type="submit">{isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
      )}
    </Formik>
  );
};

export default AuthForm;