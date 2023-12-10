namespace Permissions.Entities;

public class BasePermissions
{
    public Guid AuthorId { protected  set; get; }
    
    public Guid CallerId { protected   set; get; }
    
    public Guid FolderId { protected   set; get; }
    
    public bool CanRead { protected    set; get; }
    
    public bool CanWrite { protected   set; get; }
    
    public bool IsOwner => CallerId == AuthorId;
}