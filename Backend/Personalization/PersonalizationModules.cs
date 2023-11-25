using Common.DTO;
using Common.DTO.Personalization;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Personalization.Commands;
using Personalization.Impl;
using Personalization.Queries;

namespace Personalization
{
    public static class PersonalizationModules
    {
        public static void ApplyPersonalizationDI(this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<GetUserPersonalizationSettingsQuery, PersonalizationSettingDTO>, PersonalizationHandlerQuery>();
            services.AddScoped<IRequestHandler<UpdatePersonalizationSettingsCommand, OperationResult<Unit>>, PersonalizationHandlerCommand>();
        }
    }
}