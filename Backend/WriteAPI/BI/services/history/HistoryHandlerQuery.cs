using BI.Mapping;
using Common.DTO.history;
using Domain.Queries;
using Domain.Queries.files;
using Domain.Queries.history;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Histories;

namespace BI.services.history
{
    public class HistoryHandlerQuery:
        IRequestHandler<GetNoteHistories, List<NoteHistoryDTO>>
    {

        private readonly IMediator _mediator;
        private readonly NoteHistoryRepository noteHistoryRepository;
        private readonly AppCustomMapper noteCustomMapper;
        public HistoryHandlerQuery(
            IMediator _mediator, 
            NoteHistoryRepository noteHistoryRepository,
            AppCustomMapper noteCustomMapper)
        {
            this._mediator = _mediator;
            this.noteHistoryRepository = noteHistoryRepository;
            this.noteCustomMapper = noteCustomMapper;
        }

        public async Task<List<NoteHistoryDTO>> Handle(GetNoteHistories request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                var histories = await noteHistoryRepository.GetNoteHistories(request.NoteId);
                return noteCustomMapper.MapHistoriesToHistoriesDto(histories);
            }

            return new List<NoteHistoryDTO>();
        }
    }
}
