using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.folderInner
{
    public class UpdateTitleFolderCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Title { set; get; }
        public string Id { set; get; }
    }
}
