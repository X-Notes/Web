using Microsoft.Extensions.DependencyInjection;
using Noots.Billing.Impl;

namespace Noots.Billing;

public static class BillingModules
{
    public static void ApplyBillingDI(this IServiceCollection services)
    {
        services.AddScoped<BillingPermissionService>();
    }
}