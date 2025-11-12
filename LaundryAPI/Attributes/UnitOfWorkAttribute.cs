using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LaundryAPI.Attributes
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class UowAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var uow = context.HttpContext.RequestServices.GetRequiredService<IUnitOfWork>();

            await uow.BeginTransactionAsync();

            var executedContext = await next();

            if (executedContext.Exception == null)
            {
                await uow.CommitAsync();
            }
            else
            {
                await uow.RollbackAsync();
            }
        }
    }
}
