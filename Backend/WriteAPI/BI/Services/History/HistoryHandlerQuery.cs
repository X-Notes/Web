using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BI.Mapping;
using Common.DTO.History;
using Common.DTO.Notes.FullNoteContent;
using Domain.Queries.History;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Histories;
using WriteContext.Repositories.NoteContent;

namespace BI.Services.History
{
    public class HistoryHandlerQuery:
        IRequestHandler<GetNoteHistoriesQuery, List<NoteHistoryDTO>>,
        IRequestHandler<GetNoteSnapshotQuery, NoteHistoryDTOAnswer>,
        IRequestHandler<GetSnapshotContentsQuery, List<BaseContentNoteDTO>>
    {

        private readonly IMediator _mediator;

        private readonly NoteSnapshotRepository noteHistoryRepository;

        private readonly AppCustomMapper noteCustomMapper;

        private readonly BaseNoteContentRepository baseNoteContentRepository;

        public HistoryHandlerQuery(
            IMediator _mediator, 
            NoteSnapshotRepository noteHistoryRepository,
            AppCustomMapper noteCustomMapper,
            BaseNoteContentRepository baseNoteContentRepository)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
            this.baseNoteContentRepository = baseNoteContentRepository;
        }

        public async Task<List<NoteHistoryDTO>> Handle(GetNoteHistoriesQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var histories = await noteHistoryRepository.GetNoteHistories(request.NoteId);
                return noteCustomMapper.MapHistoriesToHistoriesDto(histories);
            }

            return new List<NoteHistoryDTO>();
        }

        public async Task<NoteHistoryDTOAnswer> Handle(GetNoteSnapshotQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var snapshot = await noteHistoryRepository.GetSnapshot(request.SnapshotId);
                return new NoteHistoryDTOAnswer(true, noteCustomMapper.MapNoteSnapshotToNoteSnapshotDTO(snapshot));
            }

            return new NoteHistoryDTOAnswer(false, null);
        }

        public async Task<List<BaseContentNoteDTO>> Handle(GetSnapshotContentsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var contents = await baseNoteContentRepository.GetAllContentBySnapshotIdOrderedAsync(request.SnapshotId);
                return noteCustomMapper.MapContentsToContentsDTO(contents);
            }

            // TODO WHEN NO ACCESS
            return null;
        }
    }
}
