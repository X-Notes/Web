using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Permissions.Queries;
using Noots.RelatedNotes.Commands;

namespace Noots.RelatedNotes.Handlers.Commands;

public class UpdateRelatedNoteStateCommandHandler : IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>
{
    private readonly IMediator _mediator;
    private readonly ReletatedNoteToInnerNoteRepository relatedRepository;
    private readonly RelatedNoteUserStateRepository relatedNoteUserStateRepository;
    
    public UpdateRelatedNoteStateCommandHandler(
        IMediator mediator, 
        ReletatedNoteToInnerNoteRepository relatedRepository,
        RelatedNoteUserStateRepository relatedNoteUserStateRepository)
    {
        _mediator = mediator;
        this.relatedRepository = relatedRepository;
        this.relatedNoteUserStateRepository = relatedNoteUserStateRepository;
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
}