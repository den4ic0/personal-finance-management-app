import React, { createContext, useContext, useState } from 'react';
import { Formik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { email, password });
      setUser(response.data.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { email, password });
      login(email, password); 
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const AuthForm = ({ isLogin }) => {
  const { login, register } = useAuth();

  const submitForm = (values) => {
    if (isLogin) {
      login(values.email, values.password);
    } else {
      register(values.email, values.password);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={AuthSchema}
      onSubmit={submitForm}
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