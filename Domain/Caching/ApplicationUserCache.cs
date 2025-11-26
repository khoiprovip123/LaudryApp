using Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Caching
{
    public class ApplicationUserCache : IApplicationUserCache
    {
        private readonly IMemoryCache _memoryCache;
        private readonly UserManager<ApplicationUser> _userManager;
        private static readonly SemaphoreSlim _lock = new(1, 1);

        public ApplicationUserCache(IMemoryCache memoryCache, UserManager<ApplicationUser> userManager)
        {
            _memoryCache = memoryCache;
            _userManager = userManager;
        }

        public async Task<ApplicationUserDto> GetCachedUserAsync(string userId)
        {
            string key = $"user_info_{userId}";
            if (_memoryCache.TryGetValue(key, out ApplicationUserDto applicationUserDto))
            {
                return applicationUserDto;
            }

            await _lock.WaitAsync();

            try
            {
                if (_memoryCache.TryGetValue(key, out applicationUserDto))
                    return applicationUserDto;

                var user = await _userManager.Users.Where(x => x.Id == userId).Select(x => new ApplicationUserDto
                {
                    Id = x.Id,
                    CompanyId = x.CompanyId,
                    IsUserRoot = x.IsUserRoot,
                    Name = x.UserName,
                    UserName = x.UserName,
                    PartnerId = x.PartnerId,
                    Active = x.Active
                }).FirstOrDefaultAsync();

                _memoryCache.Set(key, user, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                    SlidingExpiration = TimeSpan.FromMinutes(2),
                    Priority = CacheItemPriority.Low
                });

                return user;
            }
            finally
            {
                _lock.Release();
            }
        }

        public void RefreshCacheApplicationUser(string userId)
        {
            string key = $"user_info_{userId}";
            _memoryCache.Remove(key);
        }

        public Task RefreshCacheAsync(string userId)
        {
            throw new NotImplementedException();
        }
    }


}

