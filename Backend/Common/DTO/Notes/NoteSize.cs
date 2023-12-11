using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Files;

namespace Common.DTO.Notes;

public class NoteSize
{
    public Guid NoteId { set; get; }
    
    public List<AppFile> Files { set; get; }
}