using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;

namespace Noots.Permissions.Entities
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

        public bool NoteNotFound => Note == null;

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
            return this;
        }


        public List<Guid> GetAllUsers()
        {
            var userIds = Note.UsersOnPrivateNotes.Select(q => q.UserId).ToList();
            userIds.Add(Author.Id);
            return userIds;
        }
    }
}
