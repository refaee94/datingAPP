using System.Collections.Generic;
using System.Linq;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public static class Seed
    {
        private static T GetAppService<T>(IApplicationBuilder app)
        {
            var scopedFactory = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>();
            var scope = scopedFactory.CreateScope();
            return scope.ServiceProvider.GetRequiredService<T>();
        }
        public static async void SeedUsers(this IApplicationBuilder app)
        {
            var authRepository = GetAppService<IAuthRepository>(app);
            // var context = GetAppService<DataContext>(app);
            // if (context.Users.Any())
            // {
            var userData = System.IO.File.ReadAllText("Data\\UserSeedData.json");
            var users = JsonConvert.DeserializeObject<List<User>>(userData);
            foreach (var user in users)
            {
                await authRepository.Register(user, "password");
            }
            // }
        }
    }
}