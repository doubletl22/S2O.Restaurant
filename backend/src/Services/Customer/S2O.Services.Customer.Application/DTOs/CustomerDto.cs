namespace S2O.Services.Customer.Application.DTOs
{
    public record CreateCustomerRequest(string FirstName, string LastName, string Email, string PhoneNumber);
    public record ToggleFavoriteRequest(Guid RestaurantId);
    public record RedeemVoucherRequest(string VoucherCode, int PointsCost, decimal DiscountVal, string Desc);
    public record SubmitFeedbackRequest(Guid RestaurantId, int Rating, string Comment);
    public class CustomerResponse
    {
        public Guid Id { get; set; }
        public Guid IdentityId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int LoyaltyPoints { get; set; }
        public string MembershipTier { get; set; } = string.Empty;
        public List<Guid> FavoriteRestaurantIds { get; set; } = new();
    }
    public class VoucherDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}