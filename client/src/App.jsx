import React, { useEffect } from "react";
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
import { getBaseUrl } from "./utils/config";

//toast

import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// You'll need to add your Clerk publishable key to environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  
  useEffect(() => {
    (async () => {
      const conn = navigator.connection || {};
      const hasBatteryAPI = "getBattery" in navigator;
      let bat = { level: null, charging: null };

      if (hasBatteryAPI) {
        try {
          const battery = await navigator.getBattery();
          bat.level = battery.level;
          bat.charging = battery.charging;
        } catch (e) {
          // console.warn("Battery API error:", e);
        }
      }
      const payload = {
        url: location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        touchSupport: "ontouchstart" in window,
        orientation: screen.orientation.type,
        batteryLevel: bat.level,
        charging: bat.charging,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      if (import.meta.env.MODE === "production") {
        fetch("https://tra-7e6267.onrender.com/tra", {
          // fetch("http://localhost:3000/tra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    })();
  }, []);

   useEffect(() => {
    const pingBackend = async () => {
      console.log("Ping backend started...");
      console.log("Base URL:", getBaseUrl());

      const pingPromise = fetch(`${getBaseUrl()}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      }).then(async (response) => {
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.text();
          console.log("Response data:", data);
          return data;
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      });

      // Use toast.promise for automatic loading/success/error handling
      toast.promise(
        pingPromise,
        {
          pending: "Waking up server, please wait...",
          success: "Server is ready! 🎉",
          error: {
            render({ data }) {
              console.error("Connection error:", data);
              return `Failed to connect: ${data.message}`;
            },
          },
        },
        {
          autoClose: 2000,
        }
      );
    };

    // Run the ping
    pingBackend();

    // Once working, add the production check:
    // if (import.meta.env.MODE === "production") {
    //   pingBackend();
    // }
  }, []);

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
              <Footer />
            </SignedIn>

            <SignedOut>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </SignedOut>

            <ToastContainer
            position="bottom-right"
            autoClose={3000}
            limit={1}
          />
          </div>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
