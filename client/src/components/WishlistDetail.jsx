import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "../contexts/ThemeContext";
import { getBaseUrl } from "../utils/config";

function WishlistDetail() {
  const { wishlistName } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Add a fallback in case theme context is not available
  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    console.warn("Theme context not available:", error);
  }

  const API_BASE_URL = `${getBaseUrl()}/user`;

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      fetchWishlistDetails();
    }
  }, [user, wishlistName]);

  const fetchWishlistDetails = async () => {
    try {
      setLoading(true);
      const email = user.emailAddresses[0].emailAddress;
      const response = await fetch(`${API_BASE_URL}/getwish/${email}`);
      const data = await response.json();

      if (response.ok) {
        // Find the specific wishlist
        const foundWishlist =
          data.ownWishlists?.find((wl) => wl.wName === wishlistName) ||
          data.sharedWishlists?.find((wl) => wl.wName === wishlistName);

        if (foundWishlist) {
          setWishlist(foundWishlist);
        } else {
          setError("Wishlist not found");
        }
      } else {
        setError(data.message || "Failed to fetch wishlist");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      const email = user.emailAddresses[0].emailAddress;
      const response = await fetch(`${API_BASE_URL}/wish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName,
          baseId: user.id, // This would need to be the backend user ID
          listName: wishlistName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setNewItemName("");
        setShowAddItemModal(false);
        fetchWishlistDetails(); // Refresh the list
      } else {
        alert(data.message || "Failed to add item");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading wishlist...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-4 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {wishlist?.wName}
              </h1>
              {wishlist?.owner && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Shared by {wishlist.owner}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowAddItemModal(true)}
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
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {wishlist?.list && wishlist.list.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {wishlist.list.map((item, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.product?.name || "Unnamed Item"}
                      </h3>
                      {item.product?.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {item.product.description}
                        </p>
                      )}
                      {item.comment && item.comment.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Comments:
                          </p>
                          {item.comment.map((comment, commentIndex) => (
                            <div
                              key={commentIndex}
                              className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                            >
                              <span className="font-medium">
                                {comment.name}:
                              </span>{" "}
                              {comment.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.emoji && item.emoji.length > 0 && (
                        <div className="flex space-x-1">
                          {item.emoji.map((emoji, emojiIndex) => (
                            <span key={emojiIndex} className="text-lg">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                No items in this wishlist yet.
              </p>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Add Your First Item
              </button>
            </div>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Item to "{wishlist?.wName}"
              </h3>

              <form onSubmit={handleAddItem}>
                <div className="mb-4">
                  <label
                    htmlFor="itemName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter item name"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newItemName.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistDetail;
