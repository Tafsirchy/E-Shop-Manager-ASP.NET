# E-Shop Manager

A full-featured e-commerce platform built with ASP.NET Core 10 MVC, MongoDB, Stripe, and Tailwind CSS v4.

**ASP.NET Core 10 · MongoDB · Stripe Checkout · Tailwind CSS v4 · Serilog · xUnit**

---

## Features

### Storefront
- **Product Catalog** — Paginated listing (12/page), category filter, sort (newest/price/name), live search with 250ms debounce
- **Product Details** — Image gallery, specs, variants, color swatches, reviews with moderation
- **Responsive UI** — Tailwind CSS v4, mobile-first, glassmorphism product cards, View Transitions API

### Shopping
- **Cart** — Add/remove/update quantities, qty stepper, shipping radios (free/flat ৳60), coupon bar, optimistic concurrency
- **Checkout** — Stripe Checkout integration (BDT currency), auto stock decrement with rollback on failure
- **Wishlist** — Guest and authenticated, merges on login

### Order Tracking
- **Horizontal step indicator** — Pending → Processing → Shipped → Delivered with icons and timestamps
- **Status history** — Every status change logged with timestamp and optional note
- **Tracking number** — Admin-set, copy-to-clipboard on customer view
- **Invoice** — Printable invoice per order

### Membership & Rewards
- **Tier system** — Auto-upgrade to Premium at ৳50,000 lifetime spend
- **Reward points** — 1 point per ৳100 spent, redeemable for coupons
- **Coupons** — Point-based coupon claiming with discount values

### Subscriptions
- **Prebuilt packages** — Named plans with features and billing cycles
- **Custom builder** — Pick features, get dynamic pricing with tiered discounts
- **Stripe payments** — Subscribe and manage via Stripe Checkout

### Admin Dashboard
- **Analytics** — Total users, orders, revenue, low-stock alerts, recent orders
- **Product management** — CRUD with image upload (magic-byte validation, 6MB limit, gallery support)
- **Order management** — Status updates, tracking numbers, internal notes
- **User management** — View all users with roles
- **Coupon management** — Create and manage discount coupons
- **Subscription management** — View all packages
- **Low stock alerts** — Configurable threshold filter

### Reviews
- **Submit reviews** — Star rating, title, comment (pending moderation)
- **Moderation** — Admin approve/reject workflow
- **Seller replies** — Admin can reply to reviews
- **Aggregation** — Auto-calculated average rating and count on products

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | ASP.NET Core 10.0 (MVC + Razor Views) |
| **Database** | MongoDB (via MongoDB.Driver 3.10.0) |
| **Authentication** | Cookie-based (12h sliding expiry, SecurityStamp revocation) |
| **Payments** | Stripe Checkout (BDT currency) |
| **CSS** | Tailwind CSS v4 (custom @theme tokens) |
| **JavaScript** | Vanilla JS (site.js, home.js, product-form.js), jQuery 4 (validation) |
| **Logging** | Serilog (Console + rolling daily file) |
| **Testing** | xUnit + EphemeralMongo (in-process MongoDB) |
| **Build** | .NET CLI, npm (Tailwind CLI) |

---

## Project Structure

