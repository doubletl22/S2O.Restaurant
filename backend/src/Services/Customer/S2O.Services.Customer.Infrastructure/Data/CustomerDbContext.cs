using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using S2O.Services.Customer.Domain.Entities;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace S2O.Services.Customer.Infrastructure.Data
{
    public class CustomerDbContext : DbContext
    {
        private readonly ISaveChangesInterceptor _auditableEntityInterceptor;

        public CustomerDbContext(
            DbContextOptions<CustomerDbContext> options,
            ISaveChangesInterceptor auditableEntityInterceptor) : base(options)
        {
            _auditableEntityInterceptor = auditableEntityInterceptor;
        }

        public DbSet<Domain.Entities.Customer> Customers { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Domain.Entities.Customer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.IdentityId).IsUnique();
                entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
                entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
            });
        }
    }
}