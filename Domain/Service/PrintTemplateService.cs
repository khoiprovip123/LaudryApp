using Domain.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class PrintTemplateService : BaseService<PrintTemplate>, IPrintTemplateService
    {
        public PrintTemplateService(IAsyncRepository<PrintTemplate> repository, IHttpContextAccessor httpContextAccessor) 
            : base(repository, httpContextAccessor)
        {
        }

        public async Task<PrintTemplate> GetDefaultTemplateAsync(string templateType, Guid? companyId)
        {
            var query = SearchQuery(t => t.TemplateType == templateType && t.IsActive && t.IsDefault);

            if (companyId.HasValue)
            {
                query = query.Where(t => t.CompanyId == companyId || t.CompanyId == null);
            }
            else
            {
                query = query.Where(t => t.CompanyId == null);
            }

            return await query
                .OrderByDescending(t => t.CompanyId.HasValue) // Ưu tiên template của company trước
                .FirstOrDefaultAsync();
        }

        public async Task<PrintTemplate> GetActiveTemplateAsync(string templateType, Guid? companyId)
        {
            var query = SearchQuery(t => t.TemplateType == templateType && t.IsActive);

            if (companyId.HasValue)
            {
                query = query.Where(t => t.CompanyId == companyId || t.CompanyId == null);
            }
            else
            {
                query = query.Where(t => t.CompanyId == null);
            }

            return await query
                .OrderByDescending(t => t.CompanyId.HasValue) // Ưu tiên template của company trước
                .ThenByDescending(t => t.IsDefault)
                .FirstOrDefaultAsync();
        }
    }
}

