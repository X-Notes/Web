using Common.DatabaseModels.Models.Notes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.WS;

[Table(nameof(NoteConnection), Schema = SchemeConfig.WS)]
public class NoteConnection : BaseEntity<int>
{
    public Guid UserIdentifierConnectionIdId { set; get; }
    public UserIdentifierConnectionId UserIdentifierConnectionId { set; get; }

    public Guid NoteId { set; get; }
    public Note Note { set; get; }
}
