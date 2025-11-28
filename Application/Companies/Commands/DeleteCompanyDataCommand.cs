using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Companies.Commands
{
    public class DeleteCompanyDataCommand : IRequest
    {
        public Guid CompanyId { get; set; }
    }

    public class DeleteCompanyDataCommandHandler : IRequestHandler<DeleteCompanyDataCommand>
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IPartnerService _partnerService;
        private readonly IServiceService _serviceService;
        private readonly IPrintTemplateService _printTemplateService;
        private readonly IIRSequenceService _irSequenceService;
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;
        private readonly IAsyncRepository<EmployeePermissionGroup> _employeePermissionGroupRepository;

        public DeleteCompanyDataCommandHandler(
            IOrderService orderService,
            IPaymentService paymentService,
            IPartnerService partnerService,
            IServiceService serviceService,
            IPrintTemplateService printTemplateService,
            IIRSequenceService irSequenceService,
            IPermissionGroupService permissionGroupService,
            IWorkContext workContext,
            IAsyncRepository<EmployeePermissionGroup> employeePermissionGroupRepository)
        {
            _orderService = orderService;
            _paymentService = paymentService;
            _partnerService = partnerService;
            _serviceService = serviceService;
            _printTemplateService = printTemplateService;
            _irSequenceService = irSequenceService;
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
            _employeePermissionGroupRepository = employeePermissionGroupRepository;
        }

        public async Task Handle(DeleteCompanyDataCommand request, CancellationToken cancellationToken)
        {
            var currentCompanyId = _workContext?.CompanyId;
            
            // Chỉ cho phép xóa dữ liệu của chính company của user
            if (currentCompanyId != request.CompanyId)
            {
                throw new Exception("Không có quyền xóa dữ liệu của company này.");
            }

            // 1. Xóa Payments trước (vì có foreign key đến Orders)
            var payments = await _paymentService.SearchQuery(p => p.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (payments.Any())
            {
                await _paymentService.DeleteAsync(payments);
            }

            // 2. Xóa Orders và OrderItems (OrderItems sẽ được xóa cascade)
            var orders = await _orderService.SearchQuery(o => o.CompanyId == request.CompanyId)
                .Include(o => o.OrderItems)
                .ToListAsync(cancellationToken);
            
            if (orders.Any())
            {
                await _orderService.DeleteAsync(orders);
            }

            // 3. Xóa Partners
            var partners = await _partnerService.SearchQuery(p => p.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (partners.Any())
            {
                await _partnerService.DeleteAsync(partners);
            }

            // 4. Xóa Services
            var services = await _serviceService.SearchQuery(s => s.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (services.Any())
            {
                await _serviceService.DeleteAsync(services);
            }

            // 5. Xóa PrintTemplates
            var printTemplates = await _printTemplateService.SearchQuery(t => t.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (printTemplates.Any())
            {
                await _printTemplateService.DeleteAsync(printTemplates);
            }

            // 6. Xóa IRSequences
            var irSequences = await _irSequenceService.SearchQuery(s => s.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (irSequences.Any())
            {
                await _irSequenceService.DeleteAsync(irSequences);
            }

            // 7. Xóa EmployeePermissionGroups trước (liên kết với PermissionGroups của company)
            var permissionGroupIds = await _permissionGroupService.SearchQuery(pg => pg.CompanyId == request.CompanyId)
                .Select(pg => pg.Id)
                .ToListAsync(cancellationToken);
            
            if (permissionGroupIds.Any())
            {
                var employeePermissionGroups = await _employeePermissionGroupRepository.Table
                    .Where(epg => permissionGroupIds.Contains(epg.PermissionGroupId))
                    .ToListAsync(cancellationToken);
                
                if (employeePermissionGroups.Any())
                {
                    await _employeePermissionGroupRepository.DeleteAsync(employeePermissionGroups, autoSave: false);
                }
            }

            // 8. Xóa PermissionGroups
            var permissionGroups = await _permissionGroupService.SearchQuery(pg => pg.CompanyId == request.CompanyId)
                .ToListAsync(cancellationToken);
            if (permissionGroups.Any())
            {
                await _permissionGroupService.DeleteAsync(permissionGroups);
            }
        }
    }
}

