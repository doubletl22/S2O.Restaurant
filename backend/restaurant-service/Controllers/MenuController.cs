using Microsoft.AspNetCore.Mvc;
using RestaurantService.Models;
using System.Collections.Generic;
using System.Linq;

namespace RestaurantService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        // Giả lập Database bằng List (Thực tế bạn sẽ dùng Entity Framework + PostgreSQL)
        private static List<MenuItem> _fakeDb = new List<MenuItem>();

        [HttpGet]
        public IActionResult GetMenu()
        {
            // 1. Lấy TenantId hiện tại từ Middleware
            if (!HttpContext.Items.TryGetValue("TenantId", out var tenantIdObj))
            {
                return BadRequest("Missing Tenant ID");
            }
            string currentTenantId = tenantIdObj.ToString();

            [cite_start]// 2. Lọc dữ liệu: Chỉ trả về món ăn của nhà hàng này (Biệt lập dữ liệu) [cite: 112]
            var menu = _fakeDb.Where(x => x.TenantId == currentTenantId).ToList();
            
            return Ok(menu);
        }

        [HttpPost]
        public IActionResult AddDish([FromBody] MenuItem newItem)
        {
            // Lấy TenantId từ context gán vào item mới
            if (HttpContext.Items.TryGetValue("TenantId", out var tenantId))
            {
                newItem.TenantId = tenantId.ToString();
            }
            
            // Giả lập lưu ID tự tăng
            newItem.Id = _fakeDb.Count + 1;
            _fakeDb.Add(newItem);

            return CreatedAtAction(nameof(GetMenu), new { id = newItem.Id }, newItem);
        }
    }
}