using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Notes.Copy;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Users;
using Editor.Queries;
using Editor.Services;
using Editor.Services.Users;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Notes.Commands;
using Notes.Commands.Copy;
using Notes.Commands.Sync;
using Notes.Entities;
using Notes.Handlers.Commands;
using Notes.Handlers.Commands.Copy;
using Notes.Handlers.Queries;
using Notes.Handlers.Sync;
using Notes.Impl;
using Notes.Queries;

namespace Notes;

public static class NotesModules
{
    public static void ApplyNotesDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<NewPrivateNoteCommand, OperationResult<SmallNote>>, NewPrivateNoteCommandHandler>();
        services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, OperationResult<List<VersionUpdateResult>>>, AddLabelOnNoteCommandHandler>();
        
        services.AddScoped<IRequestHandler<ChangeColorNoteCommand, OperationResult<List<VersionUpdateResult>>>, ChangeColorNoteCommandHandler>();
        services.AddScoped<IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>, SetDeleteNoteCommandHandler>();
        services.AddScoped<IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>, DeleteNotesCommandHandler>();
        services.AddScoped<IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>, ArchiveNoteCommandHandler>();
        services.AddScoped<IRequestHandler<MakePrivateNoteCommand, OperationResult<Unit>>, MakePrivateNoteCommandHandler>();

        services.AddScoped<IRequestHandler<CopyNotesCommand, OperationResult<Unit>>, CopyNotesCommandHandler>();
        services.AddScoped<IRequestHandler<CopyNoteInternalCommand, OperationResult<CopyNoteResult>>, CopyNotesCommandHandler>();

        services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<List<VersionUpdateResult>>>, RemoveLabelFromNoteCommandHandler>();
        services.AddScoped<IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>, UpdatePositionsNotesCommandHandler>();

        services.AddScoped<IRequestHandler<SyncNoteStateCommand, OperationResult<SyncNoteResult>>, SyncNoteStateCommandHandler>();

        services.AddScoped<NotesService>();
        
        services.AddScoped<IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>, GetAdditionalContentNoteInfoQueryHandler>();
        services.AddScoped<IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>, GetNotesByTypeQueryHandler>();
        services.AddScoped<IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>, GetNotesByNoteIdsQueryHandler>();
        services.AddScoped<IRequestHandler<GetAllNotesQuery, List<SmallNote>>, GetAllNotesQueryHandler>();
        services.AddScoped<IRequestHandler<GetNotesCountQuery, List<NotesCount>>, GetNotesCountQueryHandler>();

        services.AddScoped<IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>, GetFullNoteQueryHandler>();
        services.AddScoped<IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>, GetOnlineUsersOnNoteQueryHandler>();
        services.AddScoped<IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, GetNoteContentsQueryHandler>();
    }
}