using MediatR;
using Microsoft.AspNetCore.Identity;
using S2O.Identity.App.Abstractions; // Cần cái này để gọi IAuthDbContext
using S2O.Identity.Domain.Entities;   // Cần cái này để dùng Entity Branch
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.App.Features.Register;

public class RegisterOwnerCommandHandler : IRequestHandler<RegisterOwnerCommand, Result<Guid>>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly IAuthDbContext _context; // <-- 1. Inject thêm Context

    public RegisterOwnerCommandHandler(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IAuthDbContext context) // <-- Inject vào Constructor
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }

    public async Task<Result<Guid>> Handle(RegisterOwnerCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<Guid>.Failure(new Error("Auth.DuplicateEmail", "Email này đã được đăng ký."));
        }

        // 2. Tạo TenantId mới
        var newTenantId = Guid.NewGuid();

        // 3. --- LOGIC MỚI: TẠO CHI NHÁNH MẶC ĐỊNH ---
        // Phải tạo Chi nhánh trước thì User mới có nơi để thuộc về
        var defaultBranch = new Branch
        {
            TenantId = newTenantId,
            Name = "Trụ sở chính", // Tên mặc định
            Address = "Địa chỉ mặc định",
            PhoneNumber = "",
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        // Lưu Branch vào Database
        _context.Branches.Add(defaultBranch);
        await _context.SaveChangesAsync(cancellationToken);

        // 4. Khởi tạo User và gán vào Chi nhánh vừa tạo
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = newTenantId,

            // --- QUAN TRỌNG: Gán ông chủ vào chi nhánh vừa tạo ---
            BranchId = defaultBranch.Id,

            CreatedAtUtc = DateTime.UtcNow,
            IsActive = true
        };

        // 5. Lưu User vào Database
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            // (Nâng cao: Nếu tạo User lỗi thì nên xóa Branch vừa tạo đi để sạch DB)
            var firstError = result.Errors.First();
            return Result<Guid>.Failure(new Error(firstError.Code, firstError.Description));
        }

        // 6. Gán quyền 'RestaurantOwner'
        if (!await _roleManager.RoleExistsAsync("RestaurantOwner"))
        {
            await _roleManager.CreateAsync(new ApplicationRole { Name = "RestaurantOwner" });
        }
        await _userManager.AddToRoleAsync(user, "RestaurantOwner");

        // 7. Trả về ID
        return Result<Guid>.Success(Guid.Parse(user.Id));
    }
}