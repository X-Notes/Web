using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using Domain.Queries.InnerFolder;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;

namespace BI.Services.Folders
{
    public class FullFolderHandlerQuery :
        IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>,
        IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<PreviewNoteForSelection>>
    {

        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;
        private readonly NoteFolderLabelMapper noteMapper;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

        public FullFolderHandlerQuery(
            FoldersNotesRepository foldersNotesRepository,
            IMediator _mediator,
            NoteFolderLabelMapper noteMapper,
            NoteRepository noteRepository,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository
            )
        {
            this.foldersNotesRepository = foldersNotesRepository;
            this._mediator = _mediator;
            this.noteMapper = noteMapper;
            this.noteRepository = noteRepository;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        }

        public async Task<List<SmallNote>> Handle(GetFolderNotesByFolderIdQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                var notesIds = foldersNotes.Select(x => x.NoteId);
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(notesIds, request.Settings);
                return noteMapper.MapNotesToSmallNotesDTO(notes);
            }

            return new List<SmallNote>();
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetPreviewSelectedNotesForFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                var folderdNotesIds = foldersNotes.Select(x => x.NoteId);

                var allNotes = await noteRepository.GetNotesByUserId(permissions.Caller.Id, request.Settings);
                var sharedNotes = await GetSharedNotes(permissions.Caller.Id, request.Settings);
                allNotes.AddRange(sharedNotes);
                allNotes = allNotes.DistinctBy(x => x.Id).ToList();

                if (string.IsNullOrEmpty(request.Search))
                {
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, folderdNotesIds);
                }
                else
                {
                    allNotes = allNotes.Where(x => SearchHelper.IsMatchContent(x.Title, request.Search)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.Search))
                    || folderdNotesIds.Contains(x.Id)
                    ).ToList();
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, folderdNotesIds);
                }
            }

            return new List<PreviewNoteForSelection>();
        }

        private async Task<List<Note>> GetSharedNotes(Guid userId, PersonalizationSettingDTO settings)
        {
            var usersOnPrivateNotes = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.UserId == userId);
            var notesIds = usersOnPrivateNotes.Select(x => x.NoteId);
            var sharedNotes = await noteRepository.GetNotesByNoteIdsIdWithContentWithPersonalization(notesIds, settings);
            sharedNotes.ForEach(x => x.NoteTypeId = NoteTypeENUM.Shared);
            return sharedNotes;
        }
    }
}
