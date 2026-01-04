using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Restaurant.Application.Services;

namespace S2O.Services.Restaurant.API.Controllers
{
    [ApiController]
    [Route("api/admin/tenants")]
    // [Authorize(Roles = "Admin")] // Bật dòng này khi Identity Service đã cấp role Admin chuẩn
    public class AdminTenantController : ControllerBase
    {
        private readonly AdminTenantService _service;

        public AdminTenantController(AdminTenantService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllTenantsAsync();
            return Ok(result.Value);
        }
    }
}