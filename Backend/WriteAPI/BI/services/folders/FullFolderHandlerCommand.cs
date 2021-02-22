using Common.Naming;
using Domain.Commands.folderInner;
using MediatR;
using System;
using System.Linq;
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
            if (user != null)
            {
                var folder = await folderRepository.GetForUpdateTitle(request.Id);
                switch(folder.FolderType.Name)
                {
                    case ModelsNaming.SharedFolder:
                        {
                            switch (folder.RefType.Name)
                            {
                                case ModelsNaming.Editor:
                                    {
                                        throw new Exception("No implimented");
                                    }
                                case ModelsNaming.Viewer:
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
                                var folderUser = folder.UsersOnPrivateFolders.FirstOrDefault(x => x.UserId == user.Id);
                                if (folderUser != null && folderUser.AccessType.Name == ModelsNaming.Editor)
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
