using EShopManager.API.Models;
using MongoDB.Driver;

namespace EShopManager.API.Services
{
    public class WishlistService
    {
        private readonly IMongoCollection<Wishlist> _wishlistCollection;

        public WishlistService(IMongoDatabase db)
        {
            _wishlistCollection = db.GetCollection<Wishlist>("Wishlists");
        }

        public async Task<Wishlist?> GetByUserAsync(string userId) =>
            await _wishlistCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

        public async Task<Wishlist?> GetByGuestAsync(string guestSessionId) =>
            await _wishlistCollection.Find(x => x.GuestSessionId == guestSessionId).FirstOrDefaultAsync();

        public async Task AddItemAsync(string ownerIdOrGuest, bool isGuest, WishlistItem item)
        {
            Wishlist? wl;
            if (isGuest)
                wl = await GetByGuestAsync(ownerIdOrGuest);
            else
                wl = await GetByUserAsync(ownerIdOrGuest);

            if (wl == null)
            {
                wl = new Wishlist();
                if (isGuest) wl.GuestSessionId = ownerIdOrGuest; else wl.UserId = ownerIdOrGuest;
                wl.Items.Add(item);
                await _wishlistCollection.InsertOneAsync(wl);
                return;
            }

            var exists = wl.Items.Any(x => x.ProductId == item.ProductId && x.VariantId == item.VariantId);
            if (!exists) wl.Items.Add(item);
            wl.UpdatedAt = DateTime.UtcNow;
            await _wishlistCollection.ReplaceOneAsync(x => x.Id == wl.Id, wl);
        }

        public async Task RemoveItemAsync(string ownerIdOrGuest, bool isGuest, string itemId)
        {
            Wishlist? wl = isGuest ? await GetByGuestAsync(ownerIdOrGuest) : await GetByUserAsync(ownerIdOrGuest);
            if (wl == null) return;
            wl.Items.RemoveAll(x => x.ItemId == itemId);
            wl.UpdatedAt = DateTime.UtcNow;
            await _wishlistCollection.ReplaceOneAsync(x => x.Id == wl.Id, wl);
        }

        public async Task MergeGuestIntoUserAsync(string guestSessionId, string userId)
        {
            var guest = await GetByGuestAsync(guestSessionId);
            if (guest == null) return;

            var user = await GetByUserAsync(userId);
            if (user == null)
            {
                guest.UserId = userId;
                guest.GuestSessionId = null;
                await _wishlistCollection.ReplaceOneAsync(x => x.Id == guest.Id, guest);
                return;
            }

            // merge: union by product+variant
            foreach (var item in guest.Items)
            {
                if (!user.Items.Any(x => x.ProductId == item.ProductId && x.VariantId == item.VariantId))
                {
                    user.Items.Add(item);
                }
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _wishlistCollection.ReplaceOneAsync(x => x.Id == user.Id, user);
            await _wishlistCollection.DeleteOneAsync(x => x.Id == guest.Id);
        }
    }
}
