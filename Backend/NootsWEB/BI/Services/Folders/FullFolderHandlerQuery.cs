using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DTO.Notes;
using Domain.Queries.InnerFolder;
using MediatR;
using Noots.MapperLocked;
using Noots.Permissions.Queries;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;

namespace BI.Services.Folders
{
    public class FullFolderHandlerQuery :
        IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>,
        IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>
    {

        private readonly FoldersNotesRepository foldersNotesRepository;

        private readonly NoteRepository noteRepository;

        private readonly IMediator _mediator;

        private readonly MapperLockedEntities mapperLockedEntities;

        public FullFolderHandlerQuery(
            FoldersNotesRepository foldersNotesRepository,
            IMediator _mediator,
            NoteRepository noteRepository,
            MapperLockedEntities mapperLockedEntities
            )
        {
            this.foldersNotesRepository = foldersNotesRepository;
            this._mediator = _mediator;
            this.noteRepository = noteRepository;
            this.mapperLockedEntities = mapperLockedEntities;
        }

        public async Task<List<SmallNote>> Handle(GetFolderNotesByFolderIdQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                List<FoldersNotes> foldersNotes = new();

                if(request.NoteIds != null && request.NoteIds.Any())
                {
                    foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId && request.NoteIds.Contains(x.NoteId));
                }
                else
                {
                    foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                }

                var notesIds = foldersNotes.Select(x => x.NoteId);
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, request.Settings);
                return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
            }

            return new List<SmallNote>();
        }

        public async Task<List<SmallNote>> Handle(GetPreviewSelectedNotesForFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var folderNoteIds = await foldersNotesRepository.GetNoteIdsByFolderId(request.FolderId);
   
                if (string.IsNullOrEmpty(request.Search))
                {
                    var notes = await noteRepository.GetNotesByUserIdNoLocked(permissions.Caller.Id, folderNoteIds, request.Settings);
                    return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
                }
                else
                {
                    var notes = await noteRepository.GetNotesByUserIdWithContentNoLocked(permissions.Caller.Id, folderNoteIds);

                    var noteIds = notes.Where(x => 
                                    SearchHelper.IsMatchContent(x.Title, request.Search) || 
                                    x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Contents, request.Search))
                                    ).Select(x => x.Id);

                    if (noteIds.Any())
                    {
                        notes = await noteRepository.GetNotesByNoteIdsIdWithContent(noteIds, request.Settings);
                        return mapperLockedEntities.MapNotesToSmallNotesDTO(notes, request.UserId);
                    }
                }
            }

            return new List<SmallNote>();
        }
    }
}
