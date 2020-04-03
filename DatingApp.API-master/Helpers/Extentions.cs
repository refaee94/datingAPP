using System;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DatingApp.API.Helpers
{
    public static class Extentions
    {
        public static void AddApplicationError(this HttpResponse response, string message)
        {
            response.Headers.Add("Application-Error", message);
            response.Headers.Add("Access-Control-Expose-Headers","Application-Error");
            response.Headers.Add("Access-Control-Allow-Origin","*");
        }

        public static void AddPaginationHeader(this HttpResponse response, int currentPage, int itemsPerPage,
        int totalItems, int totalPages) {
            var PaginationHeader = new PaginationHeader(currentPage, itemsPerPage, totalItems, totalPages);
            var camelCaseFormatter = new JsonSerializerSettings();
            camelCaseFormatter.ContractResolver = new CamelCasePropertyNamesContractResolver(); 
            response.Headers.Add("Pagination", JsonConvert.SerializeObject(PaginationHeader, camelCaseFormatter));
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }

        public static int CalculateAge(this DateTime fromDateTime)
        {
            var age = DateTime.Today.Year - fromDateTime.Year;
            if (fromDateTime.AddYears(age) > DateTime.Today)
                --age;
            
            return age;
        }
    }
}