using AutoMapper;
using BI.Mapping;
using Common;
using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Folders;
using Common.DTO.folders;
using Common.Naming;
using Domain.Commands.folders;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.services.folders
{
    public class FolderHandlerCommand : 
        IRequestHandler<NewFolderCommand, SmallFolder>,
        IRequestHandler<ArchiveFolderCommand, Unit>,
        IRequestHandler<ChangeColorFolderCommand, Unit>,
        IRequestHandler<RestoreFolderCommand, Unit>,
        IRequestHandler<SetDeleteFolderCommand, Unit>,
        IRequestHandler<CopyFolderCommand, List<SmallFolder>>,
        IRequestHandler<DeleteFoldersCommand, Unit>,
        IRequestHandler<MakePrivateFolderCommand, Unit>
    {
        private readonly FolderRepository folderRepository;
        private readonly FoldersNotesRepository foldersNotesRepository;
        private readonly UserRepository userRepository;
        private readonly AppRepository appRepository;
        private readonly AppCustomMapper appCustomMapper;
        private readonly IMediator _mediator;
        public FolderHandlerCommand(FolderRepository folderRepository, UserRepository userRepository,
            AppRepository appRepository, AppCustomMapper appCustomMapper, IMediator _mediator,
            FoldersNotesRepository foldersNotesRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.appRepository = appRepository;
            this.appCustomMapper = appCustomMapper;
            this._mediator = _mediator;
            this.foldersNotesRepository = foldersNotesRepository;
        }

        public async Task<SmallFolder> Handle(NewFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);

            var privateType = await appRepository.GetFolderTypeByName(ModelsNaming.PrivateFolder);
            var refType = await appRepository.GetRefTypeByName(ModelsNaming.Viewer);

            var folder = new Folder()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = FolderColorPallete.Green,
                FolderTypeId = privateType.Id,
                RefTypeId = refType.Id,
                CreatedAt = DateTimeOffset.Now,
                UpdatedAt = DateTimeOffset.Now
            };

            await folderRepository.Add(folder, privateType.Id);

            var newFolder = await folderRepository.GetOneById(folder.Id);

            return appCustomMapper.MapFolderToSmallFolder(newFolder);
        }

        public async Task<Unit> Handle(ArchiveFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.ArchivedFolder);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(ChangeColorFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (folders.Any())
            {
                folders.ForEach(x => {
                    x.Color = request.Color;
                    x.UpdatedAt = DateTimeOffset.Now;
                });

                await folderRepository.UpdateRange(folders);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(RestoreFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.PrivateFolder);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }
            return Unit.Value;
        }

        public async Task<Unit> Handle(SetDeleteFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.DeletedFolder);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<List<SmallFolder>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.PrivateFolder);
            var resultIds = new List<Guid>();
            var order = -1;

            foreach (var id in request.Ids)
            {
                var command = new GetUserPermissionsForFolder(id, request.Email);
                var permissions = await _mediator.Send(command);
         
                if (permissions.CanWrite)
                {
                    var folderForCopy = await folderRepository.GetFolderByIdForCopy(permissions.Folder.Id);
                    var newFolder = new Folder()
                    {
                        Title = folderForCopy.Title,
                        Color = folderForCopy.Color,
                        FolderTypeId = type.Id,
                        RefTypeId = folderForCopy.RefTypeId,
                        Order = order--,
                        CreatedAt = DateTimeOffset.Now,
                        UpdatedAt = DateTimeOffset.Now,
                        UserId = permissions.User.Id
                    };
                    var dbFolder = await folderRepository.Add(newFolder);
                    resultIds.Add(dbFolder.Entity.Id);
                    var foldersNotes = folderForCopy.FoldersNotes.Select(note => new FoldersNotes()
                    {
                        FolderId = dbFolder.Entity.Id,
                        NoteId = note.NoteId
                    });
                    await foldersNotesRepository.AddRange(foldersNotes);
                }
            }

            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            var dbFolders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(user.Id, type.Id);

            var orders = Enumerable.Range(1, dbFolders.Count);
            dbFolders = dbFolders.Zip(orders, (folder, order) => {
                folder.Order = order;
                return folder;
            }).ToList();

            await folderRepository.UpdateRange(dbFolders);

            var resultFolders = dbFolders.Where(dbFolder => resultIds.Contains(dbFolder.Id)).ToList();
            return appCustomMapper.MapFoldersToSmallFolders(resultFolders);
        }

        public async Task<Unit> Handle(DeleteFoldersCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.DeletedFolder);
            var deletedFolders = user.Folders.Where(x => x.FolderTypeId == type.Id).ToList();
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();

            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.DeleteRangeDeleted(folders, deletedFolders);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }

        public async Task<Unit> Handle(MakePrivateFolderCommand request, CancellationToken cancellationToken)
        {
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.PrivateFolder);
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, type.Id);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }
    }
}
