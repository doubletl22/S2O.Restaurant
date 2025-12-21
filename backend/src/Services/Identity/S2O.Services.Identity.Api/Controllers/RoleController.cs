using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using S2O.Services.Identity.Application.DTOs;
using S2O.Services.Identity.Domain.Entities;
using System.Threading.Tasks;

namespace S2O.Services.Identity.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<Role> roleManager;
        private readonly UserManager<User> userManager;

        public RoleController(RoleManager<Role> roleManager, UserManager<User> userManager)
        {
            this.roleManager = roleManager;
            this.userManager = userManager;
        }


        [HttpPost("create")]
        public async Task<IActionResult> CreateRole([FromBody] string roleName)
        {
            if (await roleManager.RoleExistsAsync(roleName))
            {
                return BadRequest($"Role '{roleName}' already exit");
            }

            var result = await roleManager.CreateAsync(role: new Role(roleName));
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok($"Role '{roleName}' create successfully.");
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRoleDTO([FromBody] AssignRoleDTO dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return NotFound($"User with email '{dto.Email}' not found");
            }

            var result = await userManager.AddToRoleAsync(user, dto.RoleName);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok($"Role '{dto.RoleName}' assigned to user '{dto.Email}' successfully");

        }
    }
}
