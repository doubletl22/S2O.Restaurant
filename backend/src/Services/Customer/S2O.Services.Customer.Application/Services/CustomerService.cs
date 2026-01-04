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

        // Thêm method: Đổi Voucher
        public async Task<Result> RedeemPointsAsync(Guid identityId, RedeemVoucherRequest request)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure("Customer not found.");

            var result = customer.RedeemVoucher(request.VoucherCode, request.Desc, request.PointsCost, request.DiscountVal);

            if (result.IsSuccess)
            {
                await _customerRepository.UpdateAsync(customer);
            }
            return result;
        }

        // Thêm method: Gửi Feedback
        public async Task<Result> SubmitFeedbackAsync(Guid identityId, SubmitFeedbackRequest request)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure("Customer not found.");

            customer.AddFeedback(request.RestaurantId, request.Rating, request.Comment);

            await _customerRepository.UpdateAsync(customer);
            return Result.Success();
        }

        // Thêm method: Lấy danh sách Voucher của tôi
        public async Task<Result<List<VoucherDto>>> GetMyVouchersAsync(Guid identityId)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure<List<VoucherDto>>("Not found");

            var vouchers = customer.Vouchers
                .Where(v => !v.IsUsed && v.ExpiryDate > DateTime.UtcNow) // Chỉ lấy cái còn hạn
                .Select(v => new VoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    Amount = v.DiscountAmount,
                    ExpiryDate = v.ExpiryDate
                }).ToList();

            return Result.Success(vouchers);
        }

        public async Task<Result> AddLoyaltyPointsAsync(Guid customerId, int points)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId); // Lưu ý: Dùng Id thay vì IdentityId nếu gọi nội bộ
            if (customer == null) return Result.Failure("Customer not found.");

            customer.AddLoyaltyPoints(points);
            await _customerRepository.UpdateAsync(customer);
            return Result.Success();
        }

        // 2. Implement Update Feedback
        public async Task<Result> UpdateFeedbackAsync(Guid identityId, Guid feedbackId, int rating, string comment)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure("Customer not found.");

            var result = customer.EditFeedback(feedbackId, rating, comment);
            if (result.IsSuccess) await _customerRepository.UpdateAsync(customer);

            return result;
        }

        // 3. Implement Delete Feedback
        public async Task<Result> DeleteFeedbackAsync(Guid identityId, Guid feedbackId)
        {
            var customer = await _customerRepository.GetByIdentityIdAsync(identityId);
            if (customer == null) return Result.Failure("Customer not found.");

            var result = customer.DeleteFeedback(feedbackId);
            if (result.IsSuccess) await _customerRepository.UpdateAsync(customer);

            return result;
        }
    }
}