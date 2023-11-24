using Mapper.Mapping;
using Microsoft.Extensions.DependencyInjection;

namespace Mapper
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
