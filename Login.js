export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null); // New State for holding authentication errors
  const [loading, setLoading] = useState(false); // New State for handling loading states

  const logIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { email, password });
      setCurrentUser(response.data.user);
      setAuthError(null);
    } catch (error) {
      console.error("Login attempt failed:", error);
      setAuthError("Failed to log in. Please check your credentials and try again."); // Set Error
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { email, password });
      await logIn(email, password); // This already handles setting currentUser
      setAuthError(null);
    } catch (error) {
      console.error("Signup attempt failed:", error);
      setAuthError("Failed to sign up. Please try again."); // Set Error
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    setCurrentUser(null);
    // Consider also handling server-side logout if applicable
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, login: logIn, register: signUp, logout: logOut, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthForm = ({ isLogin }) => {
  const { login, register, loading, authError } = useAuth();

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
              disabled={loading}
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
              disabled={loading}
            />
            {touched.password && errors.password && <div>{errors.password}</div>}
          </div>
          {authError && <div>{authError}</div>} {/* Display authentication errors */}
          <button type="submit" disabled={loading}>{isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
      )}
    </Formik>
  );
};