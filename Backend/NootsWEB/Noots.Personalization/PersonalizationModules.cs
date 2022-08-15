using Common.DTO.Personalization;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Personalization.Commands;
using Noots.Personalization.Impl;
using Noots.Personalization.Queries;

namespace Noots.Personalization
{
    public static class PersonalizationModules
    {
        public static void ApplyPersonalizationDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>, PersonalizationHandlerQuery>();
            services.AddScoped<IRequestHandler<UpdatePersonalizationSettingsCommand, Unit>, PersonalizationHandlerCommand>();
        }
    }
}