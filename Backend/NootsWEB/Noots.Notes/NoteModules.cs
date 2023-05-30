using Common.DTO;
using Common.DTO.Notes;
using Common.DTO.Notes.AdditionalContent;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Users;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Noots.Notes.Commands;
using Noots.Notes.Handlers.Commands;
using Noots.Notes.Handlers.Queries;
using Noots.Notes.Impl;
using Noots.Notes.Queries;

namespace Noots.Notes;

public static class NotesModules
{
    public static void ApplyNotesDI(this IServiceCollection services)
    {
        services.AddScoped<IRequestHandler<NewPrivateNoteCommand, OperationResult<SmallNote>>, NewPrivateNoteCommandHandler>();
        services.AddScoped<IRequestHandler<AddLabelOnNoteCommand, OperationResult<Unit>>, AddLabelOnNoteCommandHandler>();
        
        services.AddScoped<IRequestHandler<ChangeColorNoteCommand, OperationResult<Unit>>, ChangeColorNoteCommandHandler>();
        services.AddScoped<IRequestHandler<SetDeleteNoteCommand, OperationResult<List<Guid>>>, SetDeleteNoteCommandHandler>();
        services.AddScoped<IRequestHandler<DeleteNotesCommand, OperationResult<Unit>>, DeleteNotesCommandHandler>();
        services.AddScoped<IRequestHandler<ArchiveNoteCommand, OperationResult<Unit>>, ArchiveNoteCommandHandler>();
        services.AddScoped<IRequestHandler<MakePrivateNoteCommand, OperationResult<Unit>>, MakePrivateNoteCommandHandler>();
        services.AddScoped<IRequestHandler<CopyNoteCommand, OperationResult<List<Guid>>>, CopyNoteCommandHandler>();
        services.AddScoped<IRequestHandler<RemoveLabelFromNoteCommand, OperationResult<Unit>>, RemoveLabelFromNoteCommandHandler>();
        services.AddScoped<IRequestHandler<UpdatePositionsNotesCommand, OperationResult<Unit>>, UpdatePositionsNotesCommandHandler>();

        services.AddScoped<NotesService>();
        
        services.AddScoped<IRequestHandler<GetAdditionalContentNoteInfoQuery, List<BottomNoteContent>>, GetAdditionalContentNoteInfoQueryHandler>();
        services.AddScoped<IRequestHandler<GetNotesByTypeQuery, List<SmallNote>>, GetNotesByTypeQueryHandler>();
        services.AddScoped<IRequestHandler<GetNotesByNoteIdsQuery, OperationResult<List<SmallNote>>>, GetNotesByNoteIdsQueryHandler>();
        services.AddScoped<IRequestHandler<GetAllNotesQuery, List<SmallNote>>, GetAllNotesQueryHandler>();

        services.AddScoped<IRequestHandler<GetFullNoteQuery, OperationResult<FullNote>>, GetFullNoteQueryHandler>();
        services.AddScoped<IRequestHandler<GetOnlineUsersOnNoteQuery, List<OnlineUserOnNote>>, GetOnlineUsersOnNoteQueryHandler>();
        services.AddScoped<IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>, GetNoteContentsQueryHandler>();
    }
}