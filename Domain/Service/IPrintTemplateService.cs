using Domain.Service;
using Domain.Entity;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Service
{
    public interface IPrintTemplateService : IBaseService<PrintTemplate>
    {
        Task<PrintTemplate> GetDefaultTemplateAsync(string templateType, Guid? companyId);
        Task<PrintTemplate> GetActiveTemplateAsync(string templateType, Guid? companyId);
    }
}

