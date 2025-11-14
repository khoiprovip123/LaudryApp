using System;
using System.Security.Claims;

namespace LHK.Share.Users
{
    public interface ICurrentUser
    {
        bool IsAuthenticated { get; }
        string? Id { get; }
        string? UserName { get; }
        string? Email { get; }
        string? PhoneNumber { get; }
        Guid? CompanyId { get; }
        bool IsSuperAdmin { get; }
        string[] Roles { get; }

        Claim? FindClaim(string claimType);
        Claim[] FindClaims(string claimType);
        Claim[] GetAllClaims();
        bool IsInRole(string roleName);
    }
}
