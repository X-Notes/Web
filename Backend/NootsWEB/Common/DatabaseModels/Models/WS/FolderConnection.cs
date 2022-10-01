using Common.DatabaseModels.Models.Folders;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.WS;

[Table(nameof(FolderConnection), Schema = SchemeConfig.WS)]
public class FolderConnection : BaseEntity<int>
{
    public Guid UserIdentifierConnectionIdId { set; get; }
    public UserIdentifierConnectionId UserIdentifierConnectionId { set; get; }

    public Guid FolderId { set; get; }
    public Folder Folder { set; get; }

    [Required(AllowEmptyStrings = false)]
    public string ConnectionId { set; get; }

    public Guid UserId { set; get; }

    public static FolderConnection Init(Guid userIdentifierConnectionId, Guid folderId, string connectionId, Guid userId)
    {
        return new FolderConnection
        {
            UserIdentifierConnectionIdId = userIdentifierConnectionId,
            FolderId = folderId,
            ConnectionId = connectionId,
            UserId = userId
        };
    }
}
