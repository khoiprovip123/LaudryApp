using Application.Service;
using Domain.Entity;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Service
{
    public class PartnerService : BaseService<Partner>, IPartnerService
    {
        public PartnerService(IAsyncRepository<Partner> repository, IHttpContextAccessor httpContextAccessor) : base(repository, httpContextAccessor)
        {
        }

        public string GetNextPartnerRef()
        {
            var repository = GetService<IAsyncRepository<Partner>>();
            var lastPartner = repository.SearchQuery().OrderByDescending(p => p.Ref).FirstOrDefault();
            int nextNumber = 1;
            if (lastPartner != null && !string.IsNullOrEmpty(lastPartner.Ref))
            {
                var lastRef = lastPartner.Ref;
                if (int.TryParse(lastRef, out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }
            return nextNumber.ToString("D4");
        }

        public string GenerateNameDisplayPartner(string name)
        {
            var prefix = "PRT";
            var nextRefNumber = GetNextPartnerRef();
            return $"{prefix}{nextRefNumber}";
        }
    }
}
