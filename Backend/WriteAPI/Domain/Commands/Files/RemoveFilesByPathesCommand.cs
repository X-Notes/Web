using System.Collections.Generic;
using MediatR;

namespace Domain.Commands.Files
{
    // TODO MAKE CORRECT FILE DELETING
    public class RemoveFilesByPathesCommand : IRequest<Unit>
    {
        public List<string> Pathes { set; get; }
        public string UserId { set; get; }
        public RemoveFilesByPathesCommand(string userId, List<string> Pathes)
        {
            this.Pathes = Pathes;
            UserId = userId;
        }
    }
}
