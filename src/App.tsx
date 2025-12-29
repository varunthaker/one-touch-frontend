import "./css/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import SabhaSelector from "./components/sabhaCenter/SabhaSelector";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import useThemeStore from "./store/useThemeStore";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ClerkProvider, SignIn } from "@clerk/clerk-react";

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

  // Get Clerk publishable key from environment variables
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Routes>
              <Route 
                path="/sign-in" 
                element={<SignIn />}
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
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
