using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.DatabaseContext.Repositories.NoteContent;
using Noots.Editor.Queries;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.Editor.Services;

public class GetNoteContentsQueryHandler : IRequestHandler<GetNoteContentsQuery, OperationResult<List<BaseNoteContentDTO>>>
{
    private readonly IMediator mediator;
    private readonly BaseNoteContentRepository baseNoteContentRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;
    private readonly FoldersNotesRepository foldersNotesRepository;

    public GetNoteContentsQueryHandler(
        IMediator _mediator,
        BaseNoteContentRepository baseNoteContentRepository,
        NoteFolderLabelMapper appCustomMapper,
        FoldersNotesRepository foldersNotesRepository)
    {
        mediator = _mediator;
        this.baseNoteContentRepository = baseNoteContentRepository;
        this.appCustomMapper = appCustomMapper;
        this.foldersNotesRepository = foldersNotesRepository;
    }

    public async Task<OperationResult<List<BaseNoteContentDTO>>> Handle(GetNoteContentsQuery request, CancellationToken cancellationToken)
    {
        var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
        var permissions = await mediator.Send(command);
        var isCanRead = permissions.CanRead;

        if (request.FolderId.HasValue && !isCanRead)
        {
            var isNoteInFolder = await foldersNotesRepository.GetAnyAsync(x => x.FolderId == request.FolderId.Value && x.NoteId == request.NoteId);
            if (isNoteInFolder)
            {
                var queryFolder = new GetUserPermissionsForFolderQuery(request.FolderId.Value, request.UserId);
                var permissionsFolder = await mediator.Send(queryFolder);
                isCanRead = permissionsFolder.CanRead;
            }
        }


        if (isCanRead)
        {
            var contents = await baseNoteContentRepository.GetAllContentByNoteIdOrderedAsync(request.NoteId);
            var result = appCustomMapper.MapContentsToContentsDTO(contents, permissions.AuthorId);
            return new OperationResult<List<BaseNoteContentDTO>>(true, result);
        }

        return new OperationResult<List<BaseNoteContentDTO>>().SetNoPermissions();
    }
}