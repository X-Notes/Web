using AutoMapper;
using Common.DatabaseModels.helpers;
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
        IRequestHandler<GetFullFolderQuery, FullFolderAnswer>
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

        public async Task<FullFolderAnswer> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null && Guid.TryParse(request.Id, out var guid))
            {
                var folder = await folderRepository.GetFull(guid);

                if (folder == null)
                {
                    throw new Exception("Folder with this id does not exist");
                }

                switch (folder.FolderType)
                {
                    case FoldersType.Shared:
                        {
                            switch (folder.RefType)
                            {
                                case RefType.Editor:
                                    {
                                        return new FullFolderAnswer()
                                        {
                                            CanView = true,
                                            AccessType = RefType.Editor,
                                            FullFolder = mapper.Map<FullFolder>(folder)
                                        };
                                    }
                                case RefType.Viewer:
                                    {
                                        return new FullFolderAnswer()
                                        {
                                            CanView = true,
                                            AccessType = RefType.Viewer,
                                            FullFolder = mapper.Map<FullFolder>(folder)
                                        };
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (folder.UserId == user.Id)
                            {
                                return new FullFolderAnswer()
                                {
                                    CanView = true,
                                    AccessType = RefType.Editor,
                                    FullFolder = mapper.Map<FullFolder>(folder)
                                };
                            }
                            else
                            {
                                var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                                if (folderUser != null)
                                {
                                    return new FullFolderAnswer()
                                    {
                                        CanView = true,
                                        AccessType = folderUser.AccessType,
                                        FullFolder = mapper.Map<FullFolder>(folder)
                                    };
                                }
                                else
                                {
                                    return new FullFolderAnswer()
                                    {
                                        CanView = false,
                                        AccessType = null,
                                        FullFolder = null
                                    };
                                }
                            }
                        }
                }
                throw new Exception("Error. Incorrect folder type");
            }
            throw new Exception("Incorrect user data");
        }
    }
}
