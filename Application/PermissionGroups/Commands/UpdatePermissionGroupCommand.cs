using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.PermissionGroups.Commands
{
    public class UpdatePermissionGroupCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public bool Active { get; set; }
    }

    public class UpdatePermissionGroupCommandHandler : IRequestHandler<UpdatePermissionGroupCommand, Unit>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public UpdatePermissionGroupCommandHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(UpdatePermissionGroupCommand request, CancellationToken cancellationToken)
        {
            var permissionGroup = await _permissionGroupService.GetByIdAsync(request.Id);

            if (permissionGroup == null)
                throw new Exception("Không tìm thấy nhóm quyền");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (permissionGroup.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật nhóm quyền này");
            }

            // Kiểm tra tên nhóm quyền đã tồn tại chưa (trừ chính nó)
            var isExists = await _permissionGroupService.IsNameExistsAsync(request.Name, permissionGroup.CompanyId, request.Id);
            if (isExists)
                throw new Exception("Tên nhóm quyền đã tồn tại trong công ty này");

            // Cập nhật thông tin
            permissionGroup.Name = request.Name;
            permissionGroup.Description = request.Description;
            permissionGroup.Permissions = permissionGroup.Permissions ?? new PermissionList();
            permissionGroup.Permissions.Items = request.Permissions ?? new List<string>();
            permissionGroup.Active = request.Active;

            await _permissionGroupService.UpdateAsync(permissionGroup);

            return Unit.Value;
        }
    }
}

