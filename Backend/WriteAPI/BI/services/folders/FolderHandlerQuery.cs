using AutoMapper;
using BI.Mapping;
using Common.DatabaseModels.models;
using Common.DTO.folders;
using Common.Naming;
using Domain.Queries.folders;
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
    public class FolderHandlerQuery :
        IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>,
        IRequestHandler<GetFullFolderQuery, FullFolderAnswer>
    {

        private readonly FolderRepository folderRepository;
        private readonly IMediator _mediator;
        private readonly UserRepository userRepository;
        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;
        private readonly AppCustomMapper appCustomMapper;
        private readonly AppRepository appRepository;
        public FolderHandlerQuery(
            FolderRepository folderRepository, 
            UserRepository userRepository,
            IMediator _mediator,
            AppCustomMapper appCustomMapper,
            AppRepository appRepository,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this._mediator = _mediator;
            this.appCustomMapper = appCustomMapper;
            this.appRepository = appRepository;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        }


        public async Task<List<SmallFolder>> Handle(GetFoldersByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            if (user != null)
            {
                var folders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(user.Id, request.TypeId);
                var type = await appRepository.GetFolderTypeByName(ModelsNaming.SharedFolder);

                if (type.Id == request.TypeId)
                {
                    var usersOnPrivateFolders = await usersOnPrivateFoldersRepository.GetWhere(x => x.UserId == user.Id);
                    var foldersIds = usersOnPrivateFolders.Select(x => x.FolderId);
                    var sharedFolders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(foldersIds);
                    folders.AddRange(sharedFolders);
                    folders = folders.OrderByDescending(x => x.UpdatedAt).ToList();
                }

                return appCustomMapper.MapFoldersToSmallFolders(folders);
            }
            return new List<SmallFolder>();
        }


        public async Task<FullFolderAnswer> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.Id, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if(permissions.CanWrite)
            {
                return new FullFolderAnswer()
                {
                    CanView = true,
                    CanEdit = true,
                    FullFolder = appCustomMapper.MapFolderToFullFolder(folder)
                };
            }

            if(permissions.CanRead)
            {
                return new FullFolderAnswer()
                {
                    CanView = true,
                    CanEdit = false,
                    FullFolder = appCustomMapper.MapFolderToFullFolder(folder)
                };
            }

            return new FullFolderAnswer()
            {
                CanView = false,
                CanEdit = false,
                FullFolder = null
            };

        }
    }
}
