using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Notes;
using Common.DTO.notes.FullNoteContent;
using Domain.Commands.relatedNotes;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories.Notes;

namespace BI.services.relatedNotes
{
    public class RelatedNotesHandlerCommand
        : IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<Unit>>,
          IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>,
          IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>
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

        public async Task<OperationResult<Unit>> Handle(UpdateRelatedNotesToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var currentRelateds = await relatedRepository.GetWhere(x => x.NoteId == request.NoteId);
                await relatedRepository.RemoveRange(currentRelateds);

                var orders = Enumerable.Range(1, request.RelatedNoteIds.Count);
                var nodes = request.RelatedNoteIds.Zip(orders, (id, order) => {
                    return new ReletatedNoteToInnerNote()
                    {
                        NoteId = request.NoteId,
                        RelatedNoteId = id,
                        IsOpened = true,
                        Order = order
                    };
                }).ToList();

                await relatedRepository.AddRange(nodes);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(UpdateRelatedNoteStateCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var relatedNote = await relatedRepository.FirstOrDefaultAsync(x => x.NoteId == note.Id && x.RelatedNoteId == request.RelatedNoteId);
                relatedNote.IsOpened = request.IsOpened;
                await relatedRepository.Update(relatedNote);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeOrderRelatedNotesCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var currentRelateds = await relatedRepository.GetRelatedNotesOnlyRelated(request.NoteId);

                var find = currentRelateds.First(x => x.RelatedNoteId == request.Id);
                currentRelateds.Remove(find);

                if(request.InsertAfter.HasValue)
                {
                    var insertAfter = currentRelateds.First(x => x.RelatedNoteId == request.InsertAfter);
                    var indexOfAfter = currentRelateds.IndexOf(insertAfter);
                    currentRelateds.Insert(indexOfAfter + 1, find);
                }
                else
                {
                    currentRelateds.Insert(0, find);
                }


                var orders = Enumerable.Range(1, currentRelateds.Count);
                var nodes = currentRelateds.Zip(orders, (node, order) => {
                    node.Order = order;
                    return node;
                }).ToList();

                await relatedRepository.UpdateRange(nodes);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);

        }
    }
}
