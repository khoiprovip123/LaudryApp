using Domain.Caching;
using LHK.Share.Users;
using LHK.Share.Users;
using System;

namespace Domain.Interfaces;

/// <summary>
/// WorkContext để quản lý IServiceProvider và ICurrentUser trong Domain layer
/// </summary>
public interface IWorkContext
{
    /// <summary>
    /// Lấy IServiceProvider để resolve services
    /// </summary>
    IServiceProvider ServiceProvider { get; }

    /// <summary>
    /// Lấy ICurrentUser để truy cập thông tin user hiện tại
    /// </summary>
    ICurrentUser CurrentUser { get; }

    /// <summary>
    /// Lấy service từ DI container
    /// </summary>
    T GetService<T>() where T : class;

    /// <summary>
    /// Lấy service từ DI container (có thể null)
    /// </summary>
    T? GetServiceOrDefault<T>() where T : class;

    /// <summary>
    /// Lấy UserId từ CurrentUser
    /// </summary>
    string? UserId { get; }

    /// <summary>
    /// Lấy CompanyId từ CurrentUser
    /// </summary>
    Guid? CompanyId { get; }

    /// <summary>
    /// Kiểm tra user có phải SuperAdmin không
    /// </summary>
    bool IsSuperAdmin { get; }

    /// <summary>
    /// Kiểm tra user đã authenticated chưa
    /// </summary>
    bool IsAuthenticated { get; }
}

