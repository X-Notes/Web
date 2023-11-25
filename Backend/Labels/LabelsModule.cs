using Common.DTO;
using Common.DTO.Labels;
using Labels.Commands;
using Labels.Handlers.Commands;
using Labels.Handlers.Queries;
using Labels.Queries;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Labels;

public static class LabelsModule
{
    public static void ApplyLabelsDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<NewLabelCommand, OperationResult<Guid>>, NewLabelCommandHandler>();
        services.AddScoped<IRequestHandler<DeleteLabelCommand, Unit>, DeleteLabelCommandHandler>();
        services.AddScoped<IRequestHandler<UpdateLabelCommand, Unit>, UpdateLabelCommandHandler>();
        services.AddScoped<IRequestHandler<SetDeletedLabelCommand, Unit>, SetDeletedLabelCommandHandler>();
        services.AddScoped<IRequestHandler<RestoreLabelCommand, Unit>, RestoreLabelCommandHandler>();
        services.AddScoped<IRequestHandler<RemoveAllFromBinCommand, Unit>, RemoveAllFromBinCommandHandler>();
        services.AddScoped<IRequestHandler<UpdatePositionsLabelCommand, OperationResult<Unit>>, UpdatePositionsLabelCommandHandler>();
        
        services.AddScoped<IRequestHandler<GetLabelsQuery, List<LabelDTO>>, GetLabelsQueryHandler>();
        services.AddScoped<IRequestHandler<GetCountNotesByLabelQuery, int>, GetCountNotesByLabelQueryHandler>();
    }
}