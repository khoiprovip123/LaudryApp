using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.PrintTemplates.Commands
{
    public class CreatePrintTemplateCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public string TemplateType { get; set; }
        public string HtmlTemplate { get; set; }
        public string CssStyles { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public string Description { get; set; }
    }

    public class CreatePrintTemplateCommandHandler : IRequestHandler<CreatePrintTemplateCommand, Guid>
    {
        private readonly IPrintTemplateService _templateService;
        private readonly IWorkContext _workContext;

        public CreatePrintTemplateCommandHandler(
            IPrintTemplateService templateService,
            IWorkContext workContext)
        {
            _templateService = templateService;
            _workContext = workContext;
        }

        public async Task<Guid> Handle(CreatePrintTemplateCommand request, CancellationToken cancellationToken)
        {
            var companyId = _workContext?.CompanyId;

            // Nếu set làm default, bỏ default của các template khác cùng loại
            if (request.IsDefault)
            {
                var existingTemplates = _templateService.SearchQuery(t => 
                    t.TemplateType == request.TemplateType && 
                    t.IsDefault && 
                    (companyId == null ? t.CompanyId == null : t.CompanyId == companyId));

                foreach (var existingTemplate in existingTemplates)
                {
                    existingTemplate.IsDefault = false;
                    await _templateService.UpdateAsync(existingTemplate);
                }
            }

            var template = new PrintTemplate
            {
                Name = request.Name,
                TemplateType = request.TemplateType,
                HtmlTemplate = request.HtmlTemplate,
                CssStyles = request.CssStyles,
                IsActive = request.IsActive,
                IsDefault = request.IsDefault,
                Description = request.Description,
                CompanyId = companyId
            };

            await _templateService.CreateAsync(template);
            return template.Id;
        }
    }
}

