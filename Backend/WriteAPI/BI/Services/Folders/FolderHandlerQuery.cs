using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BI.Helpers;
using BI.Mapping;
using Common.DatabaseModels.Models.Folders;
using Common.DTO.Folders;
using Domain.Queries.Folders;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Folders;
using WriteContext.Repositories.Users;

namespace BI.Services.Folders
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

        public FolderHandlerQuery(
            FolderRepository folderRepository, 
            UserRepository userRepository,
            IMediator _mediator,
            AppCustomMapper appCustomMapper,
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
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user != null)
            {
                var folders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(user.Id, request.TypeId);

                if (FolderTypeENUM.Shared == request.TypeId)
                {
                    var usersOnPrivateFolders = await usersOnPrivateFoldersRepository.GetWhereAsync(x => x.UserId == user.Id);
                    var foldersIds = usersOnPrivateFolders.Select(x => x.FolderId);
                    var sharedFolders = await folderRepository.GetFoldersByUserIdAndTypeIdNotesInclude(foldersIds);
                    folders.AddRange(sharedFolders);
                    folders = folders.DistinctBy(x => x.Id).ToList();
                }

                return appCustomMapper.MapFoldersToSmallFolders(folders);
            }
            return new List<SmallFolder>();
        }


        public async Task<FullFolderAnswer> Handle(GetFullFolderQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolderQuery(request.Id, request.Email);
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
    }
}
