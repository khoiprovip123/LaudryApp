using Domain.Entity;
using Domain.Interfaces;
using Domain.Service;
using MediatR;

namespace Application.PermissionGroups.Commands
{
    public class CreatePermissionGroupCommand : IRequest<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid? CompanyId { get; set; }
        public List<string> Permissions { get; set; } = new List<string>();
        public bool Active { get; set; } = true;
    }

    public class CreatePermissionGroupCommandHandler : IRequestHandler<CreatePermissionGroupCommand, Guid>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public CreatePermissionGroupCommandHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<Guid> Handle(CreatePermissionGroupCommand request, CancellationToken cancellationToken)
        {
            // Xác định CompanyId: SuperAdmin có thể chỉ định, UserRoot dùng company của mình
            var companyId = request.CompanyId;
            if (!_workContext.IsSuperAdmin)
            {
                companyId = _workContext.CompanyId;
                if (!companyId.HasValue)
                    throw new UnauthorizedAccessException("Bạn không thuộc về một cửa hàng");
            }

            // Kiểm tra tên nhóm quyền đã tồn tại chưa trong cùng công ty
            var isExists = await _permissionGroupService.IsNameExistsAsync(request.Name, companyId);
            if (isExists)
                throw new Exception("Tên nhóm quyền đã tồn tại trong công ty này");

            // Tạo nhóm quyền mới
            var permissionGroup = new PermissionGroup
            {
                Name = request.Name,
                Description = request.Description,
                CompanyId = companyId,
                Permissions = new PermissionList { Items = request.Permissions ?? new List<string>() },
                Active = request.Active
            };

            await _permissionGroupService.CreateAsync(permissionGroup);

            return permissionGroup.Id;
        }
    }
}

