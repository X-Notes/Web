using Common.DatabaseModels.Models.Folders;
using Common.DTO.Notes;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Folders.Queries;
using Noots.MapperLocked;
using Permissions.Queries;

namespace Noots.Folders.Impl
{
    public class FullFolderHandlerQuery : IRequestHandler<GetFolderNotesByFolderIdQuery, List<SmallNote>>
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

                if (request.NoteIds != null && request.NoteIds.Any())
                {
                    foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId && request.NoteIds.Contains(x.NoteId));
                }
                else
                {
                    foldersNotes = await foldersNotesRepository.GetWhereAsync(x => x.FolderId == request.FolderId);
                }

                var notesIds = foldersNotes.Select(x => x.NoteId);
                var notes = await noteRepository.GetNotesByNoteIdsIdWithContent(notesIds, request.Settings);
                var orders = foldersNotes.ToDictionary(x => x.NoteId, x => x.Order);
                return mapperLockedEntities.MapFolderNotesToSmallNotesDTO(notes, request.UserId, orders);
            }

            return new List<SmallNote>();
        }
    }
}
