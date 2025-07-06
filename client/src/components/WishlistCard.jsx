import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { getBaseUrl } from "../utils/config";
import { Link } from "react-router-dom";

function WishlistCard({ wishlist, isOwner, onUpdate }) {
  const { user } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const itemCount = wishlist.list?.length || 0;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;

    setIsSharing(true);
    try {
      const email = user.emailAddresses[0].emailAddress;
      const response = await fetch(`${getBaseUrl()}/user/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseId: user.id, // This would need to be the backend user ID
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

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
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

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/wishlist/${encodeURIComponent(wishlist.wName)}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 text-center"
          >
            View Items
          </Link>
          {isOwner && (
            <button className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200">
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
    </>
  );
}

export default WishlistCard;
