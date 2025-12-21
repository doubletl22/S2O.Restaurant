namespace S2O.Services.Identity.Domain.Entities
{
    public class Permission
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}