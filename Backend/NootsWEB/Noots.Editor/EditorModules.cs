using Common.DTO;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Editor.Commands;
using Noots.Editor.Entities.EditorStructure;
using Noots.Editor.Handlers;
using Noots.Editor.Impl;

namespace Noots.Editor;

public static class EditorModules
{
    public static void ApplyEditorDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<UpdateTitleNoteCommand, OperationResult<Unit>>, UpdateTitleCommandHandler>();
        services.AddScoped<IRequestHandler<UpdateTextContentsCommand, OperationResult<Unit>>, UpdateTextContentsCommandHandler>();
        services.AddScoped<IRequestHandler<SyncStructureCommand, OperationResult<NoteStructureResult>>, SyncStructureCommandHandler>();

        services.AddScoped<EditorSignalRService>();
    }
}
