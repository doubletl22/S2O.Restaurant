using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Restaurant.Application.DTOs;
using S2O.Services.Restaurant.Application.Services;

namespace S2O.Services.Restaurant.API.Controllers
{
    [ApiController]
    [Route("api/restaurant/menu")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        // 1. Public API: Khách quét QR lấy Menu (Không cần Login)
        [HttpGet("{restaurantId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMenu(Guid restaurantId)
        {
            var result = await _menuService.GetMenuAsync(restaurantId);
            return Ok(result.Value);
        }

        // 2. Private API: Chủ quán thêm Category
        [HttpPost("categories")]
        [Authorize] // Cần thêm Role check: [Authorize(Roles = "Owner")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var result = await _menuService.CreateCategoryAsync(request);
            return Ok(result);
        }

        // 3. Private API: Chủ quán thêm Món ăn
        [HttpPost("dishes")]
        [Authorize]
        public async Task<IActionResult> CreateDish([FromBody] CreateDishRequest request)
        {
            var result = await _menuService.CreateDishAsync(request);
            if (result.IsFailure) return BadRequest(result.Error);
            return Ok(result);
        }
    }
}