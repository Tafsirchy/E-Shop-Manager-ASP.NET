# E-Shop Manager

[//]: # (Optional: Logo/Banner Image)

🌍 **Live site:** [link](https://your-deployment-link.com)

A full-featured modern e-commerce platform built with ASP.NET Core MVC and MongoDB.

**ASP.NET Core • MongoDB • Stripe • Tailwind CSS**

## 🎯 Project Description
E-Shop Manager is a curated e-commerce application designed for an optimized and scalable shopping experience. It simplifies product catalog management, handles customer shopping carts, and processes secure payments. Built with a monolithic MVC architecture with MongoDB for flexibility and Stripe for payment processing, this platform is tailored to provide both administrators and shoppers an efficient and dynamic user interface.

## ✨ Implemented Features

### 🌐 Public Features
- **Product Catalog** — Browse new arrivals, categories (men's, women's, accessories), and search products globally.
- **Product Filtering & Sorting** — Filter by category, sort by newness, and access detailed product pages.
- **Wishlist** — Save favorite items for future consideration.
- **Responsive UI** — Mobile-friendly, modern interface powered by Tailwind CSS.

### 🔐 Authentication System
- **Cookie-Based Auth** — Secure cookie-based authentication and authorization scheme.
- **Session Handling** — Managed user sessions with automatic revocation upon role changes or security stamp invalidation.
- **Rate Limiting** — Brute-force protection for login and authentication endpoints.

### 🛒 Core Functionality (Cart/Checkout/etc.)
- **Shopping Cart** — Dynamic cart management (add, remove, update quantities).
- **Checkout Process** — Integrated Stripe payment gateway for seamless and secure checkout.
- **Order Management** — Track and view previous orders.
- **Product Reviews** — Customers can submit and read reviews on purchased products.

### 👤 Dashboards / User Roles
**Customer Dashboard:**
- View order history.
- Manage membership and subscription plans.
- Track wishlist items.

**Admin Dashboard:**
- Access comprehensive store analytics and reports.
- Manage products, orders, and user roles.

## 🛠️ Technology Stack

**Frontend**
- **Framework:** ASP.NET Core MVC (Razor Views)
- **Styling:** Tailwind CSS
- **State Management:** TempData, Cookie State
- **Utilities:** Output Caching, Response Compression (Brotli/Gzip)

**Backend**
- **Server:** ASP.NET Core
- **Database:** MongoDB
- **Security:** SecurityStampValidator, RateLimiter
- **Auth:** ASP.NET Core Authentication (Cookie)
- **Payment:** Stripe.net
- **Logging:** Serilog

## 📁 Project Structure
```text
project/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Views/
│   ├── Services/
│   ├── Data/
│   ├── Program.cs
│   └── appsettings.json
├── backend.Tests/
└── README.md
```

## 🚀 Setup & Installation

**Prerequisites**
- .NET SDK (8.0 or newer)
- MongoDB instance (Local or Atlas)
- Stripe Account (API Keys)

**Step 1: Backend Setup**
```bash
cd backend
```
Update `appsettings.json` or `appsettings.Development.json` with your MongoDB connection string and Stripe Secret Key.
```json
{
  "EShopDatabase": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "EShopDB"
  },
  "Stripe": {
    "SecretKey": "sk_test_..."
  }
}
```

**Step 2: Run the Project**
```bash
dotnet restore
dotnet build
dotnet run
```
*(Note: Database seeding runs automatically on startup if the database is empty).*

## 🗺️ Routes Summary

**Public Routes**
- `/` — Homepage with featured categories and newsletter.
- `/Products` — Product catalog and search.
- `/Account/Login` — User authentication.

**Protected Routes**
- `/Cart` — User shopping cart.
- `/Wishlist` — User saved items.
- `/Admin` — Administrative dashboard and analytics.

## 🔧 Development Workflow
- **Local URL:** `https://localhost:5001` or `http://localhost:5000` (check `Properties/launchSettings.json` for specific ports).

## 📊 API Reference (optional)
- This project utilizes the ASP.NET Core MVC architecture where Controllers return Views directly.

## 🌟 Future Enhancements
- Expanded administrative controls and analytics dashboard.
- Third-party OAuth integration (Google, GitHub).
- Enhanced product recommendation engine.

## 📄 License
MIT License

---
