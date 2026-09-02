namespace EShopManager.API.ViewModels
{
    /// <summary>
    /// Describes a page slice of a list so views can render prev/next + page links.
    /// </summary>
    public class PaginationInfo
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public int TotalCount { get; set; }

        public int TotalPages => Math.Max(1, (int)Math.Ceiling(TotalCount / (double)PageSize));
        public bool HasPrevious => Page > 1;
        public bool HasNext => Page < TotalPages;
        public int StartItem => TotalCount == 0 ? 0 : (Page - 1) * PageSize + 1;
        public int EndItem => Math.Min(Page * PageSize, TotalCount);

        /// <summary>
        /// Builds a PaginationInfo for a given page. Clamps the requested page into a valid range.
        /// </summary>
        public static PaginationInfo Create(int page, int pageSize, int totalCount)
        {
            if (pageSize <= 0) pageSize = 20;
            var totalPages = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize));
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            return new PaginationInfo { Page = page, PageSize = pageSize, TotalCount = totalCount };
        }
    }
}
