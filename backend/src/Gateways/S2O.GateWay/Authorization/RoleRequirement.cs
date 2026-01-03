using Microsoft.AspNetCore.Authorization;

namespace S2O.GateWay.Authorization
{
    public class RoleRequirement : IAuthorizationRequirement
    {
        public string[] AllowedRoles {  get; }

        public RoleRequirement(params string[] roles)
        {
            AllowedRoles = roles;
        }
    }
}
