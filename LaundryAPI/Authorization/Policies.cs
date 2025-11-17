using Domain.Constants;
using Microsoft.AspNetCore.Authorization;

namespace LaundryAPI.Authorization
{
    /// <summary>
    /// Định nghĩa các Authorization Policies
    /// </summary>
    public static class Policies
    {
        public const string CompanyManagement = "CompanyManagement";
        public const string PartnerManagement = "PartnerManagement";
        public const string ServiceManagement = "ServiceManagement";
        public const string OrderManagement = "OrderManagement";
        public const string PaymentManagement = "PaymentManagement";

        /// <summary>
        /// Cấu hình các Authorization Policies
        /// </summary>
        public static void ConfigurePolicies(AuthorizationOptions options)
        {
            // Company Management Policy
            options.AddPolicy(CompanyManagement, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(context =>
                {
                    var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");
                    if (isSuperAdmin) return true;

                    var isUserRoot = context.User.HasClaim("is_user_root", "true");
                    if (isUserRoot) return true;

                    return context.User.HasClaim("permission", Permissions.Companies_View) ||
                           context.User.HasClaim("permission", Permissions.Companies_Create) ||
                           context.User.HasClaim("permission", Permissions.Companies_Update) ||
                           context.User.HasClaim("permission", Permissions.Companies_Delete);
                });
            });

            // Partner Management Policy
            options.AddPolicy(PartnerManagement, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(context =>
                {
                    var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");
                    if (isSuperAdmin) return true;

                    var isUserRoot = context.User.HasClaim("is_user_root", "true");
                    if (isUserRoot) return true;

                    return context.User.HasClaim("permission", Permissions.Partners_View) ||
                           context.User.HasClaim("permission", Permissions.Partners_Create) ||
                           context.User.HasClaim("permission", Permissions.Partners_Update) ||
                           context.User.HasClaim("permission", Permissions.Partners_Delete);
                });
            });

            // Service Management Policy
            options.AddPolicy(ServiceManagement, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(context =>
                {
                    var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");
                    if (isSuperAdmin) return true;

                    var isUserRoot = context.User.HasClaim("is_user_root", "true");
                    if (isUserRoot) return true;

                    return context.User.HasClaim("permission", Permissions.Services_View) ||
                           context.User.HasClaim("permission", Permissions.Services_Create) ||
                           context.User.HasClaim("permission", Permissions.Services_Update) ||
                           context.User.HasClaim("permission", Permissions.Services_Delete);
                });
            });

            // Order Management Policy
            options.AddPolicy(OrderManagement, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(context =>
                {
                    var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");
                    if (isSuperAdmin) return true;

                    var isUserRoot = context.User.HasClaim("is_user_root", "true");
                    if (isUserRoot) return true;

                    return context.User.HasClaim("permission", Permissions.Orders_View) ||
                           context.User.HasClaim("permission", Permissions.Orders_Create) ||
                           context.User.HasClaim("permission", Permissions.Orders_Update) ||
                           context.User.HasClaim("permission", Permissions.Orders_Delete);
                });
            });

            // Payment Management Policy
            options.AddPolicy(PaymentManagement, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireAssertion(context =>
                {
                    var isSuperAdmin = context.User.HasClaim("is_super_admin", "true");
                    if (isSuperAdmin) return true;

                    var isUserRoot = context.User.HasClaim("is_user_root", "true");
                    if (isUserRoot) return true;

                    return context.User.HasClaim("permission", Permissions.Payments_View) ||
                           context.User.HasClaim("permission", Permissions.Payments_Create) ||
                           context.User.HasClaim("permission", Permissions.Payments_Update) ||
                           context.User.HasClaim("permission", Permissions.Payments_Delete);
                });
            });
        }
    }
}

