using AutoMapper;
using Common;
using Common.DatabaseModels.models;
using Common.DTO.folders;
using Common.Naming;
using Domain.Commands.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

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
        private readonly IMapper mapper;
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        private readonly AppRepository appRepository;
        public FolderHandlerCommand(IMapper mapper, FolderRepository folderRepository, UserRepository userRepository,
            AppRepository appRepository)
        {
            this.mapper = mapper;
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this.appRepository = appRepository;
        }

        public async Task<SmallFolder> Handle(NewFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

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
                CreatedAt = DateTimeOffset.Now
            };

            await folderRepository.Add(folder, privateType.Id);

            var newFolder = await folderRepository.GetOneById(folder.Id);

            return mapper.Map<SmallFolder>(newFolder);
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
                folders.ForEach(x => x.Color = request.Color);
                await folderRepository.UpdateRangeFolders(folders);
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
            var user = await userRepository.GetUserWithFolders(request.Email);
            var type = await appRepository.GetFolderTypeByName(ModelsNaming.PrivateFolder);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                var dbnotes = await folderRepository.CopyFolders(folders, user.Folders, folder.FolderTypeId, type.Id);
                return mapper.Map<List<SmallFolder>>(dbnotes);
            }
            else
            {
                throw new Exception();
            }
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
