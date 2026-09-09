import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import useThemeStore from "./store/useThemeStore";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignIn from "./components/auth/SignIn";
import ChangePassword from "./components/auth/ChangePassword";

// Lazy load route components for code splitting
const Layout = lazy(() => import("./components/layout/Layout"));
const SabhaSelector = lazy(() => import("./components/sabhaCenter/SabhaSelector"));

// Loading fallback component
const LoadingFallback = () => <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>;

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
    },
  });

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/sign-in"
                element={<SignIn />}
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <SabhaSelector />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/layout"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sabhacenterselector"
                element={
                  <ProtectedRoute>
                    <SabhaSelector />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
