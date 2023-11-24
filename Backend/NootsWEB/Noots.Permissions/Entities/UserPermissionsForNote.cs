using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Users;

namespace Permissions.Entities
{
    public class UserPermissionsForNote
    {
        public Guid AuthorId
        {
            get
            {
                return Note.UserId;
            }
        }

        public User Caller { set; get; }

        public Note Note { set; get; }

        public bool CanRead { set; get; }

        public bool CanWrite { set; get; }

        public bool ContainsPublicFolders { set; get; }

        public bool NoteNotFound => Note == null;

        public bool IsOwner
        {
            get
            {
                return Caller?.Id == Note.UserId;
            }

        }

        public bool SecondUsersHasAccess
        {
            get
            {
                return Note.UsersOnPrivateNotes.Any();
            }

        }

        public bool IsMultiplyUpdate
        {
            get
            {
                return Note.IsShared() || Note.UsersOnPrivateNotes.Any() || ContainsPublicFolders;
            }
        }

        public bool IsSingleUpdate
        {
            get
            {
                return !IsMultiplyUpdate;
            }
        }

        public UserPermissionsForNote SetFullAccess(User user, Note note, bool containsPublicFolders)
        {
            Caller = user;
            Note = note;
            CanRead = true;
            CanWrite = true;
            ContainsPublicFolders = containsPublicFolders;
            return this;
        }

        public UserPermissionsForNote SetOnlyRead(User user, Note note, bool containsPublicFolders)
        {
            Caller = user;
            Note = note;
            CanRead = true;
            CanWrite = false;
            ContainsPublicFolders = containsPublicFolders;
            return this;
        }

        public UserPermissionsForNote SetNoAccessRights(User user, Note note, bool containsPublicFolders)
        {
            Caller = user;
            Note = note;
            CanRead = false;
            CanWrite = false;
            ContainsPublicFolders = containsPublicFolders;
            return this;
        }


        public UserPermissionsForNote SetNoteNotFounded()
        {
            return this;
        }


        public List<Guid> GetAllUsers()
        {
            var userIds = new List<Guid> { AuthorId };

            if(Note.UsersOnPrivateNotes != null)
            {
                var userNoteIds = Note.UsersOnPrivateNotes.Select(q => q.UserId).ToList();
                userIds.AddRange(userNoteIds);
            }

            return userIds;
        }
    }
}
