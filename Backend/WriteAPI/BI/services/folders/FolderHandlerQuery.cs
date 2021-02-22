using AutoMapper;
using Common.DatabaseModels.models;
using Common.DTO.folders;
using Common.Naming;
using Domain.Queries.folders;
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
        private readonly UserRepository userRepository;
        public FolderHandlerQuery(IMapper mapper, FolderRepository folderRepository, UserRepository userRepository)
        {
            this.mapper = mapper;
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
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
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null)
            {
                var folder = await folderRepository.GetFull(request.Id);

                if (folder == null)
                {
                    throw new Exception("Folder with this id does not exist");
                }

                switch (folder.FolderType.Name)
                {
                    case ModelsNaming.SharedFolder:
                        {
                            return GetFullFolderByRefTypeName(folder, folder.RefType.Name);
                        }
                    default:
                        {
                            if (folder.UserId == user.Id)
                            {
                                return new FullFolderAnswer()
                                {
                                    CanView = true,
                                    CanEdit = true,
                                    FullFolder = mapper.Map<FullFolder>(folder)
                                };
                            }
                            else
                            {
                                var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                                if (folderUser != null)
                                {
                                    return GetFullFolderByRefTypeName(folder, folderUser.AccessType.Name);
                                }
                                else
                                {
                                    return new FullFolderAnswer()
                                    {
                                        CanView = false,
                                        CanEdit = false,
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

        public FullFolderAnswer GetFullFolderByRefTypeName(Folder folder, string refTypeName)
        {
            switch (refTypeName)
            {
                case ModelsNaming.Editor:
                    {
                        return new FullFolderAnswer()
                        {
                            CanView = true,
                            CanEdit = true,
                            FullFolder = mapper.Map<FullFolder>(folder)
                        };
                    }
                case ModelsNaming.Viewer:
                    {
                        return new FullFolderAnswer()
                        {
                            CanView = true,
                            CanEdit = false,
                            FullFolder = mapper.Map<FullFolder>(folder)
                        };
                    }
            }
            throw new Exception("Incorrect");
        }

    }
}
