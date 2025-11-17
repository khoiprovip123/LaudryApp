using Application.DTOs;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Domain.Entity;

namespace Application.Employees.Queries
{
    public class GetPageEmployeeQuery : IRequest<PagedResult<EmployeeDto>>
    {
        public int Limit { get; set; } = 10;
        public int Offset { get; set; } = 0;
        public Guid? CompanyId { get; set; } // Filter theo company
    }

    public class GetPageEmployeeQueryHandler : IRequestHandler<GetPageEmployeeQuery, PagedResult<EmployeeDto>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWorkContext _workContext;

        public GetPageEmployeeQueryHandler(UserManager<ApplicationUser> userManager, IWorkContext workContext)
        {
            _userManager = userManager;
            _workContext = workContext;
        }

        public async Task<PagedResult<EmployeeDto>> Handle(GetPageEmployeeQuery request, CancellationToken cancellationToken)
        {
            var query = _userManager.Users.AsQueryable();

            // SuperAdmin có thể xem tất cả, nhưng nếu có CompanyId filter thì filter theo đó
            // UserRoot chỉ xem nhân viên của company mình
            if (!_workContext.IsSuperAdmin)
            {
                var companyId = request.CompanyId ?? _workContext.CompanyId;
                if (companyId.HasValue)
                {
                    query = query.Where(u => u.CompanyId == companyId.Value);
                }
            }
            else if (request.CompanyId.HasValue)
            {
                query = query.Where(u => u.CompanyId == request.CompanyId.Value);
            }

            // Loại bỏ SuperAdmin và chỉ lấy nhân viên (không phải IsUserRoot)
            query = query.Where(u => !u.IsSuperAdmin && !u.IsUserRoot);

            var totalItems = await query.CountAsync(cancellationToken);

            var users = await query
                .Include(u => u.Company)
                .AsNoTracking()
                .OrderByDescending(u => u.UserName)
                .Skip(request.Offset)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var items = new List<EmployeeDto>();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                items.Add(new EmployeeDto
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
                });
            }

            return new PagedResult<EmployeeDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items
            };
        }
    }
}

