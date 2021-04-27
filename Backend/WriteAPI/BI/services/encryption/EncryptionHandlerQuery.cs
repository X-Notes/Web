using Common.DTO.notes.FullNoteContent;
using Domain.Queries.encryption;
using Domain.Queries.permissions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services.encryption
{
    public class EncryptionHandlerQuery :
        IRequestHandler<UnlockNoteQuery, OperationResult<bool>>
    {
        private readonly IMediator _mediator;
        private readonly AppEncryptor appEncryptor;
        public EncryptionHandlerQuery(IMediator _mediator, AppEncryptor appEncryptor)
        {
            this._mediator = _mediator;
            this.appEncryptor = appEncryptor;
        }

        public async Task<OperationResult<bool>> Handle(UnlockNoteQuery request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanRead)
            {
                if(appEncryptor.Compare(request.Password, permissions.Note.Password))
                {
                    return new OperationResult<bool>(true, true);
                }

                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false);
        }
    }
}
