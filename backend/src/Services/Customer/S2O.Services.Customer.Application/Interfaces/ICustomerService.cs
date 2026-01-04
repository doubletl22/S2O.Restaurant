using S2O.Services.Customer.Application.DTOs;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<Result<CustomerResponse>> GetCustomerProfileAsync(Guid identityId);
        Task<Result<CustomerResponse>> CreateCustomerAsync(Guid identityId, CreateCustomerRequest request);
        Task<Result<bool>> ToggleFavoriteAsync(Guid identityId, Guid restaurantId);
    }
}