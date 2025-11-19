using Domain.Interfaces;
using Domain.Service;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.PrintTemplates.Commands
{
    public class DeletePrintTemplateCommand : IRequest
    {
        public Guid Id { get; set; }
    }

    public class DeletePrintTemplateCommandHandler : IRequestHandler<DeletePrintTemplateCommand>
    {
        private readonly IPrintTemplateService _templateService;
        private readonly IWorkContext _workContext;

        public DeletePrintTemplateCommandHandler(
            IPrintTemplateService templateService,
            IWorkContext workContext)
        {
            _templateService = templateService;
            _workContext = workContext;
        }

        public async Task Handle(DeletePrintTemplateCommand request, CancellationToken cancellationToken)
        {
            var template = await _templateService.GetByIdAsync(request.Id);
            if (template == null)
            {
                throw new Exception("Template không tồn tại.");
            }

            var companyId = _workContext?.CompanyId;
            if (template.CompanyId != companyId)
            {
                throw new Exception("Không có quyền xóa template này.");
            }

            await _templateService.DeleteAsync(template);
        }
    }
}

