using AutoMapper;
using Common;
using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Common.DTO.folders;
using Domain.Commands.folders;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.folders
{
    public class FolderHandlerCommand : 
        IRequestHandler<NewFolderCommand, string>,
        IRequestHandler<ArchiveFolderCommand, Unit>
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

        public async Task<string> Handle(NewFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);

            var folder = new Folder()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Order = 1,
                Color = FolderColorPallete.Green,
                FolderType = FoldersType.Private,
                CreatedAt = DateTimeOffset.Now
            };

            await folderRepository.Add(folder);

            return folder.Id.ToString("N");
        }

        public async Task<Unit> Handle(ArchiveFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserWithFolders(request.Email);
            var folders = user.Folders.Where(x => request.Ids.Contains(x.Id.ToString("N"))).ToList();

            if (folders.Count == request.Ids.Count)
            {
                await folderRepository.CastFolders(folders, user.Folders, request.FolderType, FoldersType.Archive);
            }
            else
            {
                throw new Exception();
            }

            return Unit.Value;
        }
    }
}
