using System;

namespace Common.DatabaseModels.Models.Users.Notifications;

public class NotificationMetadata
{
    public Guid? FolderId { set; get; }

    public Guid? NoteId { set; get; }

    public string? Title { set; get; }
}
