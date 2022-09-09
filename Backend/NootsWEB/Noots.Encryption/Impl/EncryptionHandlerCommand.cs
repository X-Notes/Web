using Common.DTO;
using MediatR;
using Noots.DatabaseContext.Repositories.Notes;
using Noots.Encryption.Commands;
using Noots.Permissions.Queries;

namespace Noots.Encryption.Impl
{
    public class EncryptionHandlerCommand :
                IRequestHandler<EncryptionNoteCommand, OperationResult<bool>>,
                IRequestHandler<DecriptionNoteCommand, OperationResult<bool>>
    {
        private readonly IMediator _mediator;
        private readonly AppEncryptor appEncryptor;
        private readonly NoteRepository noteRepository;
        private readonly UserNoteEncryptService userNoteEncryptStorage;
        private readonly UsersOnPrivateNotesRepository usersOnPrivateNotesRepository;

        public EncryptionHandlerCommand(
            IMediator _mediator,
            AppEncryptor appEncryptor,
            NoteRepository noteRepository,
            UserNoteEncryptService userNoteEncryptStorage,
            UsersOnPrivateNotesRepository usersOnPrivateNotesRepository)
        {
            this._mediator = _mediator;
            this.appEncryptor = appEncryptor;
            this.noteRepository = noteRepository;
            this.userNoteEncryptStorage = userNoteEncryptStorage;
            this.usersOnPrivateNotesRepository = usersOnPrivateNotesRepository;
        }

        public async Task<OperationResult<bool>> Handle(EncryptionNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                if (permissions.Note.IsShared())
                {
                    return new OperationResult<bool>().SetAnotherError();
                }

                if (request.Password == request.ConfirmPassword)
                {
                    var note = permissions.Note;
                    var hash = appEncryptor.Encode(request.Password);
                    note.Password = hash;
                    await noteRepository.UpdateAsync(note);

                    var users = await usersOnPrivateNotesRepository.GetWhereAsync(x => x.NoteId == note.Id);
                    if (users.Any())
                    {
                        await usersOnPrivateNotesRepository.RemoveRangeAsync(users);
                    }

                    return new OperationResult<bool>(true, true);
                }
                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false).SetNoPermissions();
        }

        public async Task<OperationResult<bool>> Handle(DecriptionNoteCommand request, CancellationToken cancellationToken)
        {
            var command = new GetUserPermissionsForNoteQuery(request.NoteId, request.UserId);
            var permissions = await _mediator.Send(command);

            if (permissions.IsOwner)
            {
                if (appEncryptor.Compare(request.Password, permissions.Note.Password))
                {
                    var note = permissions.Note;
                    note.Password = null;
                    await noteRepository.UpdateAsync(note);
                    await userNoteEncryptStorage.RemoveUnlockTime(note.Id);
                    return new OperationResult<bool>(true, true);
                }

                return new OperationResult<bool>(true, false);
            }

            return new OperationResult<bool>(false, false).SetNoPermissions();
        }
    }
}
