* Setup instructions
* Tech stack
* Assumptions & limitations


# <img src="./client/public/wishlist.png" width=30px/>  Wishlist App – WishyL


A modern React 19 wishlist management application featuring Tailwind CSS, Clerk authentication, and a responsive UI with dark/light mode. Integrates with an Express.js backend.

---
### Watch the demo
<a href="https://drive.google.com/file/d/1viNb6hZvyC8m-seWnNv1sj_NZvWhfmYH/view?usp=sharing" target="_blank">
  <img src="https://img.icons8.com/fluency/240/play-button-circled.png" alt="Watch Video" width="80"/>
</a>


---

## ⚙️ Setup Instructions

### 1. **Clone the Repository**

```bash
git clone https://github.com/rnihesh/wishlist-app.git
cd wishlist-app/client & /server
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Create `.env` File**

Inside the root directory, add your Clerk key in a `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

> 🗝️ Get it from [Clerk Dashboard](https://dashboard.clerk.com)

### 4. **Run the Development Server**

```bash
npm run dev (client/frontend)
npm start (server/backend)
```

App runs at `http://localhost:5173` 

Server runs at `http://localhost:4000`

### 5. **Build for Production**

```bash
npm run build
```

---

## 🧱 Tech Stack Used

### 💻 Frontend

* **React 19** – Functional components and hooks
* **Tailwind CSS v4** – Utility-first styling
* **React Router** – Client-side routing
* **Clerk** – Authentication and user management
* **Vite** – Next-gen frontend build tool

### 🌐 Backend (Required to Run)

* **Express.js** – REST API
* **MongoDB** – Database for users and wishlists

---

## 📦 Folder Structure (Frontend)

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── auth/
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── CreateWishlistModal.jsx
│   ├── Dashboard.jsx
│   ├── LandingPage.jsx
│   ├── WishlistCard.jsx
│   └── WishlistDetail.jsx
├── contexts/
│   └── ThemeContext.jsx
├── utils/
│   ├── config.js
│   └── useBackendUserId.js
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


---

## 📌 Limitations

### Limitations

* No offline support or PWA integration
* Shared wishlist access assumes trust – no access control
* No detailed error handling for network failures
* Mobile UI tested only on standard breakpoints
* Backend must be running separately; no monorepo setup

---

## 📫 Contact

Feel free to reach out for bugs, improvements, or collaboration!

---



