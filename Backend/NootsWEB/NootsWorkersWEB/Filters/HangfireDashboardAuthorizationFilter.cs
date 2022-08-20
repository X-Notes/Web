using Hangfire.Dashboard;

namespace NootsWorkersWEB.Filters
{
    public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            // Allow all authenticated users to see the Dashboard (potentially dangerous).
            Console.WriteLine("httpContext.User.Identity: " + httpContext.User.Identity.IsAuthenticated);
            return httpContext.User.Identity.IsAuthenticated;
        }
    }
}
