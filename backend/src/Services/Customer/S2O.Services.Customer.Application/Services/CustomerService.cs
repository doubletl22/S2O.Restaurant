using S2O.Services.Customer.Application.DTOs;
using S2O.Services.Customer.Application.Interfaces;
using S2O.Services.Customer.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<Result<CustomerResponse>> GetCustomerProfileAsync(Guid identityId)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure<CustomerResponse>("Profile not found.");
            return Result.Success(MapToResponse(customer));
        }

        public async Task<Result<CustomerResponse>> CreateCustomerAsync(Guid identityId, CreateCustomerRequest request)
        {
            var existing = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (existing != null) return Result.Failure<CustomerResponse>("Profile exists.");

            var newCustomer = Domain.Entities.Customer.Create(identityId, request.FirstName, request.LastName, request.Email, request.PhoneNumber).Value;
            await _customerRepository.AddAsync(newCustomer);

            return Result.Success(MapToResponse(newCustomer));
        }

        public async Task<Result<bool>> ToggleFavoriteAsync(Guid identityId, Guid restaurantId)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure<bool>("Profile not found.");

            var exists = customer.Favorites.Any(x => x.RestaurantId == restaurantId);
            if (exists)
                customer.RemoveFavorite(restaurantId);
            else
                customer.AddFavorite(restaurantId);

            await _customerRepository.UpdateAsync(customer);
            return Result.Success(!exists); // Trả về true nếu vừa Add, false nếu vừa Remove
        }

        private static CustomerResponse MapToResponse(Domain.Entities.Customer customer)
        {
            return new CustomerResponse
            {
                Id = customer.Id,
                IdentityId = customer.IdentityId,
                FullName = $"{customer.LastName} {customer.FirstName}",
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                LoyaltyPoints = customer.LoyaltyPoints,
                MembershipTier = customer.Tier.ToString(),
                FavoriteRestaurantIds = customer.Favorites.Select(f => f.RestaurantId).ToList()
            };
        }
    }
}