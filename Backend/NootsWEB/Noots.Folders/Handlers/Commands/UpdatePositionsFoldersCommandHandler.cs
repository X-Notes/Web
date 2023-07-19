using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;

namespace Noots.Folders.Handlers.Commands;

public class UpdatePositionsFoldersCommandHandler : IRequestHandler<UpdatePositionsFoldersCommand, OperationResult<Unit>>
{
    private readonly FolderRepository folderRepository;

    public UpdatePositionsFoldersCommandHandler(FolderRepository folderRepository)
    {
        this.folderRepository = folderRepository;
    }
    
    public async Task<OperationResult<Unit>> Handle(UpdatePositionsFoldersCommand request, CancellationToken cancellationToken)
    {
        var folderIds = request.Positions.Select(x => x.EntityId).ToList();
        var folders = await folderRepository.GetWhereAsync(x => x.UserId == request.UserId && folderIds.Contains(x.Id));

        if (folders.Any())
        {
            request.Positions.ForEach(x =>
            {
                var folder = folders.FirstOrDefault(q => q.Id == x.EntityId); 
                if (folder != null)
                {
                    folder.Order = x.Position;
                }
            });

            await folderRepository.UpdateRangeAsync(folders);

            return new OperationResult<Unit>(true, Unit.Value);
        }

        return new OperationResult<Unit>().SetNotFound();
    }
}