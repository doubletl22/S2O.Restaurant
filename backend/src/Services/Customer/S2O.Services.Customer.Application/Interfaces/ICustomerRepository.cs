using S2O.Services.Customer.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Application.Interfaces
{
    public interface ICustomerRepository
    {
        Task<Domain.Entities.Customer?> GetByIdentityIdAsync(Guid identityId);
        Task AddAsync(Domain.Entities.Customer customer);
        Task UpdateAsync(Domain.Entities.Customer customer);
    }
}