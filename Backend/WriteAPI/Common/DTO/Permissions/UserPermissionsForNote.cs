using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;
using System.Linq;

namespace Common.DTO.Permissions
{
    public class UserPermissionsForNote
    {
        public User Author
        {
            get
            {
                return Note.User;
            }
        }

        public User Caller { set; get; }

        public Note Note { set; get; }

        public bool CanRead { set; get; }

        public bool CanWrite { set; get; }

        public bool UserNotFound { set; get; }

        public bool NoteNotFound { set; get; }

        public bool IsOwner 
        {
            get
            {
                return Caller?.Id == Note.UserId;
            }

        }

        public bool IsMultiplyUpdate
        {
            get
            {
                return Note.IsShared() || Note.UsersOnPrivateNotes.Any();
            }
        }

        public bool IsSingleUpdate
        {
            get
            {
                return !IsMultiplyUpdate;
            }
        }

        public UserPermissionsForNote SetFullAccess(User user, Note note)
        {
            Caller = user;
            Note = note;
            CanRead = true;
            CanWrite = true;
            return this;
        }

        public UserPermissionsForNote SetOnlyRead(User user, Note note)
        {
            Caller = user;
            Note = note;
            CanRead = true;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForNote SetNoAccessRights(User user, Note note)
        {
            Caller = user;
            Note = note;
            CanRead = false;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForNote SetUserNotFounded()
        {
            UserNotFound = true;
            return this;
        }

        public UserPermissionsForNote SetNoteNotFounded()
        {
            NoteNotFound = true;
            return this;
        }

    }
}
