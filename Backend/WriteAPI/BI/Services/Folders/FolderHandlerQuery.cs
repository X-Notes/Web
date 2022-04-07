using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.Folders;
using Common.DTO;
using Common.DTO.Folders;
using Common.DTO.Folders.AdditionalContent;
using Common.DTO.Notes.AdditionalContent;
using Domain.Queries.Folders;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.Services.Folders
{
    public class FolderHandlerQuery :
        IRequestHandler<GetFoldersByTypeQuery, List<SmallFolder>>,
        IRequestHandler<GetFullFolderQuery, FullFolderAnswer>,
        IRequestHandler<GetFoldersByFolderIdsQuery, OperationResult<List<SmallFolder>>>,
        IRequestHandler<GetAdditionalContentFolderInfoQuery, List<BottomFolderContent>>
    {

        private readonly FolderRepository folderRepository;
        private readonly IMediator _mediator;

        private readonly UserRepository userRepository;

        private readonly UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository;

        private readonly NoteFolderLabelMapper appCustomMapper;

        public FolderHandlerQuery(
            FolderRepository folderRepository, 
            UserRepository userRepository,
            IMediator _mediator,
            NoteFolderLabelMapper appCustomMapper,
            UsersOnPrivateFoldersRepository usersOnPrivateFoldersRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
            this._mediator = _mediator;
            this.appCustomMapper = appCustomMapper;
            this.usersOnPrivateFoldersRepository = usersOnPrivateFoldersRepository;
        }


        public async Task<List<SmallFolder>> Handle(GetFoldersByTypeQuery request, CancellationToken cancellationToken)
        {
            var folders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesIncludeNote(request.UserId, request.TypeId, request.Settings);

            if (FolderTypeENUM.Shared == request.TypeId)
            {
                var usersOnPrivateFolders = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.UserId == request.UserId);
                var foldersIds = usersOnPrivateFolders.Select(x => x.FolderId);
                var sharedFolders = await folderRepository.GetFoldersByFolderIdsIncludeNote(foldersIds, request.Settings);
                sharedFolders.ForEach(x => x.FolderTypeId = FolderTypeENUM.Shared);
                folders.AddRange(sharedFolders);
                folders = folders.DistinctBy(x => x.Id).ToList();
            }

            return appCustomMapper.MapFoldersToSmallFolders(folders, request.UserId);
        }


        public async Task<FullFolderAnswer> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.Id, request.UserId);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if(permissions.CanWrite)
            {
                return new FullFolderAnswer(permissions.IsOwner, true, true, folder.UserId, appCustomMapper.MapFolderToFullFolder(folder));
            }

            if(permissions.CanRead)
            {
                return new FullFolderAnswer(permissions.IsOwner, true, false, folder.UserId, appCustomMapper.MapFolderToFullFolder(folder));
            }

            return new FullFolderAnswer(permissions.IsOwner, false, false, null, null);

        }

        public async Task<OperationResult<List<SmallFolder>>> Handle(GetFoldersByFolderIdsQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFoldersManyQuery(request.FolderIds, request.UserId);
            var permissions = await _mediator.Send(command);

            var canReadIds = permissions.Where(x => x.perm.CanRead).Select(x => x.folderId);
            if (canReadIds.Any())
            {
                var folders = await folderRepository.GetFoldersByFolderIdsIncludeNote(canReadIds, request.Settings);
                folders.ForEach(folder =>
                {
                    if (folder.UserId != request.UserId)
                    {
                        folder.FolderTypeId = FolderTypeENUM.Shared;
                    }
                });
                var result = appCustomMapper.MapFoldersToSmallFolders(folders, request.UserId);
                return new OperationResult<List<SmallFolder>>(true, result);
            }
            return new OperationResult<List<SmallFolder>>().SetNotFound();
        }

        public async Task<List<BottomFolderContent>> Handle(GetAdditionalContentFolderInfoQuery request, CancellationToken cancellationToken)
        {
            var usersOnFolder = await usersOnPrivateFoldersRepository.GetByFolderIds(request.FolderIds);
            var usersOnNotesDict = usersOnFolder.ToLookup(x => x.FolderId);
            return request.FolderIds.Select(folderId => new BottomFolderContent
            {
                IsHasUserOnNote = usersOnNotesDict.Contains(folderId),
                FolderId = folderId
            }).ToList();
        }
    }
}
