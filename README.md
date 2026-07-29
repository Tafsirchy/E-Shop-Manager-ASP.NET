# E-Shop Manager ASP.NET

A comprehensive E-Commerce platform built with ASP.NET Core Web API (Backend) and Next.js (Frontend) using MongoDB.

## Features Completed
- **Phase 1:** Core Infrastructure, JWT Auth, Role-based route protection
- **Phase 2:** Product CRUD operations, Inventory management, Frontend Product Listing
- **Phase 3:** Shopping Cart, Checkout flow, OOP Polymorphism Discount Engine
- **Phase 4:** Subscription System, Custom Package Builder with dynamic pricing
- **Phase 5:** Membership Core, Lifetime spending tracking, Role auto-upgradation, Coupon/Reward points
- **Phase 6 & 7:** User Dashboard, Admin Analytics Dashboard

## Prerequisites
- .NET SDK (8.0 or later)
- Node.js (v18 or later)
- MongoDB Server (Running locally on default port 27017)

## How to Run the Backend (ASP.NET Core API)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Build and run the API:
   ```bash
   dotnet run
   ```
3. The API will start on `http://localhost:5000`. You can access the Swagger UI at `http://localhost:5000/swagger`.

## How to Run the Frontend (Next.js)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The application will be available in your browser at `http://localhost:3000`.
