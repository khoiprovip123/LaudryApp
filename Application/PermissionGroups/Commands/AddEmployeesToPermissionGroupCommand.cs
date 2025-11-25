using Domain.Interfaces;
using Domain.Service;
using MediatR;
using System.Linq;

namespace Application.PermissionGroups.Commands
{
    public class AddEmployeesToPermissionGroupCommand : IRequest<Unit>
    {
        public Guid PermissionGroupId { get; set; }
        public List<string> EmployeeIds { get; set; } = new List<string>();
    }

    public class AddEmployeesToPermissionGroupCommandHandler : IRequestHandler<AddEmployeesToPermissionGroupCommand, Unit>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public AddEmployeesToPermissionGroupCommandHandler(
            IPermissionGroupService permissionGroupService, 
            IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(AddEmployeesToPermissionGroupCommand request, CancellationToken cancellationToken)
        {
            var permissionGroup = await _permissionGroupService.GetByIdAsync(request.PermissionGroupId);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền thêm nhân viên vào nhóm quyền này");
            }

            // Kiểm tra nhân viên có thuộc cùng công ty không (nếu không phải SuperAdmin)
            if (!_workContext.IsSuperAdmin && permissionGroup.CompanyId.HasValue)
            {
                var employees = await _permissionGroupService.ValidateEmployeesBelongToCompanyAsync(request.EmployeeIds, permissionGroup.CompanyId.Value);

                var invalidEmployees = employees.Where(e => e.CompanyId != permissionGroup.CompanyId).ToList();
                if (invalidEmployees.Any())
                    throw new Exception($"Các nhân viên không thuộc công ty này: {string.Join(", ", invalidEmployees.Select(e => e.UserName))}");
            }

            // Thêm các nhân viên vào nhóm quyền
            await _permissionGroupService.AddEmployeesToPermissionGroupAsync(request.PermissionGroupId, request.EmployeeIds);

            return Unit.Value;
        }
    }
}

