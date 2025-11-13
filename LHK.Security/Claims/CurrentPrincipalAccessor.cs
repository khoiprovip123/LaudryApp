using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace LHK.Security.Claims;

public class CurrentPrincipalAccessor : ICurrentPrincipalAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentPrincipalAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public ClaimsPrincipal Principal => _httpContextAccessor.HttpContext?.User ?? new ClaimsPrincipal();

    public IDisposable Change(ClaimsPrincipal principal)
    {
        // Simple implementation - in a more complex scenario, you might want to use AsyncLocal
        // For now, we'll just return a no-op disposable since HttpContext.User is already set by authentication middleware
        return new NoOpDisposable();
    }

    private class NoOpDisposable : IDisposable
    {
        public void Dispose() { }
    }
}

