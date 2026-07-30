Tasks (progress tracking)

- [x] Add `Wishlist` data model (`backend/Models/Wishlist.cs`)
- [x] Add `WishlistService` (`backend/Services/WishlistService.cs`)
- [x] Add `MergeHelper` pure logic (`backend/Services/MergeHelper.cs`)
- [x] Add `CartController` and `WishlistController`
- [x] Add basic unit test project and `MergeHelperTests`
- [ ] Integrate full stock checks into `CartService`
- [ ] Implement guest session cookie handling and merge on login
- [ ] Add events/hooks for analytics
- [ ] Add frontend wishlist toggle + mini-cart
- [ ] Add server-side sorting/pagination for cart

Notes
- Tests currently cover only pure merge logic (does not require MongoDB).
- Next: wire stock checks to `ProductService` and add reservation behavior.
