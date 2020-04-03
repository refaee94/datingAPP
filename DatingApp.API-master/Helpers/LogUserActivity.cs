using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
namespace DatingApp.API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var resultContext = await next();
            var userId = int.Parse(context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var datingRepository = context.HttpContext.RequestServices.GetService<IDatingRepository>();
            var user = await datingRepository.GetUserAsync(userId);
            user.LastActive = DateTime.Now;
            await datingRepository.SaveAll();
        }
    }
}