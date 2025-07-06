import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/common/Header";
import Dashboard from "./components/Dashboard";
import WishlistDetail from "./components/WishlistDetail";
import LandingPage from "./components/LandingPage";
import Signin from "./components/auth/SignIn";
import Signup from "./components/auth/SignUp";
import "./App.css";
import Footer from "./components/common/Footer";

// You'll need to add your Clerk publishable key to environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Clerk Configuration Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please add your Clerk publishable key to the environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <SignedIn>
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/wishlist/:wishlistName"
                  element={<WishlistDetail />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer/>
            </SignedIn>

            <SignedOut>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer/>
            </SignedOut>
          </div>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
