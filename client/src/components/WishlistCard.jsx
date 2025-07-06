import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBaseUrl } from "../utils/config";
import { Link } from "react-router-dom";
import { useBackendUserId } from "../utils/useBackendUserId";

function WishlistCard({
  wishlist,
  isOwner,
  onUpdate,
  showPrice,
  showEmoji,
  showComment,
}) {
  const { user } = useUser();
  const {
    backendUserId,
    loading: backendUserLoading,
    error: backendUserError,
  } = useBackendUserId();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState(wishlist.wName);
  const [isEditing, setIsEditing] = useState(false);

  const filteredItems = (wishlist.list || []).filter(
    (item) => item.product?.name !== "dummy-product-for-list-creation"
  );
  const itemCount = filteredItems.length;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    if (!backendUserId) {
      alert("User info not ready. Please try again in a moment.");
      return;
    }
    setIsSharing(true);
    try {
      const email = user.emailAddresses[0].emailAddress;
      const response = await fetch(`${getBaseUrl()}/user/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseId: backendUserId,
          name: wishlist.wName,
          toEmail: shareEmail,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShareEmail("");
        setShowShareModal(false);
        onUpdate();
      } else {
        alert(data.message || "Failed to share wishlist");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleEditWishlistName = async (e) => {
    e.preventDefault();
    if (!newWishlistName.trim() || newWishlistName === wishlist.wName) return;
    setIsEditing(true);
    try {
      const email = user.emailAddresses[0].emailAddress;
      const requestBody = {
        email,
        oldName: wishlist.wName,
        newName: newWishlistName,
      };
      console.log(
        "[RenameWishlist] Sending POST to /user/renamewishlist",
        requestBody
      );
      const response = await fetch(`${getBaseUrl()}/user/renamewishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      console.log("[RenameWishlist] Response received", response);
      const data = await response.json();
      console.log("[RenameWishlist] Response JSON", data);
      if (response.ok) {
        setShowEditModal(false);
        onUpdate();
      } else {
        alert(data.message || "Failed to rename wishlist");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  if (backendUserLoading) {
    return <div>Loading user info...</div>;
  }
  if (backendUserError) {
    return <div>Error loading user info: {backendUserError}</div>;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span role="img" aria-label="Wishlist">
                🎁
              </span>{" "}
              {wishlist.wName}
            </h3>
            {!isOwner && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shared by {wishlist.owner}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isOwner && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                title="Share wishlist"
              >Share 
                <span role="img" aria-label="Share" className="ml-2">
                  🔗
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {itemCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Items
              </div>
            </div>
            {isOwner && wishlist.hasAccessTo && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {wishlist.hasAccessTo.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Shared
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Preview (show up to 2 items) */}
        {itemCount > 0 && (
          <div className="mb-4">
            {filteredItems.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                className="mb-2 p-2 rounded bg-gray-50 dark:bg-gray-700 flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  {/* Product Image */}
                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name || "Product"}
                      className="w-8 h-8 object-cover rounded border border-gray-200 dark:border-gray-700"
                    />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.product?.name}
                  </span>
                  {showPrice && item.product?.price && (
                    <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                      ₹{item.product.price}
                    </span>
                  )}
                  {showEmoji && item.emoji && item.emoji.length > 0 && (
                    <span className="ml-2 flex gap-1">
                      {item.emoji.map((e, i) => (
                        <span key={i}>{e}</span>
                      ))}
                    </span>
                  )}
                </div>
                {showComment && item.comment && item.comment.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    <span role="img" aria-label="Comment">
                      💬
                    </span>{" "}
                    {item.comment.map((c, ci) => (
                      <span key={ci}>
                        <b>{c.name}:</b> {c.text}{" "}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {itemCount > 2 && (
              <div className="text-xs text-gray-400 mt-1">
                ...and {itemCount - 2} more
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/wishlist/${encodeURIComponent(wishlist.wName)}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 text-center"
          >
            View Items
          </Link>
          {isOwner && (
            <button
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200"
              onClick={() => setShowEditModal(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Share "{wishlist.wName}"
            </h3>
            <form onSubmit={handleShare}>
              <div className="mb-4">
                <label
                  htmlFor="shareEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="shareEmail"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSharing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50"
                >
                  {isSharing ? "Sharing..." : "Share"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Wishlist Name
            </h3>
            <form onSubmit={handleEditWishlistName}>
              <div className="mb-4">
                <label
                  htmlFor="editWishlistName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Wishlist Name
                </label>
                <input
                  type="text"
                  id="editWishlistName"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isEditing ||
                    !newWishlistName.trim() ||
                    newWishlistName === wishlist.wName
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default WishlistCard;
