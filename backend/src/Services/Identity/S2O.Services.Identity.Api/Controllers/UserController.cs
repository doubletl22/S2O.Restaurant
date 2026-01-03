using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Application.DTOs.Users;
using S2O.Services.Identity.Application.Interfaces;
using S2O.Services.Identity.Application.UseCase;
using S2O.Services.Identity.Application.UseCase.Users;
using System.IdentityModel.Tokens.Jwt;

namespace S2O.Services.Identity.Api.Controllers
{
    [ApiController]
    [Route("users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly GetUserByTenantHandler _getUsersByTenantHandler; 
        private readonly AssignUserToTenantHandler _assignUserToTenantHandler;
        private readonly UpdateUserStatusHandler _updateUserStatusHandler;
        private readonly UpdateUserHandler _updateUserHandler;
        private readonly GetUserByIdHandler _getUserByIdHandler;
        private readonly SearchUserByEmailHandler _searchUserByEmailHandler;

        public UserController(GetUserByTenantHandler getUsersByTenantHandler,
            AssignUserToTenantHandler assignUserToTenantHandler,
            UpdateUserStatusHandler updateUserStatusHandler,
            UpdateUserHandler updateUserHandler,
            GetUserByIdHandler getUserByIdHandler,
            SearchUserByEmailHandler searchUserByEmailHandler)
        {
            _getUsersByTenantHandler = getUsersByTenantHandler;
            _assignUserToTenantHandler = assignUserToTenantHandler;
            _updateUserStatusHandler = updateUserStatusHandler;
            _updateUserHandler = updateUserHandler;
            _getUserByIdHandler = getUserByIdHandler;
            _searchUserByEmailHandler = searchUserByEmailHandler;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsersByTenant([FromQuery] string tenantCode)
        {
            if (string.IsNullOrWhiteSpace(tenantCode))
                return BadRequest("Thiếu tenantCode");
            var users = await _getUsersByTenantHandler.HandleAsync(tenantCode);
            return Ok(users);
        }


        [HttpPost("{userId}/tenants")]
        public async Task<IActionResult> AssignUserToTenant(Guid userId, [FromQuery] string tenantCode)
        {
            if (string.IsNullOrWhiteSpace(tenantCode))
                return BadRequest("Thiếu tenantCode");

            await _assignUserToTenantHandler.HandleAsync(userId, tenantCode);
            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusDto dto)
        {
            await _updateUserStatusHandler.HandleAsync(id, dto.IsActive);
            return NoContent();
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            await _updateUserHandler.HandleAsync(id, dto);
            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _getUserByIdHandler.HandleAsync(id);
            return Ok(user);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUserByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Nhập Email");
            }

            var user = await _searchUserByEmailHandler.HandleAsync(email);
            if (user == null)
            {
               return NotFound("Người dùng không tồn tại");
            }

            return Ok(user);

        }


    }
}
