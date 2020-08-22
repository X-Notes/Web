using AutoMapper;
using Common.DTO.folders;
using Domain.Queries.folders;
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
    public class FolderHandlerQuery :
        IRequestHandler<GetPrivateFoldersQuery, List<SmallFolder>>,
        IRequestHandler<GetSharedFoldersQuery, List<SmallFolder>>,
        IRequestHandler<GetArchiveFoldersQuery, List<SmallFolder>>,
        IRequestHandler<GetDeletedFoldersQuery, List<SmallFolder>>,

        IRequestHandler<GetFullFolderQuery, FullFolder>
    {

        private readonly IMapper mapper;
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;
        public FolderHandlerQuery(IMapper mapper, FolderRepository folderRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
        }


        public async Task<List<SmallFolder>> Handle(GetPrivateFoldersQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folders = (await folderRepository.GetPrivateFoldersByUserId(user.Id)).OrderBy(x => x.Order);
                return mapper.Map<List<SmallFolder>>(folders);
            }
            return new List<SmallFolder>();
        }

        public async Task<List<SmallFolder>> Handle(GetSharedFoldersQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folders = (await folderRepository.GetSharedFoldersByUserId(user.Id)).OrderBy(x => x.Order);
                return mapper.Map<List<SmallFolder>>(folders);
            }
            return new List<SmallFolder>();
        }

        public async Task<List<SmallFolder>> Handle(GetArchiveFoldersQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folders = (await folderRepository.GetArchiveFoldersByUserId(user.Id)).OrderBy(x => x.Order);
                return mapper.Map<List<SmallFolder>>(folders);
            }
            return new List<SmallFolder>();
        }

        public async Task<List<SmallFolder>> Handle(GetDeletedFoldersQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folders = (await folderRepository.GetDeletedFoldersByUserId(user.Id)).OrderBy(x => x.Order);
                return mapper.Map<List<SmallFolder>>(folders);
            }
            return new List<SmallFolder>();
        }

        public async Task<FullFolder> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null && Guid.TryParse(request.Id, out var guid))
            {
                var folder = await folderRepository.GetFull(guid);
                return mapper.Map<FullFolder>(folder);
            }
            return null;
        }
    }
}
