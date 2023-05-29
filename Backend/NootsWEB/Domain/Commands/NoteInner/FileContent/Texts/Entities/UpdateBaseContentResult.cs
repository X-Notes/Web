using System;

namespace Domain.Commands.NoteInner.FileContent.Texts.Entities;

public class UpdateBaseContentResult
{
    public Guid ContentId { set; get; }

    public int Version { set; get; }

    public DateTimeOffset UpdatedDate { set; get; }

    public UpdateBaseContentResult(Guid contentId, int version, DateTimeOffset updatedDate)
    {
        ContentId = contentId;
        Version = version;
        UpdatedDate = updatedDate;
    }
}
