using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.PermissionGroups.Commands
{
    public class DeletePermissionGroupCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeletePermissionGroupCommandHandler : IRequestHandler<DeletePermissionGroupCommand, Unit>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public DeletePermissionGroupCommandHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(DeletePermissionGroupCommand request, CancellationToken cancellationToken)
        {
            var permissionGroup = await _permissionGroupService.GetByIdAsync(request.Id);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa nhóm quyền này");
            }

            // Xóa nhóm quyền (service sẽ tự động xóa các liên kết với nhân viên thông qua cascade delete)
            await _permissionGroupService.DeleteAsync(permissionGroup);

            return Unit.Value;
        }
    }
}

