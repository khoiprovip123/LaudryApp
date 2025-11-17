using Domain.Constants;
using Domain.Entity;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Employees.Commands
{
    public class CreateEmployeeCommand : IRequest<Guid>
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public Guid? CompanyId { get; set; }
        public bool Active { get; set; } = true;
    }

    public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Guid>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWorkContext _workContext;

        public CreateEmployeeCommandHandler(UserManager<ApplicationUser> userManager, IWorkContext workContext)
        {
            _userManager = userManager;
            _workContext = workContext;
        }

        public async Task<Guid> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            // Xác định CompanyId: SuperAdmin có thể chỉ định, UserRoot dùng company của mình
            var companyId = request.CompanyId;
            if (!_workContext.IsSuperAdmin)
            {
                companyId = _workContext.CompanyId;
                if (!companyId.HasValue)
                    throw new UnauthorizedAccessException("Bạn không thuộc về một cửa hàng");
            }

            // Kiểm tra username đã tồn tại chưa
            var existingUser = await _userManager.FindByNameAsync(request.UserName);
            if (existingUser != null)
                throw new Exception("Tên đăng nhập đã tồn tại");

            // Tạo user mới
            var user = new ApplicationUser
            {
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                CompanyId = companyId,
                IsUserRoot = false, // Không phải chủ cửa hàng
                IsSuperAdmin = false,
                Active = request.Active
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Không thể tạo nhân viên: {errors}");
            }

            return user.Id;
        }
    }
}

