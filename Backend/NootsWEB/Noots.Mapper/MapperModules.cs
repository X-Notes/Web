using Microsoft.Extensions.DependencyInjection;
using Noots.Mapper.Mapping;

namespace Noots.Mapper
{
    public static class MapperModules
    {
        public static void ApplyMapperDI(this IServiceCollection services)
        {
            services.AddScoped<NoteFolderLabelMapper>();
            services.AddScoped<AppTypesMapper>();
            services.AddScoped<UserBackgroundMapper>();
        }
    }
}
