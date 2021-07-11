using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.NoteContent;
using Common.DTO.Notes;
using Domain.Queries.InnerFolder;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Notes;

namespace BI.Services.Folders
{
    public class FullFolderHandlerQuery :
        IRequestHandler<GetFolderNotesByFolderId, List<SmallNote>>,
        IRequestHandler<GetPreviewSelectedNotesForFolderQuery, List<PreviewNoteForSelection>>
    {

        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly NoteRepository noteRepository;
        private readonly IMediator _mediator;
        private readonly AppCustomMapper noteMapper;

        public FullFolderHandlerQuery(
            FoldersNotesRepository foldersNotesRepository,
            IMediator _mediator,
            AppCustomMapper noteMapper,
            NoteRepository noteRepository
            )
        {
            this.foldersNotesRepository = foldersNotesRepository;
            this._mediator = _mediator;
            this.noteMapper = noteMapper;
            this.noteRepository = noteRepository;
        }

        public async Task<List<SmallNote>> Handle(GetFolderNotesByFolderId request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetOrderedByFolderIdWithNotes(request.FolderId);
                var notes = foldersNotes.Select(x => x.Note);

                return noteMapper.MapNotesToSmallNotesDTO(notes);
            }

            return new List<SmallNote>();
        }

        public async Task<List<PreviewNoteForSelection>> Handle(GetPreviewSelectedNotesForFolderQuery request, CancellationToken cancellationToken)
        {

            var command = new GetUserPermissionsForFolder(request.FolderId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var foldersNotes = await foldersNotesRepository.GetWhere(x => x.FolderId == request.FolderId);
                var folderdNotesIds = foldersNotes.Select(x => x.NoteId);

                var allNotes = await noteRepository.GetNotesByUserId(permissions.User.Id, request.Settings);

                if (string.IsNullOrEmpty(request.Search))
                {
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, folderdNotesIds);
                }
                else
                {
                    allNotes = allNotes.Where(x => SearchHelper.IsMatchContent(x.Title, request.Search)
                    || x.Contents.OfType<TextNote>().Any(x => SearchHelper.IsMatchContent(x.Content, request.Search))
                    || folderdNotesIds.Contains(x.Id)
                    ).ToList();
                    return noteMapper.MapNotesToPreviewNotesDTO(allNotes, folderdNotesIds);
                }
            }

            return new List<PreviewNoteForSelection>();
        }
    }
}
