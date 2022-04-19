using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.SignalR;
using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using Common.DTO.WebSockets.ReletedNotes;
using Domain.Commands.RelatedNotes;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Notes;

namespace BI.Services.RelatedNotes
{
    public class RelatedNotesHandlerCommand
        : IRequestHandler<UpdateRelatedNotesToNoteCommand, OperationResult<UpdateRelatedNotesWS>>,
          IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>,
          IRequestHandler<ChangeOrderRelatedNotesCommand, OperationResult<Unit>>
    {
        private readonly IMediator _mediator;
        private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
        private readonly AppSignalRService appSignalRService;
        private readonly RelatedNoteUserStateRepository relatedNoteUserStateRepository;

        public RelatedNotesHandlerCommand(
            ReletatedNoteToInnerNoteRepository relatedRepository,
            IMediator _mediator,
            AppSignalRService appSignalRService,
            RelatedNoteUserStateRepository relatedNoteUserStateRepository)
        {
            this.relatedRepository = relatedRepository;
            this._mediator = _mediator;
            this.appSignalRService = appSignalRService;
            this.relatedNoteUserStateRepository = relatedNoteUserStateRepository;
        }

        public async Task<OperationResult<UpdateRelatedNotesWS>> Handle(UpdateRelatedNotesToNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var dbValues = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId);
                var dbRelatedIds = dbValues.Select(x => x.RelatedNoteId).ToHashSet();

                var valuesToRemove = dbValues.Where(x => !request.RelatedNoteIds.Contains(x.RelatedNoteId));
                var relatedToRemoveIds = valuesToRemove.Select(x => x.RelatedNoteId).ToList();
                if (valuesToRemove.Any())
                {
                    await relatedRepository.RemoveRangeAsync(valuesToRemove);
                }

                var idsToAdd = request.RelatedNoteIds.Where(id => !dbRelatedIds.Contains(id)).ToList();
                var valuesToAdd = idsToAdd.Select(relatedId => new ReletatedNoteToInnerNote()
                {
                    NoteId = request.NoteId,
                    RelatedNoteId = relatedId,
                });

                if (valuesToAdd.Any())
                {
                    await relatedRepository.AddRangeAsync(valuesToAdd);
                }

                var updates = new UpdateRelatedNotesWS(request.NoteId) { IdsToRemove = relatedToRemoveIds, IdsToAdd = idsToAdd };
                await appSignalRService.UpdateRelatedNotes(request.NoteId, request.UserId, updates);

                return new OperationResult<UpdateRelatedNotesWS>(true, updates);
            }

            return new OperationResult<UpdateRelatedNotesWS>(false, null);
        }

        public async Task<OperationResult<Unit>> Handle(UpdateRelatedNoteStateCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanRead)
            {
                var relatedNote = await relatedNoteUserStateRepository.FirstOrDefaultAsync(x => x.ReletatedNoteInnerNoteId == request.ReletatedNoteInnerNoteId 
                                            && x.UserId == request.UserId);
                
                if(relatedNote != null)
                {
                    relatedNote.IsOpened = request.IsOpened;
                    await relatedNoteUserStateRepository.UpdateAsync(relatedNote);
                }
                else
                {
                    var related = await relatedRepository.FirstOrDefaultAsync(x => x.Id == request.ReletatedNoteInnerNoteId);
                    if(related == null)
                    {
                        return new OperationResult<Unit>().SetNotFound();
                    }

                    var state = new RelatedNoteUserState 
                    { 
                        UserId = request.UserId, 
                        ReletatedNoteInnerNoteId = request.ReletatedNoteInnerNoteId, 
                        IsOpened = request.IsOpened 
                    };
                    await relatedNoteUserStateRepository.AddAsync(state);
                }

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>(false, Unit.Value);
        }

        public async Task<OperationResult<Unit>> Handle(ChangeOrderRelatedNotesCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);
            var note = permissions.Note;

            if (permissions.CanWrite)
            {
                var idsToChange = request.Positions.Select(x => x.EntityId).ToHashSet();
                var currentRelateds = await relatedRepository.GetWhereAsync(x => x.NoteId == request.NoteId && idsToChange.Contains(x.RelatedNoteId));

                if (currentRelateds.Any())
                {
                    request.Positions.ForEach(x =>
                    {
                        var note = currentRelateds.FirstOrDefault(z => z.RelatedNoteId == x.EntityId);
                        if (note != null)
                        {
                            note.Order = x.Position;
                        }
                    });

                    await relatedRepository.UpdateRangeAsync(currentRelateds);

                    var updates = new UpdateRelatedNotesWS(request.NoteId) { Positions = request.Positions };
                    await appSignalRService.UpdateRelatedNotes(request.NoteId, request.UserId, updates);

                    return new OperationResult<Unit>(true, Unit.Value);
                }

                return new OperationResult<Unit>().SetNotFound();
            }

            return new OperationResult<Unit>(false, Unit.Value);

        }
    }
}
