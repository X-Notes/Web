using Microsoft.Extensions.DependencyInjection;


namespace Noots.MapperLocked
{
    public static class MapperLockedModules
    {
        public static void ApplyMapperLockedDI(this IServiceCollection services)
        {
            services.AddScoped<MapperLockedEntities>();
        }
    }
}
