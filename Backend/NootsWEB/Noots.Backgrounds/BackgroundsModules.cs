using Backgrounds.Commands;
using Backgrounds.Handlers.Commands;
using Backgrounds.Handlers.Queries;
using Backgrounds.Queries;
using Common.DTO;
using Common.DTO.Backgrounds;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Backgrounds;

public static class BackgroundsModules
{
    public static void ApplyBackgroundsDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<RemoveBackgroundCommand, Unit>, RemoveBackgroundCommandHandler>();
        services.AddScoped<IRequestHandler<DefaultBackgroundCommand, Unit>, DefaultBackgroundCommandHandler>();
        services.AddScoped<IRequestHandler<UpdateBackgroundCommand, Unit>, UpdateBackgroundCommandHandler>();
        services.AddScoped<IRequestHandler<NewBackgroundCommand, OperationResult<BackgroundDTO>>, NewBackgroundCommandHandler>();
        
        services.AddScoped<IRequestHandler<GetUserBackgroundsQuery, List<BackgroundDTO>>, GetUserBackgroundsQueryHandler>();
    }
}