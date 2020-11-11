using Common.DatabaseModels.helpers;
using Domain.Commands.folderInner;
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
    public class FullFolderHandlerCommand :
        IRequestHandler<UpdateTitleFolderCommand, Unit>
    {
        private readonly FolderRepository folderRepository;
        private readonly UserRepository userRepository;

        public FullFolderHandlerCommand(FolderRepository folderRepository, UserRepository userRepository)
        {
            this.folderRepository = folderRepository;
            this.userRepository = userRepository;
        }

        public async Task<Unit> Handle(UpdateTitleFolderCommand request, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetUserByEmail(request.Email);
            if (user != null && Guid.TryParse(request.Id, out var guid))
            {
                var folder = await folderRepository.GetForUpdateTitle(guid);
                switch(folder.FolderType)
                {
                    case FoldersType.Shared:
                        {
                            switch (folder.RefType)
                            {
                                case RefType.Editor:
                                    {
                                        throw new Exception("No implimented");
                                        break;
                                    }
                                case RefType.Viewer:
                                    {
                                        throw new Exception("No implimented");
                                    }
                            }
                            break;
                        }
                    default:
                        {
                            if (folder.UserId == user.Id)
                            {
                                folder.Title = request.Title;
                                await folderRepository.UpdateFolder(folder);
                            }
                            else
                            {
                                var noteUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                                if (noteUser != null)
                                {
                                    folder.Title = request.Title;
                                    await folderRepository.UpdateFolder(folder);
                                }
                                else
                                {
                                    throw new Exception("No access rights");
                                }
                            }
                            break;
                        }
                }
            }
            return Unit.Value;
        }
    }
}
