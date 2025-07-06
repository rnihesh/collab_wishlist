import React, { useContext } from "react";
import { SignUp } from "@clerk/clerk-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { dark } from "@clerk/themes";

function Signup() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SignUp
        appearance={{
          baseTheme: isDark ? dark : undefined,
          variables: {
            colorPrimary: "rgb(59, 130, 246)",
          },
        }}
        fallbackRedirectUrl="/"
        signInUrl="/signin"
      />
    </div>
  );
}

export default Signup;
