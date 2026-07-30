# Wishlist & Cart — Audit and Implementation Plan

This document records the audit findings for the current wishlist/cart implementation and a prioritized, phased plan to complete the feature to production readiness.

**Completed (work already done in this repo)**
- `MergeHelper` pure merge logic and unit tests: [backend/Services/MergeHelper.cs](backend/Services/MergeHelper.cs), [backend.Tests/MergeHelperTests.cs](backend.Tests/MergeHelperTests.cs)
- Wishlist model, service, and controller: [backend/Models/Wishlist.cs](backend/Models/Wishlist.cs), [backend/Services/WishlistService.cs](backend/Services/WishlistService.cs), [backend/Controllers/WishlistController.cs](backend/Controllers/WishlistController.cs)
- Cart model and basic service/controller endpoints (add/view/remove) including guest endpoints: [backend/Models/Cart.cs](backend/Models/Cart.cs), [backend/Services/CartService.cs](backend/Services/CartService.cs), [backend/Controllers/CartController.cs](backend/Controllers/CartController.cs), [backend/Controllers/CartPublicController.cs](backend/Controllers/CartPublicController.cs)
- Guest->user merge helpers wired: `CartService.MergeGuestIntoUserAsync` and `WishlistService.MergeGuestIntoUserAsync`; admin merge endpoint: [backend/Controllers/AdminController.cs](backend/Controllers/AdminController.cs)
- Auth login updated to accept `GuestSessionId` and trigger merges: [backend/Controllers/AuthController.cs](backend/Controllers/AuthController.cs)
- Frontend helper components: `WishlistToggle` and `MiniCart`: [frontend/src/components/WishlistToggle.tsx](frontend/src/components/WishlistToggle.tsx), [frontend/src/components/MiniCart.tsx](frontend/src/components/MiniCart.tsx)
- Optimistic concurrency/versioning for `Cart` implemented (Version field + versioned ReplaceOne) and backend builds successfully.

**Discovery**
- **Backend models & services**:
   - `backend/Models/Cart.cs` ([backend/Models/Cart.cs](backend/Models/Cart.cs))
   - `backend/Models/Wishlist.cs` ([backend/Models/Wishlist.cs](backend/Models/Wishlist.cs))
   - `backend/Services/CartService.cs` ([backend/Services/CartService.cs](backend/Services/CartService.cs))
   - `backend/Services/WishlistService.cs` ([backend/Services/WishlistService.cs](backend/Services/WishlistService.cs))
   - `backend/Services/MergeHelper.cs` ([backend/Services/MergeHelper.cs](backend/Services/MergeHelper.cs))
   - `backend/Services/CartOperationResult.cs` ([backend/Services/CartOperationResult.cs](backend/Services/CartOperationResult.cs))

- **Controllers / API**:
   - `backend/Controllers/CartController.cs` ([backend/Controllers/CartController.cs](backend/Controllers/CartController.cs))
   - `backend/Controllers/CartPublicController.cs` ([backend/Controllers/CartPublicController.cs](backend/Controllers/CartPublicController.cs))
   - `backend/Controllers/WishlistController.cs` ([backend/Controllers/WishlistController.cs](backend/Controllers/WishlistController.cs))
   - `backend/Controllers/AuthController.cs` (login merge hook) ([backend/Controllers/AuthController.cs](backend/Controllers/AuthController.cs))
   - `backend/Controllers/AdminController.cs` (admin merge endpoint) ([backend/Controllers/AdminController.cs](backend/Controllers/AdminController.cs))

- **Frontend**:
   - `frontend/src/components/WishlistToggle.tsx` ([frontend/src/components/WishlistToggle.tsx](frontend/src/components/WishlistToggle.tsx))
   - `frontend/src/components/MiniCart.tsx` ([frontend/src/components/MiniCart.tsx](frontend/src/components/MiniCart.tsx))
   - `frontend/src/app/product/page.tsx` ([frontend/src/app/product/page.tsx](frontend/src/app/product/page.tsx))

- **Tests**:
   - `backend.Tests/MergeHelperTests.cs` ([backend.Tests/MergeHelperTests.cs](backend.Tests/MergeHelperTests.cs))

**Current data model (high level)**
- `Cart` (UserId used for authenticated or guest session id), `Items: List<CartItem>`, `UpdatedAt`.
- `CartItem`: `ItemId`, `ProductId`, `VariantId?`, `Quantity`, `UnitPriceSnapshot`, `Currency`, `AddedAt`.
- `Wishlist`: `UserId?`, `GuestSessionId?`, `Items: List<WishlistItem>`, `UpdatedAt`.
- `WishlistItem`: `ItemId`, `ProductId`, `VariantId?`, `AddedAt`, `NotifyOnPriceDrop`, `Notes`.

Guest handling: carts use `UserId = guestSessionId`; wishlists use `GuestSessionId` field. Merge helpers exist for both cart and wishlist.

