﻿using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Folders.AdditionalContent;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Folders.Commands;
using Noots.Folders.Handlers.Commands;
using Noots.Folders.Handlers.Queries;
using Noots.Folders.Queries;

namespace Noots.Folders;

public static class FoldersModules
{
    public static void ApplyFoldersDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<NewFolderCommand, OperationResult<SmallFolder>>, NewFolderCommandHandler>();
        services.AddScoped<IRequestHandler<ArchiveFolderCommand, OperationResult<Unit>>, ArchiveFolderCommandHandler>();
        services.AddScoped<IRequestHandler<ChangeColorFolderCommand, OperationResult<Unit>>, ChangeColorFolderCommandHandler>();
        services.AddScoped<IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>, SetDeleteFolderCommandHandler>();
        services.AddScoped<IRequestHandler<CopyFolderCommand, OperationResult<List<SmallFolder>>>, CopyFolderCommandHandler>();
        services.AddScoped<IRequestHandler<DeleteFoldersCommand, OperationResult<Unit>>, DeleteFoldersCommandHandler>();
        services.AddScoped<IRequestHandler<MakePrivateFolderCommand, OperationResult<Unit>>, MakePrivateFolderCommandHandler>();
        services.AddScoped<IRequestHandler<UpdatePositionsFoldersCommand, OperationResult<Unit>>, UpdatePositionsFoldersCommandHandler>();


        services.AddScoped<IRequestHandler<GetFoldersByFolderIdsQuery, OperationResult<List<SmallFolder>>>, GetFoldersByFolderIdsQueryHandler>();
        services.AddScoped<IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>, GetFoldersByTypeQueryHandler>();
        services.AddScoped<IRequestHandler<GetFullFolderQuery, OperationResult<FullFolder>>, GetFullFolderQueryHandler>();
        services.AddScoped<IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>, GetAdditionalContentFolderInfoQueryHandler>();
    }
}