using AutoMapper;
using Common;
using Common.DatabaseModels.models;
using Common.DTO.folders;
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
        public FolderHandlerCommand(IMapper mapper, FolderRepository folderRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
        }

        public async Task<SmallFolder> Handle(NewFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            var folder = new Folder()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = FolderColorPallete.Green,
                FolderTypeId = request.TypeId,
                CreatedAt = DateTimeOffset.Now
            };

            await folderRepository.Add(folder, request.TypeId);

            var newFolder = await folderRepository.GetOneById(folder.Id);

            return mapper.Map<SmallFolder>(newFolder);
        }

        public async Task<Unit> Handle(ArchiveFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, request.ToId);
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
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, request.ToId);
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
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, request.FromId, request.ToId);
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
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                var dbnotes = await folderRepository.CopyFolders(folders, user.Folders, folder.FolderTypeId, request.ToId);
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
            var deletedFolders = user.Folders.Where(x => x.FolderTypeId == request.DeleteTypeId).ToList();
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
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folders = user.Folders.Where(x => request.Ids.Any(z => z == x.Id)).ToList();
            var folder = folders.FirstOrDefault();
            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, folder.FolderTypeId, request.ToId);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }
    }
}