```
E-Shop/
├── backend/
│   ├── Controllers/          # 11 controllers
│   │   ├── AccountController.cs       # Login, Register, Logout
│   │   ├── AdminController.cs         # Dashboard, products, users, coupons, subscriptions
│   │   ├── CartController.cs          # Cart CRUD, Stripe checkout
│   │   ├── HomeController.cs          # Homepage, about, contact, FAQ, shipping
│   │   ├── MembershipController.cs    # Tier, points, coupon claiming
│   │   ├── OrdersController.cs        # Order list, details, invoice, status update
│   │   ├── ProductsController.cs      # Catalog, CRUD, image upload
│   │   ├── ReviewsController.cs       # Review submission
│   │   ├── SearchApiController.cs     # JSON search suggestions endpoint
│   │   ├── SubscriptionsController.cs # Packages, custom builder, Stripe
│   │   └── WishlistController.cs      # Wishlist toggle/remove
│   │
│   ├── Models/               # 14 model files
│   │   ├── Cart.cs                    # Cart + CartItem (optimistic concurrency)
│   │   ├── CategoryDiscountPolicy.cs  # Polymorphic per-category discounts
│   │   ├── Coupon.cs                  # Reward coupon
│   │   ├── Order.cs                   # Abstract Order + Regular/Premium/Bulk
│   │   ├── OrderStatusHistory.cs      # Status change audit trail
│   │   ├── Product.cs                 # Product + Specs + Variants
│   │   ├── Review.cs                  # Reviews with moderation + replies
│   │   ├── SubscriptionPackage.cs     # Prebuilt + custom packages
│   │   ├── User.cs                    # User account
│   │   ├── UserMembership.cs          # Tier + spending + reward points
│   │   ├── UserRole.cs                # enum: Customer=0, Admin=1
│   │   ├── UserSubscription.cs        # Active subscriptions
│   │   └── Wishlist.cs                # Guest + authenticated wishlists
│   │
│   ├── Services/             # 16 service files
│   │   ├── AdminAnalyticsService.cs   # Dashboard stats
│   │   ├── CartService.cs             # Cart CRUD + guest-to-user merge
│   │   ├── CurrentUser.cs             # Auth context wrapper
│   │   ├── ImageUploadValidator.cs    # Magic-byte + size + extension validation
│   │   ├── ImageUrls.cs              # Unsplash/Picsum srcset generation
│   │   ├── MembershipService.cs       # Spending accumulation, points, coupons
│   │   ├── MergeHelper.cs            # Pure cart merge logic
│   │   ├── OrderService.cs           # Order placement, status, tracking, history
│   │   ├── ProductService.cs         # Product CRUD, search, stock management
│   │   ├── ReviewService.cs          # Review CRUD + moderation
│   │   ├── SecurityStampValidator.cs  # Session revocation (30s cache)
│   │   ├── SubscriptionService.cs    # Package lifecycle
│   │   ├── UserService.cs            # Auth, hashing, email normalization
│   │   └── WishlistService.cs        # Wishlist CRUD
│   │
│   ├── Views/                # 33 Razor views
│   ├── ViewModels/           # 7 view model files
│   ├── Data/
│   │   └── DatabaseSeeder.cs          # Seed admin, products, backfill migrations
│   ├── Program.cs                       # Middleware pipeline, DI, OutputCache
│   ├── tailwind.input.css              # Tailwind v4 theme + custom utilities
│   ├── wwwroot/                        # Static assets (CSS, JS, images)
│   └── start.ps1                       # Launcher (injects env vars)
│
├── backend.Tests/            # 7 test files
│   ├── CartServiceTests.cs
│   ├── CategoryDiscountTests.cs
│   ├── CheckoutFlowTests.cs
│   ├── GuardConventionTests.cs        # Architecture guard (mutating endpoints need auth)
│   ├── MergeHelperTests.cs
│   ├── ReviewAggregationHelperTests.cs
│   └── SecurityStampTests.cs
│
└── README.md
```

---

## MongoDB Collections

| Collection | Model | Purpose |
|-----------|-------|---------|
| `Customers` | `User` | User accounts |
| `Products` | `Product` | Product catalog |
| `Carts` | `Cart` | Shopping carts (guest + authenticated) |
| `Orders` | `Order` | Order records (polymorphic: Regular/Premium/Bulk) |
| `OrderStatusHistory` | `OrderStatusHistory` | Status change audit trail |
| `Reviews` | `Review` | Product reviews with moderation |
| `Wishlists` | `Wishlist` | Saved items (guest + authenticated) |
| `UserMemberships` | `UserMembership` | Spending tiers and reward points |
| `Coupons` | `Coupon` | Discount coupons |
| `SubscriptionPackages` | `SubscriptionPackage` | Subscription plans |
| `UserSubscriptions` | `UserSubscription` | Active subscriptions |

---

