using System;
using System.Collections.Generic;

namespace Common.DTO.WebSockets;

public class DeadConnectionDTO
{
    public Guid UserIdentifierConnectionId { set; get; }

    public List<Guid> NoteIds { set; get; }

    public List<Guid> FolderIds { set; get; }

    public Guid UserId { set; get; }
}