**Lifecycle mapping (where implemented / gaps)**
- Add to cart: implemented (`CartService.AddToCartAsync`, auth + guest endpoints).
- View cart: implemented (`CartController.Get`, `CartPublicController.GetGuestCart`).
- Update quantity: no explicit endpoint (adds increment quantity behavior; missing `UpdateQuantityAsync`).
- Remove item: implemented (removes by `productId` but not variant-aware in all places).
- Move between wishlist/cart: not implemented as a first-class action.
- Checkout/reservation: missing.

**Functional review**
- Implemented and working:
   - Add to cart with server-side stock check at add time.
   - View and remove cart items (auth + guest).
   - Wishlist add/remove and guest→user wishlist merge.
   - MergeHelper logic with unit test.
- Partially implemented / fragile:
   - Merge-on-login exists but is silent (errors swallowed) and does not return `MergeResult` to client.
   - Price snapshot on add exists but price-drift detection is not surfaced.
   - No versioning/optimistic concurrency.
- Missing for complete flow:
   - Checkout endpoint and inventory reservation.
   - Cart totals calculation (discounts/coupons/taxes).
   - Structured operation result codes (OutOfStock, PriceChanged, StaleCart).
   - Move-to-cart and save-for-later APIs.

**Bug & risk audit (highlights)**
- Logic risks:
   - No concurrency/versioning — concurrent edits can overwrite each other.
   - `WishlistController` is not protected by ownership checks.
   - Remove by `productId` may accidentally remove wrong variant lines.
- Validation gaps:
   - No robust handling for deactivated/removed products in cart/wishlist views.
   - No server-side enforcement against client-supplied snapshot tampering beyond setting snapshot when zero.
   - No explicit quantity range validation.
- UX gaps:
   - Merge results not surfaced; no merge summary modal.
   - No `UpdateQuantity` API, making frontend workarounds awkward.
- Security concerns:
   - Endpoints that accept `userId` path params must be validated against authenticated identity.

**Prioritized issues (short list)**
- Critical
   - C1: Add optimistic concurrency/versioning to `Cart` (prevent lost updates).
   - C2: Replace `CartOperationResult` with structured result codes and `Conflicts` payload.
   - C3: Implement checkout/reservation flow that atomically validates and decrements inventory.
   - C4: Enforce ownership/authorization in wishlist/cart user endpoints.
- Important
   - I1: Surface price changes on cart GET and require confirmation on price increases.
   - I2: Add `UpdateQuantity` and `MoveToCart` endpoints.
   - I3: Return `MergeResult` on login and show merge summary to user.
- Nice-to-have
   - N1: Add `IEventBus` and emit analytics events.
   - N2: Improve frontend optimistic UI and add merge confirmation modal.

**Phased implementation plan (ordered)**

Phase 0 — Prep
- Add/expand unit tests for merge and `CartService` edge cases.
- Introduce richer `CartOperationResult` type (backwards-compatible shape).

Phase 1 — Core integrity (Critical)
- P1.1 (C1): Add `Version` to `Cart` and implement optimistic replace logic in `CartService`.
   - Files: [backend/Models/Cart.cs](backend/Models/Cart.cs), [backend/Services/CartService.cs](backend/Services/CartService.cs), [backend/Controllers/CartController.cs](backend/Controllers/CartController.cs), [backend/Controllers/CartPublicController.cs](backend/Controllers/CartPublicController.cs)
- P1.2 (C2): Implement structured `CartOperationResult` with enum `Code`, `Conflicts`, and `Cart` payload.
   - Files: [backend/Services/CartOperationResult.cs](backend/Services/CartOperationResult.cs), [backend/Services/CartService.cs](backend/Services/CartService.cs)
- P1.3 (I2): Add `UpdateQuantity` endpoint and make removes variant-aware.

Phase 2 — Checkout & pricing (Critical → Important)
- P2.1 (C3): Implement `Checkout` flow with atomic validation/reservation and clear error responses.
   - Files: [backend/Services/CartService.cs](backend/Services/CartService.cs), new [backend/Controllers/CheckoutController.cs](backend/Controllers/CheckoutController.cs), [backend/Services/ProductService.cs](backend/Services/ProductService.cs)
- P2.2 (I1): Recompute live totals on `GET /api/cart` and return `PriceChanges`.

Phase 3 — Merge UX & security
- P3.1 (I3): Return `MergeResult` from `AuthController.Login` and surface it to frontend.
- P3.2 (C4): Secure wishlist endpoints and add guest wishlist API.

Phase 4 — Instrumentation & UX polish
- P4.1 (N1): Add `IEventBus` and emit `ItemAddedToCart`, `CartMerged`, `MovedToCart` events.
- P4.2 (N2): Implement frontend features: `AddToCartControl`, merge modal, robust optimistic updates.

Phase 5 — Tests & validation
- Add unit tests (merge, cart ops, price-change detection) and integration tests for add→checkout.

**Immediate recommended action (next commit)**
- Implement C1: add `Version` to `Cart` and optimistic concurrency in `CartService`. This change is small, high-impact, and reduces data-corruption risk.

If you approve, I will implement C1 now: modify `backend/Models/Cart.cs`, update `CartService` replace/insert logic to respect `Version`, add a unit test simulating concurrent replace, and build to verify.

---
Last scan performed against repository state on 2026-07-30.
