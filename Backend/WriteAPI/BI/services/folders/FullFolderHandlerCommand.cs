using Common.Naming;
using Domain.Commands.folderInner;
using Domain.Queries.permissions;
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
        private readonly IMediator _mediator;
        public FullFolderHandlerCommand(FolderRepository folderRepository, IMediator _mediator)
        {
            this.folderRepository = folderRepository;
            this._mediator = _mediator;
        }

        public async Task<Unit> Handle(UpdateTitleFolderCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForFolder(request.Id, request.Email);
            var permissions = await _mediator.Send(command);
            var folder = permissions.Folder;

            if(permissions.CanWrite)
            {
                folder.Title = request.Title;
                await folderRepository.UpdateFolder(folder);
            }

            return Unit.Value;
        }
    }
}
