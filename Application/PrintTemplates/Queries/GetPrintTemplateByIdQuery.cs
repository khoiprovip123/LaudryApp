using Application.DTOs;
using Domain.Service;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.PrintTemplates.Queries
{
    public class GetPrintTemplateByIdQuery : IRequest<PrintTemplateDto>
    {
        public Guid Id { get; set; }
    }

    public class GetPrintTemplateByIdQueryHandler : IRequestHandler<GetPrintTemplateByIdQuery, PrintTemplateDto>
    {
        private readonly IPrintTemplateService _templateService;

        public GetPrintTemplateByIdQueryHandler(IPrintTemplateService templateService)
        {
            _templateService = templateService;
        }

        public async Task<PrintTemplateDto> Handle(GetPrintTemplateByIdQuery request, CancellationToken cancellationToken)
        {
            var template = await _templateService.GetByIdAsync(request.Id);
            if (template == null)
            {
                throw new Exception("Template không tồn tại.");
            }

            return new PrintTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                TemplateType = template.TemplateType,
                HtmlTemplate = template.HtmlTemplate,
                CssStyles = template.CssStyles,
                IsActive = template.IsActive,
                IsDefault = template.IsDefault,
                Description = template.Description,
                CompanyId = template.CompanyId
            };
        }
    }
}

