using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Texts.Entities;

public class UpdateCollectionContentResult : UpdateBaseContentResult
{
    public List<Guid> FileIds { set; get; }

    public UpdateCollectionContentResult(Guid contentId, int version, DateTimeOffset updatedDate, List<Guid> fileIds) : base(contentId, version, updatedDate)
    {
        FileIds = fileIds;
    }
}
