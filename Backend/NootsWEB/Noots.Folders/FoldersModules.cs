using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Folders.AdditionalContent;
using Common.DTO.Notes;
using Folders.Commands;
using Folders.Commands.FolderInner;
using Folders.Commands.Sync;
using Folders.Entities;
using Folders.Handlers.Commands;
using Folders.Handlers.Commands.Sync;
using Folders.Handlers.Queries;
using Folders.Impl;
using Folders.Queries;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Folders;

public static class FoldersModules
{
    public static void ApplyFoldersDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<NewFolderCommand, OperationResult<SmallFolder>>, NewFolderCommandHandler>();
        services.AddScoped<IRequestHandler<ArchiveFolderCommand, OperationResult<Unit>>, ArchiveFolderCommandHandler>();
        services.AddScoped<IRequestHandler<ChangeColorFolderCommand, OperationResult<Unit>>, ChangeColorFolderCommandHandler>();
        services.AddScoped<IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>, SetDeleteFolderCommandHandler>();
        services.AddScoped<IRequestHandler<CopyFolderCommand, OperationResult<CopyFoldersResult>>, CopyFolderCommandHandler>();
        services.AddScoped<IRequestHandler<DeleteFoldersCommand, OperationResult<Unit>>, DeleteFoldersCommandHandler>();
        services.AddScoped<IRequestHandler<MakePrivateFolderCommand, OperationResult<Unit>>, MakePrivateFolderCommandHandler>();
        services.AddScoped<IRequestHandler<UpdatePositionsFoldersCommand, OperationResult<Unit>>, UpdatePositionsFoldersCommandHandler>();


        services.AddScoped<IRequestHandler<GetFoldersByFolderIdsQuery, OperationResult<List<SmallFolder>>>, GetFoldersByFolderIdsQueryHandler>();
        services.AddScoped<IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>, GetFoldersByTypeQueryHandler>();
        services.AddScoped<IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>, GetFullFolderQueryHandler>();
        services.AddScoped<IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>, GetAdditionalContentFolderInfoQueryHandler>();

        services.AddScoped<IRequestHandler<UpdateTitleFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
        services.AddScoped<IRequestHandler<AddNotesToFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
        services.AddScoped<IRequestHandler<RemoveNotesFromFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();
        services.AddScoped<IRequestHandler<UpdateNotesPositionsInFolderCommand, OperationResult<Unit>>, FullFolderHandlerCommand>();

        services.AddScoped<IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>, FullFolderHandlerQuery>();

        services.AddScoped<IRequestHandler<SyncFolderStateCommand, OperationResult<SyncFolderResult>>, SyncFolderStateCommandHandler>();
    }
}