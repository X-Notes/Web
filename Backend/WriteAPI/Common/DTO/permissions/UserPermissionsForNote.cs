using Common.DatabaseModels.models;


namespace Common.DTO.permissions
{
    public class UserPermissionsForNote
    {
        public User User { set; get; }
        public Note Note { set; get; }
        public bool CanRead { set; get; }
        public bool CanWrite { set; get; }
        public bool UserNotFound { set; get; }
        public bool NoteNotFound { set; get; }
        public bool IsOwner { set; get; }
        public UserPermissionsForNote GetFullAccess(User user, Note note, bool isOwner)
        {
            User = user;
            Note = note;
            CanRead = true;
            CanWrite = true;
            IsOwner = isOwner;
            return this;
        }
        public UserPermissionsForNote GetOnlyRead(User user, Note note)
        {
            User = user;
            Note = note;
            CanRead = true;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForNote NoAccessRights(User user, Note note)
        {
            User = user;
            Note = note;
            CanRead = false;
            CanWrite = false;
            return this;
        }

        public UserPermissionsForNote GetUserNotFounded()
        {
            UserNotFound = true;
            return this;
        }

        public UserPermissionsForNote GetNoteNotFounded()
        {
            NoteNotFound = true;
            return this;
        }

    }
}