## Setup

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [MongoDB](https://www.mongodb.com/try/download/community) local instance or [MongoDB Atlas](https://cloud.mongodb.com) free cluster
- [Stripe account](https://stripe.com) (test API keys)
- [Node.js](https://nodejs.org) (for Tailwind CSS builds)

### 1. Configure Environment Variables

Secrets are stored in **User-scope environment variables** (never in `appsettings.json`).

```powershell
# PowerShell (run once per machine)
[System.Environment]::SetEnvironmentVariable("EShopDatabase__ConnectionString", "mongodb://localhost:27017", "User")
[System.Environment]::SetEnvironmentVariable("Stripe__SecretKey", "sk_test_...", "User")
[System.Environment]::SetEnvironmentVariable("JwtSettings__Secret", "your-secret-key", "User")
```

### 2. Build & Run

```bash
cd backend

# Install Tailwind CSS dependencies
npm install

# Build CSS
npm run build:css

# Build and run
dotnet build
.\start.ps1
```

The app runs at **http://localhost:5000**.

`start.ps1` automatically injects environment variables and launches the server.

### 3. Tailwind CSS (Development)

```bash
# Watch mode (auto-rebuild on changes)
npm run watch:css

# One-shot build (minified)
npm run build:css
```

### 4. Run Tests

```bash
cd backend
dotnet test ../backend.Tests/Backend.Tests.csproj
```

**28 tests** covering cart operations, category discounts, checkout flow, merge logic, review aggregation, security stamps, and architecture conventions.

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eshop.com` | `admin123` |

> **Note:** The admin user is seeded automatically on first run.

---

## Architecture Highlights

### Polymorphic Order System
Orders inherit from an abstract `Order` base class:
- `RegularOrder` — No discount
- `PremiumOrder` — 10% discount (auto-upgraded at ৳50,000 spend)
- `BulkOrder` — 15% discount

### Polymorphic Category Discounts
Per-category discount policies resolved at checkout:
- Jackets: 15%
- Hoodies, Shoes: 10%
- Dresses: 5%
- Others: 0%

### Optimistic Concurrency
Carts use a `Version` field for concurrent-safe updates. Conflicts are detected and reported.

### Guest-to-User Merge
On login or registration, guest cart and wishlist items are merged into the user's account with stock-cap conflict reporting.

### Security
- **Rate limiting** — 10 requests/min per IP on login and register
- **SecurityStamp** — Session revocation on role change (30s cache)
- **CSRF** — Antiforgery tokens on all POST forms
- **Password hashing** — PBKDF2 with 100k iterations, HMAC-SHA256
- **Constant-time comparison** — Dummy hash on unknown emails to prevent timing enumeration
- **Image validation** — Magic-byte signature check, 6MB limit, extension allow-list
- **Email canonicalization** — Stored lowercase, normalized at registration

### Performance
- **OutputCache** — 30s cache on search suggestions API
- **Response Compression** — Brotli + Gzip
- **Static file caching** — 1-year immutable cache headers
- **Private cache middleware** — 20s cache on anonymous catalog/homepage GETs
- **Hover prefetch** — Product cards prefetch details page on hover
- **View Transitions API** — Cross-document smooth transitions
- **Lazy loading** — srcset/sizes for responsive product images

---

## Routes

### Public
| Route | Description |
|-------|-------------|
| `GET /` | Homepage with featured arrivals |
| `GET /Products` | Catalog with search, filter, sort, pagination |
| `GET /Products/Details/{id}` | Product detail page |
| `GET /api/products?search=&limit=` | JSON search suggestions |
| `GET /Home/About` | About page |
| `GET /Home/Contact` | Contact form |
| `GET /Home/Shipping` | Shipping info |
| `GET /Home/Faq` | FAQ |
| `GET /Home/Lookbook` | Lookbook |
| `GET /Subscriptions` | Subscription plans |

### Authenticated
| Route | Description |
|-------|-------------|
| `POST /Account/Login` | Login (via auth modal) |
| `POST /Account/Register` | Register (via auth modal) |
| `POST /Account/Logout` | Sign out |
| `GET /Cart` | Shopping cart |
| `POST /Cart/Add` | Add to cart |
| `POST /Cart/UpdateQuantity` | Update quantity |
| `POST /Cart/Remove` | Remove item |
| `POST /Cart/Checkout` | Stripe Checkout |
| `GET /Orders` | Order history |
| `GET /Orders/Details/{id}` | Order tracking + timeline |
| `GET /Orders/Invoice/{id}` | Printable invoice |
| `GET /Wishlist` | Saved items |
| `POST /Wishlist/Toggle` | Add/remove from wishlist |
| `GET /Membership` | Membership tier + rewards |
| `POST /Membership/ClaimCoupon` | Redeem points for coupon |
| `POST /Reviews/Create` | Submit review |

### Admin Only
| Route | Description |
|-------|-------------|
| `GET /Admin` | Dashboard with analytics |
| `GET /Admin/Products` | Manage products |
| `GET/POST /Products/Create` | Create product |
| `GET/POST /Products/Edit/{id}` | Edit product |
| `POST /Products/Delete/{id}` | Delete product |
| `POST /Products/UploadImage` | Upload image |
| `GET /Admin/Users` | Manage users |
| `GET /Admin/Coupons` | Manage coupons |
| `POST /Admin/CreateCoupon` | Create coupon |
| `GET /Admin/Subscriptions` | Manage subscriptions |
| `POST /Admin/CreatePackage` | Create subscription package |
| `GET /Admin/LowStock` | Low stock alerts |
| `POST /Orders/UpdateStatus` | Update order status + tracking |

---

## Deployment

### Recommended: Railway
1. Push to GitHub
2. Connect repo on [Railway](https://railway.app)
3. Add MongoDB addon (or connect Atlas)
4. Set environment variables:
   - `EShopDatabase__ConnectionString`
   - `Stripe__SecretKey`
   - `JwtSettings__Secret`
5. Deploy — auto-detects .NET

### Other Options
- **Fly.io** — Dockerfile-based, global edge deployment
- **Render** — Git push deploy, managed MongoDB
- **Azure App Service** — Native .NET support, free tier
- **DigitalOcean App Platform** — Simple deployment + managed MongoDB

For MongoDB, use [MongoDB Atlas free tier](https://cloud.mongodb.com) (works with any platform).

---

## License

MIT License
