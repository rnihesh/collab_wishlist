import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import WishlistCard from "./WishlistCard";
import CreateWishlistModal from "./CreateWishlistModal";
import { getBaseUrl } from "../utils/config";
import { useBackendUserId } from "../utils/useBackendUserId";

function Dashboard() {
  const { user } = useUser();
  const {
    backendUserId,
    loading: backendUserLoading,
    error: backendUserError,
  } = useBackendUserId();
  const [wishlists, setWishlists] = useState([]);
  const [sharedWishlists, setSharedWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = `${getBaseUrl()}`;

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      fetchWishlists();
    }
  }, [user]);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const email = user.emailAddresses[0].emailAddress;
      console.log("[FetchWishlists] Fetching wishlists for email:", email);
      const response = await fetch(`${API_BASE_URL}/user/getwish/${email}`);
      console.log("[FetchWishlists] Response received", response);
      const data = await response.json();
      console.log("[FetchWishlists] Response JSON", data);
      if (response.ok) {
        setWishlists(data.ownWishlists || []);
        setSharedWishlists(data.sharedWishlists || []);
      } else {
        setError(data.message || "Failed to fetch wishlists");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("[FetchWishlists] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWishlist = async (wishlistName) => {
    try {
      if (!backendUserId) {
        alert("User info not ready. Please try again in a moment.");
        return;
      }
      console.log(
        "[CreateWishlist] Sending POST to /createwishlist to create wishlist",
        wishlistName,
        backendUserId
      );
      const response = await fetch(`${API_BASE_URL}/user/createwishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseId: backendUserId,
          wName: wishlistName,
        }),
      });
      console.log("[CreateWishlist] Response received", response);
      const data = await response.json();
      console.log("[CreateWishlist] Response JSON", data);
      if (!response.ok) {
        setError(data.message || "Failed to create wishlist.");
        return;
      }
      await fetchWishlists();
      setShowCreateModal(false);
    } catch (err) {
      setError("Failed to create wishlist");
      console.error("[CreateWishlist] Error:", err);
    }
  };

  if (backendUserLoading) {
    return <div>Loading user info...</div>;
  }
  if (backendUserError) {
    return <div>Error loading user info: {backendUserError}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your wishlists...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Wishlists
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your wishlists
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Create Wishlist Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create New Wishlist</span>
          </button>
        </div>

        {/* My Wishlists Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span role="img" aria-label="My Lists">
              📝
            </span>{" "}
            My Wishlists
          </h2>
          {wishlists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                No wishlists yet. Create your first one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlists.map((wishlist, index) => (
                <WishlistCard
                  key={index}
                  wishlist={wishlist}
                  isOwner={true}
                  onUpdate={fetchWishlists}
                  showPrice={true}
                  showEmoji={true}
                  showComment={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shared Wishlists Section */}
        {sharedWishlists.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span role="img" aria-label="Shared">
                🤝
              </span>{" "}
              Shared with Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedWishlists.map((wishlist, index) => (
                <WishlistCard
                  key={index}
                  wishlist={wishlist}
                  isOwner={false}
                  onUpdate={fetchWishlists}
                  showPrice={true}
                  showEmoji={true}
                  showComment={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Wishlist Modal */}
        {showCreateModal && (
          <CreateWishlistModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateWishlist}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
