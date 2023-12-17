namespace Permissions.Entities
{
    public class UserPermissionsForNote : BasePermissions
    {
        public bool NoteNotFound { private set; get; }
        
        public Guid NoteId { set; get; }
        
        
        public UserPermissionsForNote GetFullAccess(Guid authorId, Guid callerId, Guid noteId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            NoteId = noteId;
            
            CanRead = true;
            CanWrite = true;
            
            return this;
        }

        public UserPermissionsForNote GetOnlyRead(Guid authorId, Guid callerId, Guid noteId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            NoteId = noteId;
            
            CanRead = true;
            CanWrite = false;
            
            return this;
        }

        public UserPermissionsForNote GetNoAccessRights(Guid authorId, Guid callerId, Guid noteId)
        {
            AuthorId = authorId;
            CallerId = callerId;
            NoteId = noteId;
            
            CanRead = false;
            CanWrite = false;
            
            return this;
        }
        
        public UserPermissionsForNote GetNoteNotFounded()
        {
            NoteNotFound = true;
            return this;
        }
    }
}
