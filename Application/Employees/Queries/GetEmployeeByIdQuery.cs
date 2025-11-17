using Application.DTOs;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Domain.Entity;

namespace Application.Employees.Queries
{
    public class GetEmployeeByIdQuery : IRequest<EmployeeDto>
    {
        public Guid Id { get; set; }
    }

    public class GetEmployeeByIdQueryHandler : IRequestHandler<GetEmployeeByIdQuery, EmployeeDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWorkContext _workContext;

        public GetEmployeeByIdQueryHandler(UserManager<ApplicationUser> userManager, IWorkContext workContext)
        {
            _userManager = userManager;
            _workContext = workContext;
        }

        public async Task<EmployeeDto> Handle(GetEmployeeByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());
            if (user == null)
                throw new Exception("Không tìm thấy nhân viên");

            // Kiểm tra quyền: SuperAdmin hoặc UserRoot của cùng company
            if (!_workContext.IsSuperAdmin)
            {
                if (user.CompanyId != _workContext.CompanyId)
                    throw new UnauthorizedAccessException("Bạn không có quyền xem nhân viên này");
            }

            var roles = await _userManager.GetRolesAsync(user);

            return new EmployeeDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                CompanyId = user.CompanyId,
                CompanyName = user.Company?.CompanyName ?? string.Empty,
                IsUserRoot = user.IsUserRoot,
                Active = user.Active,
                Roles = roles.ToList()
            };
        }
    }
}

