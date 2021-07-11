using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;
using MediatR;

namespace Domain.Commands.Files
{
    public class RemoveFilesCommand : IRequest<Unit>
    {
        public List<AppFile> AppFiles { set; get; }

        public string UserId { set; get; }

        public bool IsNoCheckDelete { set; get; }

        public RemoveFilesCommand(string userId, List<AppFile> appFiles)
        {
            this.AppFiles = appFiles;
            UserId = userId;
        }

        public RemoveFilesCommand(string userId, AppFile appFile)
        {
            this.AppFiles = new List<AppFile> { appFile };
            UserId = userId;
        }

        public RemoveFilesCommand SetIsNoCheckDelete()
        {
            IsNoCheckDelete = true;
            return this;
        }
    }
}
