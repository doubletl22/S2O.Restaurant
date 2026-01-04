using S2O.Services.Customer.Application.DTOs;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<Result<CustomerResponse>> GetCustomerProfileAsync(Guid identityId);
        Task<Result<CustomerResponse>> CreateCustomerAsync(Guid identityId, CreateCustomerRequest request);
        Task<Result<bool>> ToggleFavoriteAsync(Guid identityId, Guid restaurantId);
        Task<Result> RedeemPointsAsync(Guid identityId, RedeemVoucherRequest request);
        Task<Result<List<VoucherDto>>> GetMyVouchersAsync(Guid identityId);
        Task<Result> SubmitFeedbackAsync(Guid identityId, SubmitFeedbackRequest request);

        Task<Result> UpdateFeedbackAsync(Guid identityId, Guid feedbackId, int rating, string comment);
        Task<Result> DeleteFeedbackAsync(Guid identityId, Guid feedbackId);
        Task<Result> AddLoyaltyPointsAsync(Guid customerId, int points);
    }
}