import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useTheme } from "../contexts/ThemeContext";
import { getBaseUrl } from "../utils/config";
import { useBackendUserId } from "../utils/useBackendUserId";

function WishlistDetail() {
  const { wishlistName } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const {
    backendUserId,
    loading: backendUserLoading,
    error: backendUserError,
  } = useBackendUserId();

  // Add a fallback in case theme context is not available
  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    console.warn("Theme context not available:", error);
  }

  const API_BASE_URL = `${getBaseUrl()}/user`;

  // Emoji and comment modal state
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedItemForEmoji, setSelectedItemForEmoji] = useState(null);
  const [selectedItemForComment, setSelectedItemForComment] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [emojiLoading, setEmojiLoading] = useState(false);

  // Hardcoded emoji options
  const emojiOptions = [
    "😀",
    "🎉",
    "❤️",
    "👍",
    "🥳",
    "🔥",
    "😎",
    "🙏",
    "😂",
    "😍",
  ];

  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editItemData, setEditItemData] = useState(null);

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      fetchWishlistDetails();
    }
  }, [user, wishlistName]);

  const fetchWishlistDetails = async () => {
    try {
      setLoading(true);
      const email = user.emailAddresses[0].emailAddress;
      console.log("[FetchWishlistDetails] Fetching for email:", email);
      const response = await fetch(`${API_BASE_URL}/getwish/${email}`);
      console.log("[FetchWishlistDetails] Response received", response);
      const data = await response.json();
      console.log("[FetchWishlistDetails] Response JSON", data);
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
      console.error("[FetchWishlistDetails] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemImageUrl.trim() || !newItemPrice.trim())
      return;
    if (!backendUserId) {
      alert("User info not ready. Please try again in a moment.");
      return;
    }
    try {
      const email = user.emailAddresses[0].emailAddress;
      console.log(
        "[AddItem] Sending POST to backend to add item",
        newItemName,
        newItemImageUrl,
        newItemPrice,
        backendUserId,
        wishlistName
      );
      const response = await fetch(`${API_BASE_URL}/wish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName,
          imageUrl: newItemImageUrl,
          price: newItemPrice,
          baseId: backendUserId,
          listName: wishlistName,
        }),
      });
      console.log("[AddItem] Response received", response);
      const data = await response.json();
      console.log("[AddItem] Response JSON", data);
      if (response.ok) {
        setNewItemName("");
        setNewItemImageUrl("");
        setNewItemPrice("");
        setShowAddItemModal(false);
        fetchWishlistDetails(); // Always refetch from backend
      } else {
        alert(data.message || "Failed to add item");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error("[AddItem] Error:", err);
    }
  };

  // Filter out dummy product from the wishlist items
  const filteredItems =
    wishlist?.list?.filter(
      (item) => item.product?.name !== "dummy-product-for-list-creation"
    ) || [];

  // Utility to group emojis and count them
  function groupEmojis(emojiArr) {
    if (!Array.isArray(emojiArr)) return [];
    const counts = {};
    for (const e of emojiArr) {
      counts[e] = (counts[e] || 0) + 1;
    }
    // Convert to array of {emoji, count}
    return Object.entries(counts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Add emoji to product
  const handleAddEmoji = async (emoji) => {
    if (!selectedItemForEmoji) return;
    setEmojiLoading(true);
    console.log("[Emoji] Posting to /emoji", {
      email: wishlist.owner,
      wishlistName: wishlist.wName,
      productName: selectedItemForEmoji.product.name,
      emoji,
    });
    try {
      const response = await fetch(`${API_BASE_URL}/emoji`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: wishlist.owner || user.emailAddresses[0].emailAddress,
          name: wishlist.wName,
          pName: selectedItemForEmoji.product.name,
          emoji,
        }),
      });
      console.log("[Emoji] Response received", response);
      const data = await response.json();
      console.log("[Emoji] Response JSON", data);
      setShowEmojiModal(false);
      setSelectedItemForEmoji(null);
      fetchWishlistDetails();
    } catch (e) {
      console.error("[Emoji] Failed to add emoji", e);
      alert("Failed to add emoji");
    } finally {
      setEmojiLoading(false);
    }
  };

  // Add comment to product
  const handleAddComment = async () => {
    if (!selectedItemForComment || !commentText.trim()) return;
    setCommentLoading(true);
    console.log("[Comment] Posting to /comment", {
      email: user.emailAddresses[0].emailAddress,
      userName: user.firstName,
      name: wishlist.wName,
      pName: selectedItemForComment.product.name,
      comment: commentText,
      wishlist: wishlist,
    });
    try {
      const response = await fetch(`${API_BASE_URL}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: wishlist.owner,
          userName: user.firstName,
          name: wishlist.wName,
          pName: selectedItemForComment.product.name,
          comment: commentText,
        }),
      });
      console.log("[Comment] Response received", response);
      const data = await response.json();
      console.log("[Comment] Response JSON", data);
      setShowCommentModal(false);
      setSelectedItemForComment(null);
      setCommentText("");
      fetchWishlistDetails();
    } catch (e) {
      console.error("[Comment] Failed to add comment", e);
      alert("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Edit item handler
  const handleEditItem = async (e) => {
    e.preventDefault();
    if (!editItemData) return;
    const { name, imageUrl, price, oldName } = editItemData;
    if (!name.trim() || !imageUrl.trim() || !price.trim()) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/editwishitem`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.emailAddresses[0].emailAddress,
            wName: wishlist.wName,
            oldName,
            name,
            imageUrl,
            price,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setShowEditItemModal(false);
        setEditItemData(null);
        fetchWishlistDetails();
      } else {
        alert(data.message || "Failed to edit item");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error("[EditItem] Error:", err);
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

  if (backendUserLoading) {
    return <div>Loading user info...</div>;
  }

  if (backendUserError) {
    return <div>Error loading user info: {backendUserError}</div>;
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
          {filteredItems.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map((item, index) => {
                // Group emojis for this item
                const groupedEmojis = groupEmojis(item.emoji);
                const topEmoji = groupedEmojis[0];
                return (
                  <div key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex items-center gap-4">
                        {/* Product Image */}
                        {item.product?.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name || "Product"}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.product?.name || "Unnamed Item"}
                          </h3>
                          {item.product?.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {item.product.description}
                            </p>
                          )}
                          {/* Edit Button */}
                          <button
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium py-1 px-2 rounded-md transition-colors duration-200"
                            onClick={() => {
                              setEditItemData({
                                oldName: item.product?.name,
                                name: item.product?.name,
                                imageUrl: item.product?.imageUrl,
                                price: item.product?.price,
                              });
                              setShowEditItemModal(true);
                            }}
                          >
                            Edit
                          </button>
                          {/* Emoji Panel Trigger */}
                          <button
                            className="mt-2 text-yellow-500 hover:text-yellow-600 text-lg"
                            onClick={() => {
                              setSelectedItemForEmoji(item);
                              setShowEmojiModal(true);
                            }}
                          >
                            <span role="img" aria-label="Add Emoji" className="ml-2  mr-1">
                              😊
                            </span>{" "}
                             React
                          </button>
                          {/* Comment Panel Trigger */}
                          <button
                            className="ml-4 mt-2 text-blue-500 hover:text-blue-600 text-lg"
                            onClick={() => {
                              setSelectedItemForComment(item);
                              setShowCommentModal(true);
                            }}
                          >
                            <span role="img" aria-label="Add Comment" className="mr-1">
                              💬
                            </span>{" "}
                            Comment
                          </button>
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
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Grouped Emoji Display */}
                        {groupedEmojis.length > 0 && (
                          <div className="relative group cursor-pointer select-none">
                            {/* Show only the top emoji by default, but make it a button for better hover area */}
                            <button
                              className="text-lg font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                              tabIndex={0}
                              type="button"
                            >
                              {topEmoji.emoji}{" "}
                              <span className="text-xs text-gray-500">
                                {topEmoji.count}
                              </span>
                            </button>
                            {/* Tooltip with all emojis on hover */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 hidden group-hover:flex group-focus-within:flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 min-w-max pointer-events-none">
                              <div className="pointer-events-auto">
                                {groupedEmojis.map((g, i) => (
                                  <span
                                    key={i}
                                    className="flex items-center gap-2 text-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  >
                                    {g.emoji}{" "}
                                    <span className="text-xs text-gray-500">
                                      {g.count}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                <div className="mb-4">
                  <label
                    htmlFor="itemImageUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="itemImageUrl"
                    value={newItemImageUrl}
                    onChange={(e) => setNewItemImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter image URL"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="itemPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Price
                  </label>
                  <input
                    type="text"
                    id="itemPrice"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter price"
                    required
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
                    disabled={
                      !newItemName.trim() ||
                      !newItemImageUrl.trim() ||
                      !newItemPrice.trim()
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Emoji Modal */}
        {showEmojiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-xs mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pick an Emoji
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {emojiOptions.map((emoji, idx) => (
                  <button
                    key={idx}
                    className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => handleAddEmoji(emoji)}
                    disabled={emojiLoading}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEmojiModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add a Comment
              </h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                rows={3}
                placeholder="Type your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={commentLoading}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? "Adding..." : "Add Comment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditItemModal && editItemData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Item
              </h3>
              <form onSubmit={handleEditItem}>
                <div className="mb-4">
                  <label
                    htmlFor="editItemName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="editItemName"
                    value={editItemData.name}
                    onChange={(e) =>
                      setEditItemData({ ...editItemData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="editItemImageUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="editItemImageUrl"
                    value={editItemData.imageUrl}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="editItemPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Price
                  </label>
                  <input
                    type="text"
                    id="editItemPrice"
                    value={editItemData.price}
                    onChange={(e) =>
                      setEditItemData({
                        ...editItemData,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditItemModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Save Changes
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
