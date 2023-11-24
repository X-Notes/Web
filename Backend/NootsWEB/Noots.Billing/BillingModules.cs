using Billing.Impl;
using Microsoft.Extensions.DependencyInjection;

namespace Billing;

public static class BillingModules
{
    public static void ApplyBillingDI(this IServiceCollection services)
    {
        services.AddScoped<BillingPermissionService>();
    }
}