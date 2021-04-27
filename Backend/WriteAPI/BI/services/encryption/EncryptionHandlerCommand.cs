using Common.DTO.notes.FullNoteContent;
using Domain.Commands.encryption;
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
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (request.Password == request.ConfirmPassword)
                {
                    var note = permissions.Note;
                    var hash = appEncryptor.Encode(request.Password);
                    note.IsLocked = true;
                    note.Password = hash;
                    await noteRepository.Update(note);
                    return new OperationResult<bool>(true, true);
                }
                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false);
        }

        public async Task<OperationResult<bool>> Handle(DecriptionNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNote(request.NoteId, request.Email);
            var permissions = await _mediator.Send(command);

            if (permissions.CanWrite)
            {
                if (appEncryptor.Compare(request.Password, permissions.Note.Password))
                {
                    var note = permissions.Note;
                    note.IsLocked = false;
                    note.Password = null;
                    await noteRepository.Update(note);
                    return new OperationResult<bool>(true, true);
                }

                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false);
        }
    }
}
