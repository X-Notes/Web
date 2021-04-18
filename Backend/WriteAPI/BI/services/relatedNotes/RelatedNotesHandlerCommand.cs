using Common.DatabaseModels.models;
using Domain.Commands.relatedNotes;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.relatedNotes
{
    public class RelatedNotesHandlerCommand
        : IRequestHandler<UpdateRelatedNotesToNoteCommand, Unit>
    {
        private readonly IMediator _mediator;
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
        public RelatedNotesHandlerCommand(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            IMediator _mediator)
        {
            this.relatedRepository = relatedRepository;
            this._mediator = _mediator;
        }

        public async Task<Unit> Handle(UpdateRelatedNotesToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            var currentRelateds = await relatedRepository.GetWhere(x => x.NoteId == request.NoteId);
            await relatedRepository.RemoveRange(currentRelateds);
            if (permissions.CanWrite)
            {
                var nodes = new List<ReletatedNoteToInnerNote>();
                ReletatedNoteToInnerNote node = null;
                foreach (var item in request.RelatedNoteIds)
                {
                    var id = Guid.NewGuid();
                    if(node == null)
                    {
                        node = new ReletatedNoteToInnerNote()
                        {
                            Id = id,
                            NoteId = request.NoteId,
                            RelatedNoteId = item,
                            IsOpened = true
                        };
                    }
                    else
                    {
                        node.NextId = id;
                        node = new ReletatedNoteToInnerNote()
                        {
                            Id = id,
                            PrevId = node?.Id,
                            NoteId = request.NoteId,
                            RelatedNoteId = item,
                            IsOpened = true
                        };
                    }
                    nodes.Add(node);
                }
                await relatedRepository.AddRange(nodes);
            }
            return Unit.Value;
        }
    }
}
