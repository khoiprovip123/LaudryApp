using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Caching
{
    public interface IApplicationUserCache
    {
        Task<ApplicationUserDto> GetCachedUserAsync(string userId);
        void RefreshCacheApplicationUser(string userId);
        Task RefreshCacheAsync(string userId);
    }
}
