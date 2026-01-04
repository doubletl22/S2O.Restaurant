using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Restaurant.Application.DTOs;
using S2O.Services.Restaurant.Application.Services;
using System.Security.Claims;

namespace S2O.Services.Restaurant.API.Controllers
{
    [ApiController]
    [Route("api/owner/restaurant")]
    [Authorize] // Bắt buộc đăng nhập
    public class OwnerController : ControllerBase
    {
        private readonly RestaurantManagerService _service;

        public OwnerController(RestaurantManagerService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("uid")?.Value;
            return id != null ? Guid.Parse(id) : Guid.Empty;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] CreateRestaurantRequest request)
        {
            // TODO: Kiểm tra Role == "Owner" nếu cần chặt chẽ
            var result = await _service.RegisterRestaurantAsync(GetUserId(), request);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyInfo()
        {
            var result = await _service.GetMyRestaurantAsync(GetUserId());
            return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
        }
    }
}