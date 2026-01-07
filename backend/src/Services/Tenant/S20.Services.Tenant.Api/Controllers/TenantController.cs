using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using S20.Services.Tenants.Application.DTOs;
using S20.Services.Tenants.Application.Interfaces;

namespace S20.Services.Tenants.Api.Controllers
{
    [ApiController]
    [Route("api/tenants")]
    public class TenantController : ControllerBase
    {
        private readonly ITenantServices tenantServices;
        private readonly ITenantProvider tenantProvider;


        public TenantController(ITenantServices tenantServices, ITenantProvider tenantProvider)
        {
            this.tenantServices = tenantServices;
            this.tenantProvider = tenantProvider;
        }

        //SystemAdmin: tạo nhà hàng
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTenantRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await tenantServices.CreateTenantAsync(request);
                return Ok(result);
            }
            catch(Exception ex) 
            {
                return BadRequest(new {message = ex.Message});
            }
        }

        //SystemAdmin: khóa/mở nhà hàng
        [HttpPut("{id}/status")]        
        
        public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] bool isActive)
        {
            var success = await tenantServices.ToggleTenantStatusAsync(id, isActive);
            if(!success)
            {
                return NotFound(new { message = "Không tìm thấy nhà hàng " });
            }

            return Ok(new { message = $"Đã {(isActive ? "mở khóa" : "Khóa")} nhà hàng thành công"});
        }

        //Owner lấy danh sách quán
        [HttpGet("my-tenants")]
        [Authorize]
        public async Task<IActionResult> GetMyTenant()
        {
            var userId = tenantProvider.UserId;
            if (userId == null)
            {
                return Unauthorized(new { message = "Token không chứa thông tin định danh người dùng." });
            }

            var tenants = await tenantServices.GetUserTenantsAsync(userId.Value);
            return Ok(tenants);
        }
    }
}
