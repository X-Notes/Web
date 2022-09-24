using Common.DatabaseModels.Models.Folders;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.WS;

[Table(nameof(FolderConnection), Schema = SchemeConfig.WS)]
public class FolderConnection : BaseEntity<int>
{
    public Guid UserIdentifierConnectionIdId { set; get; }
    public UserIdentifierConnectionId UserIdentifierConnectionId { set; get; }

    public Guid FolderId { set; get; }
    public Folder Folder { set; get; }
}
