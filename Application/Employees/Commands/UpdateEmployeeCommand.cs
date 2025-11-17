using Domain.Constants;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Domain.Entity;
using System;

namespace Application.Employees.Commands
{
    public class UpdateEmployeeCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public bool Active { get; set; }
    }

    public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Unit>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWorkContext _workContext;

        public UpdateEmployeeCommandHandler(UserManager<ApplicationUser> userManager, IWorkContext workContext)
        {
            _userManager = userManager;
            _workContext = workContext;
        }

        public async Task<Unit> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (user.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật nhân viên này");
            }

            // Không cho phép sửa SuperAdmin hoặc UserRoot
            if (user.IsSuperAdmin || user.IsUserRoot)
                throw new UnauthorizedAccessException("Không thể cập nhật SuperAdmin hoặc chủ cửa hàng");

            // Cập nhật thông tin
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.Active = request.Active;

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                throw new Exception($"Không thể cập nhật nhân viên: {errors}");
            }

            return Unit.Value;
        }
    }
}

