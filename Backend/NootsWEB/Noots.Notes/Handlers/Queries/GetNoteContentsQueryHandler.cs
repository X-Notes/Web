using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.Encryption.Impl;
using Noots.Mapper.Mapping;
using Noots.Notes.Queries;
using Noots.Permissions.Queries;

namespace Noots.Notes.Handlers.Queries;

public class GetNoteContentsQueryHandler : IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
{
    private readonly IMediator mediator;
    private readonly UserNoteEncryptService userNoteEncryptStorage;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public GetNoteContentsQueryHandler(
        IMediator _mediator, 
        UserNoteEncryptService userNoteEncryptStorage,
        BaseNoteContentRepository baseNoteContentRepository,
        NoteFolderLabelMapper appCustomMapper)
    {
        mediator = _mediator;
        this.userNoteEncryptStorage = userNoteEncryptStorage;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.appCustomMapper = appCustomMapper;
    }
    
    public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.Note.IsLocked)
        {
            var isUnlocked = userNoteEncryptStorage.IsUnlocked(permissions.Note.UnlockTime);
            if (!isUnlocked)
            {
                return new OperationResult<List<BaseNoteContentDTO>>(false, null).SetContentLocked();
            }
        }

        if (permissions.CanRead)
        {
            var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(request.NoteId);
            var result = appCustomMapper.MapContentsToContentsDTO(contents, permissions.Author.Id);
            return new OperationResult<List<BaseNoteContentDTO>>(true, result);
        }

        return new OperationResult<List<BaseNoteContentDTO>>().SetNoPermissions();
    }
}