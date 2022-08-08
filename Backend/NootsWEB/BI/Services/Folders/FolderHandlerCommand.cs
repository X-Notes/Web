using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using BI.SignalR;
using Common;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.WebSockets;
using Domain.Commands.Folders;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.Services.Folders
{
    public class FolderHandlerCommand : 
        IRequestHandler<NewFolderCommand, SmallFolder>,
        IRequestHandler<ArchiveFolderCommand, OperationResult<Unit>>,
        IRequestHandler<ChangeColorFolderCommand, OperationResult<Unit>>,
        IRequestHandler<SetDeleteFolderCommand, OperationResult<List<Guid>>>,
        IRequestHandler<CopyFolderCommand, List<SmallFolder>>,
        IRequestHandler<DeleteFoldersCommand, OperationResult<Unit>>,
        IRequestHandler<MakePrivateFolderCommand, OperationResult<Unit>>,
        IRequestHandler<UpdatePositionsFoldersCommand, OperationResult<Unit>>
    {
        private readonly FolderRepository folderRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly FolderWSUpdateService folderWSUpdateService;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly NoteFolderLabelMapper appCustomMapper;
        private readonly IMediator _mediator;

        public FolderHandlerCommand(
            FolderRepository folderRepository,
            NoteFolderLabelMapper appCustomMapper, 
            IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository,
            FolderWSUpdateService folderWSUpdateService,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
        {
            this.folderRepository = folderRepository;
            this.appCustomMapper = appCustomMapper;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
            this.folderWSUpdateService = folderWSUpdateService;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        }

        public async Task<SmallFolder> Handle(NewFolderCommand request, CancellationToken cancellationToken)
        {
            var folder = new Folder()
            {
                UserId = request.UserId,
                Order = 1,
                Color = FolderColorPallete.Green,
                FolderTypeId = FolderTypeENUM.Private,
                RefTypeId = RefTypeENUM.Viewer,
                CreatedAt = DateTimeProvider.Time,
                UpdatedAt = DateTimeProvider.Time
            };

            await folderRepository.AddAsync(folder);
            return appCustomMapper.MapFolderToSmallFolder(folder, true);
        }

        public async Task<OperationResult<Unit>> Handle(ArchiveFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var folders = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
            if (folders.Any())
            {
                folders.ForEach(x => x.ToType(FolderTypeENUM.Archived));
                await folderRepository.UpdateRangeAsync(folders);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        public async Task<OperationResult<Unit>> Handle(ChangeColorFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);
            var isCanEdit = permissions.All(x => x.perm.CanWrite);
            if (isCanEdit)
            {
                var foldersForUpdate = permissions.Select(x => x.perm.Folder);
                foreach (var folder in foldersForUpdate)
                {
                    folder.Color = request.Color;
                    folder.UpdatedAt = DateTimeProvider.Time;
                }

                await folderRepository.UpdateRangeAsync(foldersForUpdate);

                // WS UPDATES
                var updates = permissions.Select(x => (new UpdateFolderWS { Color = request.Color, FolderId = x.folderId }, x.perm.GetAllUsers()));
                await folderWSUpdateService.UpdateFolders(updates, request.UserId);

                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>().SetNoPermissions();
        }


        public async Task<OperationResult<List<Guid>>> Handle(SetDeleteFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var processedIds = new List<Guid>();

            var foldersOwner = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
            if (foldersOwner.Any())
            {
                foldersOwner.ForEach(x => x.ToType(FolderTypeENUM.Deleted, DateTimeProvider.Time));
                await folderRepository.UpdateRangeAsync(foldersOwner);
                processedIds = foldersOwner.Select(x => x.Id).ToList();
            }

            var usersOnPrivate = await usersOnPrivateFoldersRepository.GetWhereAsync(x => request.UserId == x.UserId && request.Ids.Contains(x.FolderId));
            if (usersOnPrivate.Any())
            {
                await usersOnPrivateFoldersRepository.RemoveRangeAsync(usersOnPrivate);
            }

            return new OperationResult<List<Guid>>(true, processedIds);
        }

        public async Task<List<SmallFolder>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
        {
            var resultIds = new List<Guid>();
            var order = -1;

            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

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

        public async Task<OperationResult<Unit>> Handle(DeleteFoldersCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var folders = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
            if (folders.Any())
            {
                await folderRepository.RemoveRangeAsync(folders);
                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }


        public async Task<OperationResult<Unit>> Handle(MakePrivateFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.Ids, request.UserId);
            var permissions = await _mediator.Send(command);

            var folders = permissions.Where(x => x.perm.IsOwner).Select(x => x.perm.Folder).ToList();
            if (folders.Any())
            {
                folders.ForEach(x => x.ToType(FolderTypeENUM.Private));
                await folderRepository.UpdateRangeAsync(folders);

                return new OperationResult<Unit>(true, Unit.Value);
            }

            return new OperationResult<Unit>().SetNotFound();
        }

        public async Task<OperationResult<Unit>> Handle(UpdatePositionsFoldersCommand request, CancellationToken cancellationToken)
        {
            var folderIds = request.Positions.Select(x => x.EntityId).ToList();
            var folders = await folderRepository.GetWhereAsync(x => x.UserId == request.UserId && folderIds.Contains(x.Id));

            if (folders.Any())
            {
                request.Positions.ForEach(x =>
                {
                    var folder = folders.FirstOrDefault(z => z.Id == x.EntityId); 
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
}
