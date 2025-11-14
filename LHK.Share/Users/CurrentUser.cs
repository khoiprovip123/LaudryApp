using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Linq;
using System.Security.Principal;
using LHK.Share.Claims;

namespace LHK.Share.Users;

public class CurrentUser : ICurrentUser
{
     private readonly ICurrentPrincipalAccessor _principalAccessor;
        private static readonly Claim[] EmptyClaimsArray = Array.Empty<Claim>();

        public CurrentUser(ICurrentPrincipalAccessor principalAccessor)
        {
            _principalAccessor = principalAccessor;
        }

        private ClaimsPrincipal? Principal => _principalAccessor.Principal;

        public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

        public string? Id => this.FindClaimValue(ClaimTypes.NameIdentifier);

        public string? UserName => this.FindClaimValue(ClaimTypes.Name);

        public string? Email => this.FindClaimValue(ClaimTypes.Email);

        public string? PhoneNumber => this.FindClaimValue(ClaimTypes.MobilePhone);

        public Guid? CompanyId
        {
            get
            {
                var value = this.FindClaimValue("company_id");
                return Guid.TryParse(value, out var id) ? id : null;
            }
        }

        public bool IsSuperAdmin =>
            string.Equals(this.FindClaimValue("is_super_admin"), "true", StringComparison.OrdinalIgnoreCase);

        public string[] Roles =>
            Principal?.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToArray() ?? Array.Empty<string>();


        public virtual Claim? FindClaim(string claimType)
        {
            return Principal?.Claims.FirstOrDefault(c => c.Type == claimType);
        }

        public virtual Claim[] FindClaims(string claimType)
        {
            return Principal?.Claims.Where(c => c.Type == claimType).ToArray() ?? EmptyClaimsArray;
        }

        public virtual Claim[] GetAllClaims()
        {
            return Principal?.Claims.ToArray() ?? EmptyClaimsArray;
        }

        public virtual bool IsInRole(string roleName)
        {
            return Roles.Contains(roleName, StringComparer.OrdinalIgnoreCase);
        }
}
