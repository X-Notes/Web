using System.Threading;
using System.Threading.Tasks;
using Common.DTO;
using Domain.Commands.Encryption;
using Domain.Queries.Permissions;
using MediatR;
using WriteContext.Repositories.Notes;

namespace BI.Services.Encryption
{
    public class EncryptionHandlerCommand :
                IRequestHandler<EncryptionNoteCommand, OperationResult<bool>>,
                IRequestHandler<DecriptionNoteCommand, OperationResult<bool>>
    {
        private readonly IMediator _mediator;
        private readonly AppEncryptor appEncryptor;
        private readonly NoteRepository noteRepository;
        public EncryptionHandlerCommand(IMediator _mediator, AppEncryptor appEncryptor, NoteRepository noteRepository)
        {
            this._mediator = _mediator;
            this.appEncryptor = appEncryptor;
            this.noteRepository = noteRepository;
        }

        public async Task<OperationResult<bool>> Handle(EncryptionNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (request.Password == request.ConfirmPassword)
                {
                    var note = permissions.Note;
                    var hash = appEncryptor.Encode(request.Password);
                    note.IsLocked = true;
                    note.Password = hash;
                    await noteRepository.UpdateAsync(note);
                    return new OperationResult<bool>(true, true);
                }
                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false);
        }

        public async Task<OperationResult<bool>> Handle(DecriptionNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (appEncryptor.Compare(request.Password, permissions.Note.Password))
                {
                    var note = permissions.Note;
                    note.IsLocked = false;
                    note.Password = null;
                    await noteRepository.UpdateAsync(note);
                    return new OperationResult<bool>(true, true);
                }

                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false);
        }
    }
}
