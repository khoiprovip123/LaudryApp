using Domain.Interfaces;
using LHK.Security.Users;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Domain.Service;

/// <summary>
/// Implementation của IWorkContext để quản lý IServiceProvider và ICurrentUser
/// </summary>
public class WorkContext : IWorkContext
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ICurrentUser _currentUser;

    public WorkContext(IServiceProvider serviceProvider, ICurrentUser currentUser)
    {
        _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
    }

    public IServiceProvider ServiceProvider => _serviceProvider;

    public ICurrentUser CurrentUser => _currentUser;

    public T GetService<T>() where T : class
    {
        return _serviceProvider.GetRequiredService<T>();
    }

    public T? GetServiceOrDefault<T>() where T : class
    {
        return _serviceProvider.GetService<T>();
    }

    public string? UserId => _currentUser.Id;

    public Guid? CompanyId => _currentUser.CompanyId;

    public bool IsSuperAdmin => _currentUser.IsSuperAdmin;

    public bool IsAuthenticated => _currentUser.IsAuthenticated;
}

