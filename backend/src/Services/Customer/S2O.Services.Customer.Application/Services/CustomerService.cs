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

        public async Task<Result<CustomerResponse>> CreateCustomerAsync(Guid identityId, CreateCustomerRequest request)
        {
            var existing = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (existing != null)
                return Result.Failure<CustomerResponse>("Customer profile already exists.");

            var customerResult = Domain.Entities.Customer.Create(
                identityId,
                request.FirstName,
                request.LastName,
                request.Email,
                request.PhoneNumber);

            if (customerResult.IsFailure)
                return Result.Failure<CustomerResponse>(customerResult.Error);

            var customer = customerResult.Value;
            await _customerRepository.AddAsync(customer);

            return Result.Success(MapToResponse(customer));
        }

        public async Task<Result<CustomerResponse>> GetCustomerProfileAsync(Guid identityId)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null)
                return Result.Failure<CustomerResponse>("Customer profile not found.");

            return Result.Success(MapToResponse(customer));
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
                MembershipTier = customer.MembershipTier
            };
        }
    }
}