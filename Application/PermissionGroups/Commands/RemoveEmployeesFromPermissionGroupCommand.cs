using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.PermissionGroups.Commands
{
    public class RemoveEmployeesFromPermissionGroupCommand : IRequest<Unit>
    {
        public Guid PermissionGroupId { get; set; }
        public List<string> EmployeeIds { get; set; } = new List<string>();
    }

    public class RemoveEmployeesFromPermissionGroupCommandHandler : IRequestHandler<RemoveEmployeesFromPermissionGroupCommand, Unit>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public RemoveEmployeesFromPermissionGroupCommandHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(RemoveEmployeesFromPermissionGroupCommand request, CancellationToken cancellationToken)
        {
            var permissionGroup = await _permissionGroupService.GetByIdAsync(request.PermissionGroupId);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa nhân viên khỏi nhóm quyền này");
            }

            // Xóa các nhân viên khỏi nhóm quyền
            await _permissionGroupService.RemoveEmployeesFromPermissionGroupAsync(request.PermissionGroupId, request.EmployeeIds);

            return Unit.Value;
        }
    }
}

