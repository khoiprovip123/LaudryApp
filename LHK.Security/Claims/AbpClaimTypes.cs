using System.Security.Claims;

namespace LHK.Security.Claims;

public static class AbpClaimTypes
{
    // Chuẩn hệ thống
    public static string UserId { get; set; } = ClaimTypes.NameIdentifier;
    public static string UserName { get; set; } = ClaimTypes.Name;
    public static string Role { get; set; } = ClaimTypes.Role;
    public static string Email { get; set; } = ClaimTypes.Email;
    public static string GivenName { get; set; } = ClaimTypes.GivenName;
    public static string Surname { get; set; } = ClaimTypes.Surname;

    // Các claim bổ sung tùy dự án
    public static string CompanyId { get; set; } = "company_id";
    public static string IsSuperAdmin { get; set; } = "is_super_admin";
    public static string PhoneNumber { get; set; } = "phone_number";
    public static string PhoneNumberVerified { get; set; } = "phone_number_verified";
    public static string TenantId { get; set; } = "tenant_id";

    // Impersonation
    public static string ImpersonatorTenantId { get; set; } = "impersonator_tenantid";
    public static string ImpersonatorUserId { get; set; } = "impersonator_userid";
}
