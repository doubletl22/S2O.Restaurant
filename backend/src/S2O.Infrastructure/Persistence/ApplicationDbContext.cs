public class ApplicationDbContext : DbContext
{
    private readonly ITenantProvider _tenantProvider;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantProvider tenantProvider)
        : base(options) => _tenantProvider = tenantProvider;

    public DbSet<Dish> Dishes { get; set; }
    public DbSet<Order> Orders { get; set; }
    [cite: 16, 45]

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        [cite_start]// Tự động lọc dữ liệu: Khách hàng nhà hàng A không thấy món nhà hàng B [cite: 9, 54]
        modelBuilder.Entity<Dish>().HasQueryFilter(e => e.TenantId == _tenantProvider.GetTenantId());

        base.OnModelCreating(modelBuilder);
    }
}