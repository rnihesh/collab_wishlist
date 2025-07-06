# Wishlist App - React Frontend

A modern React application with Tailwind CSS, dark/light mode, and Clerk authentication.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication and management
- 🌙 **Dark/Light Mode** - Toggle between themes with Tailwind CSS
- 📱 **Responsive Design** - Works on all device sizes
- 🎨 **Modern UI** - Clean and beautiful interface
- 📋 **Wishlist Management** - Create, share, and manage wishlists

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the client directory:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```

   Get your Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com/)

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── SignIn.jsx      # Clerk SignIn component
│   │   └── SignUp.jsx      # Clerk SignUp component
│   ├── common/
│   │   └── Header.jsx      # Header with theme toggle
│   ├── Dashboard.jsx       # Main dashboard
│   ├── WishlistCard.jsx    # Individual wishlist card
│   └── CreateWishlistModal.jsx # Create wishlist modal
├── contexts/
│   └── ThemeContext.jsx    # Dark/light mode context
├── App.jsx                 # Main app component
└── index.css              # Tailwind CSS imports
```

## Backend Integration

This frontend integrates with your Express.js backend running on `http://localhost:4000`. Make sure your backend is running and has the following endpoints:

- `POST /user/user` - User creation/login
- `GET /user/getwish/:email` - Get user wishlists
- `POST /user/wish` - Add item to wishlist
- `POST /user/share` - Share wishlist

## Technologies Used

- **React 19** - Modern React with hooks
- **Tailwind CSS v4** - Utility-first CSS framework
- **Clerk** - Authentication and user management
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
