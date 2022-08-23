using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using MediatR;
using Noots.DatabaseContext.Repositories.Folders;
using Noots.Folders.Commands;
using Noots.Mapper.Mapping;
using Noots.Permissions.Queries;

namespace Noots.Folders.Handlers.Commands;

public class CopyFolderCommandHandler : IRequestHandler<CopyFolderCommand, List<SmallFolder>>
{
    private readonly IMediator mediator;
    private readonly FolderRepository folderRepository;
    private readonly FoldersNotesRepository foldersNotesRepository;
    private readonly NoteFolderLabelMapper appCustomMapper;

    public CopyFolderCommandHandler(
        IMediator mediator, 
        FolderRepository folderRepository,
        FoldersNotesRepository foldersNotesRepository,
        NoteFolderLabelMapper appCustomMapper)
    {
        this.mediator = mediator;
        this.folderRepository = folderRepository;
        this.foldersNotesRepository = foldersNotesRepository;
        this.appCustomMapper = appCustomMapper;
    }
    
    public async Task<List<SmallFolder>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
    {
        var resultIds = new List<Guid>();
        var order = -1;

        var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
        var permissions = await mediator.Send(command);

        if (permissions.Any())
        {
            var idsForCopy = permissions.Where(x => x.Item2.CanRead).Select(x => x.Item1).ToList();
            var permission = permissions.First().Item2;
            if (idsForCopy.Any())
            {
                var foldersForCopy = await folderRepository.GetFoldersByIdsForCopy(idsForCopy);
                foreach(var folderForCopy in foldersForCopy)
                {
                    var newFolder = new Folder()
                    {
                        Title = folderForCopy.Title,
                        Color = folderForCopy.Color,
                        FolderTypeId = FolderTypeENUM.Private,
                        RefTypeId = folderForCopy.RefTypeId,
                        Order = order--,
                        CreatedAt = DateTimeProvider.Time,
                        UpdatedAt = DateTimeProvider.Time,
                        UserId = permission.Caller.Id
                    };
                    var dbFolder = await folderRepository.AddAsync(newFolder);
                    resultIds.Add(dbFolder.Entity.Id);
                    var foldersNotes = folderForCopy.FoldersNotes.Select(note => new FoldersNotes()
                    {
                        FolderId = dbFolder.Entity.Id,
                        NoteId = note.NoteId
                    });
                    await foldersNotesRepository.AddRangeAsync(foldersNotes);
                }

                var dbFolders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesIncludeNote(permission.Caller.Id, FolderTypeENUM.Private);
                var orders = Enumerable.Range(1, dbFolders.Count);
                dbFolders = dbFolders.Zip(orders, (folder, order) => {
                    folder.Order = order;
                    return folder;
                }).ToList();

                await folderRepository.UpdateRangeAsync(dbFolders);
                var resultFolders = dbFolders.Where(dbFolder => resultIds.Contains(dbFolder.Id)).ToList();
                return appCustomMapper.MapFoldersToSmallFolders(resultFolders, request.UserId);
            }
        }

        return new List<SmallFolder>();
    }
}