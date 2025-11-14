using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Caching;

namespace Domain;
//public interface IWorkContext
//{
//    List<CompanyDto> GetCompanies();
//    Task<CompanyDto> GetCurrentCompanyAsync();
//    string GetCurrentUserId();
//    ApplicationUserDto GetCurrentUser();
//    T GetService<T>();
//    IDisposable UpdateEnv(bool value);
//    IDisposable UpdateEnv(string uid, bool value);
//    IDisposable WithContext(string key, object value);
//    IDisposable WithContext(Dictionary<string, object> dict);
//    T GetOrDefault<T>(string key, T defaultValue);
//    Task<ApplicationUserDto> GetAdminUserAsync();

//    bool Sudo { get; }
//    string UserId { get; }
//    bool IsAdmin { get; }

//    Guid? CurrentCompanyId { get; }
//    Guid? CurrentPartnerId { get; }
//}
