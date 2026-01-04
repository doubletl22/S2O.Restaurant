using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Customer.Application.DTOs;
using S2O.Services.Customer.Application.Interfaces;
using System.Security.Claims;

namespace S2O.Services.Customer.API.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        // Lấy User ID từ Token JWT
        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("uid");
            return idClaim != null && Guid.TryParse(idClaim.Value, out var id) ? id : Guid.Empty;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var result = await _customerService.GetCustomerProfileAsync(userId);
            return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] CreateCustomerRequest request)
        {
            var userId = GetCurrentUserId();
            // Nếu chưa có token thì cho phép truyền IdentityId để test (hoặc lấy từ request)
            if (userId == Guid.Empty) userId = Guid.NewGuid();

            var result = await _customerService.CreateCustomerAsync(userId, request);
            return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
        }

        [HttpPost("favorites")]
        public async Task<IActionResult> ToggleFavorite([FromBody] ToggleFavoriteRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var result = await _customerService.ToggleFavoriteAsync(userId, request.RestaurantId);
            if (result.IsFailure) return BadRequest(result.Error);

            return Ok(new { IsFavorite = result.Value, Message = result.Value ? "Added to favorites" : "Removed from favorites" });
        }
    }
}