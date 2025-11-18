using Application.DTOs;
using Domain.Interfaces;
using Domain.Service;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.PermissionGroups.Queries
{
    public class GetPagePermissionGroupQuery : IRequest<PagedResult<PermissionGroupDto>>
    {
        public int Limit { get; set; } = 10;
        public int Offset { get; set; } = 0;
        public Guid? CompanyId { get; set; } // Filter theo company
    }

    public class GetPagePermissionGroupQueryHandler : IRequestHandler<GetPagePermissionGroupQuery, PagedResult<PermissionGroupDto>>
    {
        private readonly IPermissionGroupService _permissionGroupService;
        private readonly IWorkContext _workContext;

        public GetPagePermissionGroupQueryHandler(IPermissionGroupService permissionGroupService, IWorkContext workContext)
        {
            _permissionGroupService = permissionGroupService;
            _workContext = workContext;
        }

        public async Task<PagedResult<PermissionGroupDto>> Handle(GetPagePermissionGroupQuery request, CancellationToken cancellationToken)
        {
            var query = _permissionGroupService.SearchQuery()
                .Include(g => g.Company)
                .Include(g => g.EmployeePermissionGroups)
                .AsQueryable();

            // SuperAdmin có thể xem tất cả, nhưng nếu có CompanyId filter thì filter theo đó
            // UserRoot chỉ xem nhóm quyền của company mình
            if (!_workContext.IsSuperAdmin)
            {
                var companyId = request.CompanyId ?? _workContext.CompanyId;
                if (companyId.HasValue)
                {
                    query = query.Where(g => g.CompanyId == companyId.Value);
                }
            }
            else if (request.CompanyId.HasValue)
            {
                query = query.Where(g => g.CompanyId == request.CompanyId.Value);
            }

            var totalItems = await query.CountAsync(cancellationToken);

            var permissionGroups = await query
                .AsNoTracking()
                .OrderByDescending(g => g.Name)
                .Skip(request.Offset)
                .Take(request.Limit)
                .ToListAsync(cancellationToken);

            var items = permissionGroups.Select(g => new PermissionGroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                CompanyId = g.CompanyId,
                CompanyName = g.Company?.CompanyName ?? string.Empty,
                Permissions = g.Permissions?.Items ?? new List<string>(),
                Active = g.Active,
                EmployeeCount = g.EmployeePermissionGroups.Count
            }).ToList();

            return new PagedResult<PermissionGroupDto>(totalItems, request.Offset, request.Limit)
            {
                Items = items
            };
        }
    }
}

