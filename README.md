# <img src="./client/public/wishlist.png" width=30px/>  Wishlist App – React Frontend

A modern, responsive React 19 application for managing wishlists. Built with Tailwind CSS, Clerk authentication, and a clean dark/light UI toggle. Seamlessly integrates with a Node.js backend for a complete full-stack experience.

---

## ✨ Features

* 🔐 **Clerk Authentication** – Secure sign-in/sign-up flows
* 🌗 **Dark/Light Mode** – Easily toggle themes with context
* 📱 **Fully Responsive** – Mobile-first design, optimized across devices
* 🧠 **Smart UI** – Modern design using Tailwind CSS v4
* 📝 **Wishlist Management** – Create, view, and share your wishlists with ease

---

## 🚀 Getting Started

### 1. **Install Dependencies**

```bash
npm install
```

### 2. **Environment Variables**

Create a `.env` file in the root of the project:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

🔗 [Get your Clerk key](https://dashboard.clerk.com/)

### 3. **Start Development Server**

```bash
npm run dev
```

### 4. **Build for Production**

```bash
npm run build
```

---

## 📁 Folder Structure

```bash
src/
├── App.css
├── App.jsx               # Root React component
├── main.jsx              # Entry point
├── index.css             # Tailwind CSS import
├── assets/
│   └── react.svg         # Static assets
├── components/
│   ├── auth/
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── common/
│   │   ├── Header.jsx    # Top navigation with theme toggle
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── CreateWishlistModal.jsx
│   ├── Dashboard.jsx
│   ├── LandingPage.jsx
│   ├── WishlistCard.jsx
│   └── WishlistDetail.jsx
├── contexts/
│   └── ThemeContext.jsx  # Manages dark/light mode state
├── utils/
│   ├── config.js
│   └── useBackendUserId.js # Hook for user mapping
```

---

## 🔗 Backend Integration

Connects to your Express.js backend at `http://localhost:4000`. Required endpoints:

| Endpoint               | Method | Description               |
| ---------------------- | ------ | ------------------------- |
| `/user/user`           | POST   | Create/login a user       |
| `/user/getwish/:email` | GET    | Retrieve user's wishlists |
| `/user/wish`           | POST   | Add an item to a wishlist |
| `/user/share`          | POST   | Share a wishlist          |
| `/user/renamewishlist` | POST   | Rename a wishlist         |
| `/user/editwishitem`   | POST   | Edit a product            |
| `/user/emoji`          | POST   | React with emoji to a product|
| `/user/comment`        | POST   | Comment a product         |

Ensure the backend is running with the following structure:

```bash
Backend/
├── APIs/
│   ├── createUser.js
│   └── userApi.js
├── models/
│   ├── product.model.js
│   └── user.model.js
├── server.js
├── package.json
└── package-lock.json
```

---

## 🛠️ Tech Stack

* ⚛️ **React 19** – Modern components and hooks
* 🎨 **Tailwind CSS v4** – Utility-first, fast styling
* 🔐 **Clerk** – Authentication and user identity
* 🌍 **React Router** – Seamless navigation
* ⚡ **Vite** – Ultra-fast dev server and bundler

---

## 💡 Tip

* Use `useBackendUserId.js` to map Clerk's auth data with your backend's user schema.
* Theme switching is managed via `ThemeContext` – customizable and persistent.

---
