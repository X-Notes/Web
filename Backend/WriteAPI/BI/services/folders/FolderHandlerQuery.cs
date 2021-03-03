using AutoMapper;
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

        private readonly IMapper mapper;
        private readonly FolderRepository folderRepository;
        private readonly IMediator _mediator;
        private readonly UserRepository userRepository;
        public FolderHandlerQuery(IMapper mapper, 
            FolderRepository folderRepository, 
            UserRepository userRepository,
            IMediator _mediator)
        {
            this.mapper = mapper;
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this._mediator = _mediator;
        }


        public async Task<List<SmallFolder>> Handle(GetFoldersByTypeQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folders = (await folderRepository.GetFoldersByUserIdAndTypeId(user.Id, request.TypeId)).OrderBy(x => x.Order);
                return mapper.Map<List<SmallFolder>>(folders);
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
                    FullFolder = mapper.Map<FullFolder>(folder)
                };
            }

            if(permissions.CanRead)
            {
                return new FullFolderAnswer()
                {
                    CanView = true,
                    CanEdit = false,
                    FullFolder = mapper.Map<FullFolder>(folder)
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
