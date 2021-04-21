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

namespace BI.services.folders
{
    public class FolderHandlerQuery :
        IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>,
        IRequestHandler<GetFullFolderQuery, FullFolderAnswer>
    {

        private readonly FolderRepository folderRepository;
        private readonly IMediator _mediator;
        private readonly UserRepository userRepository;
        private readonly AppCustomMapper appCustomMapper;
        public FolderHandlerQuery(
            FolderRepository folderRepository, 
            UserRepository userRepository,
            IMediator _mediator,
            AppCustomMapper appCustomMapper)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this._mediator = _mediator;
            this.appCustomMapper = appCustomMapper;
        }


        public async Task<List<SmallFolder>> Handle(GetFoldersByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == request.Email);
            if (user != null)
            {
                var folders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(user.Id, request.TypeId);
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
