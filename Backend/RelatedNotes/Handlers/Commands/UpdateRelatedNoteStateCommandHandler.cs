using Common.DatabaseModels.Models.Notes;
using Common.DTO;
using DatabaseContext.Repositories.Notes;
using MediatR;
using Permissions.Queries;
using RelatedNotes.Commands;

namespace RelatedNotes.Handlers.Commands;

public class UpdateRelatedNoteStateCommandHandler : IRequestHandler<UpdateRelatedNoteStateCommand, OperationResult<Unit>>
{
    private readonly IMediator _mediator;
    private readonly RelatedNoteToInnerNoteRepository relatedRepository;
    private readonly RelatedNoteUserStateRepository relatedNoteUserStateRepository;
    
    public UpdateRelatedNoteStateCommandHandler(
        IMediator mediator, 
        RelatedNoteToInnerNoteRepository relatedRepository,
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

        if (!permissions.CanRead)
        {
            return new OperationResult<Unit>(false, Unit.Value);
        }

        var relatedNoteUserState = await relatedNoteUserStateRepository
            .FirstOrDefaultAsync(x => x.RelatedNoteInnerNoteId == request.ReletatedNoteInnerNoteId && x.UserId == request.UserId);
                
        if(relatedNoteUserState != null)
        {
            relatedNoteUserState.IsOpened = request.IsOpened;
            await relatedNoteUserStateRepository.UpdateAsync(relatedNoteUserState);
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
                RelatedNoteInnerNoteId = request.ReletatedNoteInnerNoteId, 
                IsOpened = request.IsOpened 
            };

            await relatedNoteUserStateRepository.AddAsync(state);
        }

        return new OperationResult<Unit>(true, Unit.Value); 
    }
}