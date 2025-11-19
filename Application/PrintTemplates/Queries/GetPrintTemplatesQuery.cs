using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.PrintTemplates.Queries
{
    public class GetPrintTemplatesQuery : IRequest<List<PrintTemplateDto>>
    {
        public string? TemplateType { get; set; }
    }

    public class GetPrintTemplatesQueryHandler : IRequestHandler<GetPrintTemplatesQuery, List<PrintTemplateDto>>
    {
        private readonly IPrintTemplateService _templateService;
        private readonly IWorkContext _workContext;

        public GetPrintTemplatesQueryHandler(
            IPrintTemplateService templateService,
            IWorkContext workContext)
        {
            _templateService = templateService;
            _workContext = workContext;
        }

        public async Task<List<PrintTemplateDto>> Handle(GetPrintTemplatesQuery request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;

            var query = _templateService.SearchQuery();

            if (companyId.HasValue)
            {
                query = query.Where(t => t.CompanyId == companyId || t.CompanyId == null);
            }
            else
            {
                query = query.Where(t => t.CompanyId == null);
            }

            if (!string.IsNullOrWhiteSpace(request.TemplateType))
            {
                query = query.Where(t => t.TemplateType == request.TemplateType);
            }

            var templates = await query
                .OrderByDescending(t => t.CompanyId.HasValue)
                .ThenByDescending(t => t.IsDefault)
                .ThenBy(t => t.Name)
                .ToListAsync(cancellationToken);

            return templates.Select(t => new PrintTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                TemplateType = t.TemplateType,
                HtmlTemplate = t.HtmlTemplate,
                CssStyles = t.CssStyles,
                IsActive = t.IsActive,
                IsDefault = t.IsDefault,
                Description = t.Description,
                CompanyId = t.CompanyId
            }).ToList();
        }
    }
}

