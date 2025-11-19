using Domain.Interfaces;
using Domain.Service;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.PrintTemplates.Commands
{
    public class UpdatePrintTemplateCommand : IRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string TemplateType { get; set; }
        public string HtmlTemplate { get; set; }
        public string CssStyles { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public string Description { get; set; }
    }

    public class UpdatePrintTemplateCommandHandler : IRequestHandler<UpdatePrintTemplateCommand>
    {
        private readonly IPrintTemplateService _templateService;
        private readonly IWorkContext _workContext;

        public UpdatePrintTemplateCommandHandler(
            IPrintTemplateService templateService,
            IWorkContext workContext)
        {
            _templateService = templateService;
            _workContext = workContext;
        }

        public async Task Handle(UpdatePrintTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await _templateService.GetByIdAsync(request.Id);
            if (template == null)
            {
                throw new Exception("Template không tồn tại.");
            }

            var companyId = _workContext?.CompanyId;
            if (template.CompanyId != companyId)
            {
                throw new Exception("Không có quyền chỉnh sửa template này.");
            }

            // Nếu set làm default, bỏ default của các template khác cùng loại
            if (request.IsDefault && !template.IsDefault)
            {
                var existingTemplates = _templateService.SearchQuery(t => 
                    t.Id != request.Id &&
                    t.TemplateType == request.TemplateType && 
                    t.IsDefault && 
                    (companyId == null ? t.CompanyId == null : t.CompanyId == companyId));

                foreach (var existingTemplate in existingTemplates)
                {
                    existingTemplate.IsDefault = false;
                    await _templateService.UpdateAsync(existingTemplate);
                }
            }

            template.Name = request.Name;
            template.TemplateType = request.TemplateType;
            template.HtmlTemplate = request.HtmlTemplate;
            template.CssStyles = request.CssStyles;
            template.IsActive = request.IsActive;
            template.IsDefault = request.IsDefault;
            template.Description = request.Description;

            await _templateService.UpdateAsync(template);
        }
    }
}

