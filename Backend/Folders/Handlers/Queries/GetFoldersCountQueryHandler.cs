using Common.DTO.Folders;
using DatabaseContext.Repositories.Folders;
using Folders.Queries;
using MediatR;

namespace Folders.Handlers.Queries;

public class GetFoldersCountQueryHandler : IRequestHandler<GetFoldersCountQuery, List<FoldersCount>>
{
    private readonly FolderRepository folderRepository;

    public GetFoldersCountQueryHandler(FolderRepository folderRepository)
    {
        this.folderRepository = folderRepository;
    }
    
    public Task<List<FoldersCount>> Handle(GetFoldersCountQuery request, CancellationToken cancellationToken)
    {
        return folderRepository.GetFoldersCountAsync(request.UserId);
    }
}