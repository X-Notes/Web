using System.Threading;
using System.Threading.Tasks;
using Common.DTO.Notes.FullNoteContent;
using Domain.Queries.Encryption;
using Domain.Queries.Permissions;
using MediatR;

namespace BI.Services.Encryption
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
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
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
