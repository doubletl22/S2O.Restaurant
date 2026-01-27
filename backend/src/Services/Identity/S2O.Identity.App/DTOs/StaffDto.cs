public class StaffDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; }
    public Guid? BranchId { get; set; } // Frontend sẽ dùng ID này map với list Branch ở trên để lấy tên
    public bool IsActive { get; set; }
}