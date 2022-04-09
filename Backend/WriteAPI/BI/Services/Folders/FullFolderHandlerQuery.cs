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
        IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<SmallNote>>
    {

        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;
        private readonly NoteFolderLabelMapper noteMapper;

        public FullFolderHandlerQuery(
            FoldersNotesRepository foldersNotesRepository,
            IMediator _mediator,
            NoteFolderLabelMapper noteMapper,
            NoteRepository noteRepository
            )
        {
            this.foldersNotesRepository = foldersNotesRepository;
            this._mediator = _mediator;
            this.noteMapper = noteMapper;
            this.noteRepository = noteRepository;
        }

        public async Task<List<SmallNote>> Handle(GetFolderNotesByFolderIdQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.FolderId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                var notesIds = foldersNotes.Select(x => x.NoteId);
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, request.Settings);
                return noteMapper.MapNotesToSmallNotesDTO(notes);
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
                    return noteMapper.MapNotesToSmallNotesDTO(notes);
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
                        return noteMapper.MapNotesToSmallNotesDTO(notes);
                    }
                }
            }

            return new List<SmallNote>();
        }
    }
}
