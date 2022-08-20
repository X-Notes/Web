using Common.DTO;
using Common.DTO.Backgrounds;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Backgrounds.Commands;
using Noots.Backgrounds.Handlers.Commands;
using Noots.Backgrounds.Handlers.Queries;
using Noots.Backgrounds.Queries;

namespace Noots.Backgrounds;

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