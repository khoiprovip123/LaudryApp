using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace LaundryAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        private ISender _mediator = null!;

        protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

       // protected IWorkContext WorkContext => HttpContext.RequestServices.GetRequiredService<IWorkContext>();

        protected string UserId
        {
            get
            {
                if (!User.Identity.IsAuthenticated)
                    return null;

                return User.FindFirst(ClaimTypes.NameIdentifier).Value;
            }
        }

        //protected Guid CompanyId
        //{
        //    get
        //    {
        //        return WorkContext.GetCurrentCompanyAsync().GetAwaiter().GetResult().Id;
        //    }
        //}

        protected Guid UserPartnerId
        {
            get
            {
                if (!User.Identity.IsAuthenticated)
                    return Guid.Empty;
                var claim = User.Claims.FirstOrDefault(x => x.Type == "partner_id");
                return claim != null ? Guid.Parse(claim.Value) : Guid.Empty;
            }
        }
    }
}