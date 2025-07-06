import React, { useContext } from "react";
import { SignIn } from "@clerk/clerk-react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { dark } from "@clerk/themes";

function Signin() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SignIn
        appearance={{
          baseTheme: isDark ? dark : undefined,
          variables: {
            colorPrimary: "rgb(59, 130, 246)",
          },
        }}
        fallbackRedirectUrl="/"
        signUpUrl="/signup"
      />
    </div>
  );
}

export default Signin;
