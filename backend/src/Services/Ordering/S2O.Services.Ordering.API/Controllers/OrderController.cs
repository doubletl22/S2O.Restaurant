using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Ordering.Application.DTOs;
using S2O.Services.Ordering.Application.Services; // Đảm bảo namespace này đúng với Service bạn đã tạo
using System.Security.Claims;

namespace S2O.Services.Ordering.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize] // Bắt buộc phải đăng nhập mới gọi được
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // Helper: Lấy User ID từ Token JWT
        private Guid GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("uid");
            return idClaim != null && Guid.TryParse(idClaim.Value, out var id) ? id : Guid.Empty;
        }

        // 1. Tạo đơn hàng mới
        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var customerId = GetCurrentUserId();
            if (customerId == Guid.Empty) return Unauthorized("Không xác định được người dùng.");

            var result = await _orderService.CreateOrderAsync(customerId, request);

            if (result.IsFailure)
                return BadRequest(result.Error);

            // Trả về 201 Created và ID của đơn hàng
            return CreatedAtAction(nameof(GetOrderById), new { id = result.Value }, new { OrderId = result.Value });
        }

        // 2. Lấy chi tiết đơn hàng
        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(Guid id)
        {
            // Lưu ý: Cần bổ sung method GetByIdAsync vào IOrderService (xem phần bổ sung bên dưới)
            var result = await _orderService.GetOrderByIdAsync(id);

            if (result.IsFailure)
                return NotFound(result.Error);

            return Ok(result.Value);
        }

        // 3. Lấy danh sách đơn hàng của Nhà hàng (Dành cho App quản lý hoặc Nhân viên)
        // GET: api/orders/restaurant/{restaurantId}
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetOrdersByRestaurant(Guid restaurantId)
        {
            // Lưu ý: Cần bổ sung method GetOrdersByRestaurantAsync vào IOrderService
            var result = await _orderService.GetOrdersByRestaurantAsync(restaurantId);
            return Ok(result.Value);
        }
    }
}