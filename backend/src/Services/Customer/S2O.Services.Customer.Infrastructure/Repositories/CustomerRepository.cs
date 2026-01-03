using Microsoft.EntityFrameworkCore;
using S2O.Services.Customer.Application.Interfaces;
using S2O.Services.Customer.Infrastructure.Data;

namespace S2O.Services.Customer.Infrastructure.Repositories // Namespace này phải khớp với dòng using bên API
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly CustomerDbContext _context;

        public CustomerRepository(CustomerDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Domain.Entities.Customer customer)
        {
            await _context.Customers.AddAsync(customer);
            await _context.SaveChangesAsync();
        }

        public async Task<Domain.Entities.Customer?> GetByIdentityIdAsync(Guid identityId)
        {
            return await _context.Customers.FirstOrDefaultAsync(c => c.IdentityId == identityId);
        }

        public async Task UpdateAsync(Domain.Entities.Customer customer)
        {
            _context.Customers.Update(customer);
            await _context.SaveChangesAsync();
        }
    }
}