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

<<<<<<< HEAD
            var result = await roleManager.CreateAsync(role: new Role(roleName));
=======
            var result = await roleManager.CreateAsync(new Role {Name = roleName });
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok($"Role '{roleName}' create successfully.");
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignRoleDTO([FromBody] AssignRoleDTO dto)
        {
<<<<<<< HEAD
            var user = await userManager.FindByEmailAsync(dto.Email);
=======
            var user = await userManager.FindByIdAsync(dto.Email);
>>>>>>> 1f4ad3f4fda89f4fe8f6f98a1e5c632ecec42cc7
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
