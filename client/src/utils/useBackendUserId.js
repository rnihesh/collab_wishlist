import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBaseUrl } from "./config";

export function useBackendUserId() {
  const { user, isSignedIn } = useUser();
  const [backendUserId, setBackendUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrCreateUser() {
      if (!isSignedIn || !user) {
        setBackendUserId(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const name = user.fullName || user.firstName || user.username || "";
        const email = user.emailAddresses?.[0]?.emailAddress;
        const lastName = user.lastName || "";
        const imageUrl = user.imageUrl || "";
        if (!email) throw new Error("No email found for user");
        const response = await fetch(`${getBaseUrl()}/user/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, imageUrl }),
        });
        const data = await response.json();
        if (response.ok && data.payload && data.payload._id) {
          setBackendUserId(data.payload._id);
        } else if (data.payload && data.payload._id) {
          setBackendUserId(data.payload._id);
        } else {
          setError(data.message || "Failed to get backend user ID");
        }
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrCreateUser();
  }, [user, isSignedIn]);

  return { backendUserId, loading, error };
}
