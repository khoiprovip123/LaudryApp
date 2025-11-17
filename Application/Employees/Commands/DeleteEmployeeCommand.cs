using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Domain.Entity;

namespace Application.Employees.Commands
{
    public class DeleteEmployeeCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }

    public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, Unit>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWorkContext _workContext;

        public DeleteEmployeeCommandHandler(UserManager<ApplicationUser> userManager, IWorkContext workContext)
        {
            _userManager = userManager;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (user.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa nhân viên này");
            }

            // Không cho phép xóa SuperAdmin hoặc UserRoot
            if (user.IsSuperAdmin || user.IsUserRoot)
                throw new UnauthorizedAccessException("Không thể xóa SuperAdmin hoặc chủ cửa hàng");

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Không thể xóa nhân viên: {errors}");
            }

            return Unit.Value;
        }
    }
}

