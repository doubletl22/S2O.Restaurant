using S2O.Services.Customer.Domain.Entities;

namespace S2O.Services.Customer.Application.Interfaces
{
    public interface ICustomerRepository
    {
        // Thêm method load kèm danh sách yêu thích
        Task<Domain.Entities.Customer?> GetByIdentityIdAsync(Guid identityId);
        Task AddAsync(Domain.Entities.Customer customer);
        Task UpdateAsync(Domain.Entities.Customer customer);
        Task<Domain.Entities.Customer?> GetByIdAsync(Guid id);
    }
}