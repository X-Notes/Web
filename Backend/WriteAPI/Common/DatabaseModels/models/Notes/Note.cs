using Common.DatabaseModels.models.Folders;
using Common.DatabaseModels.models.History;
using Common.DatabaseModels.models.Labels;
using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.models.Notes
{
    public class Note : BaseEntity<Guid>
    {
        public NoteTypeENUM NoteTypeId { set; get; }
        public NoteType NoteType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }

        public bool IsLocked { set; get; }
        public string Password { set; get; }

        public bool IsHistory { set; get; }

        public Guid UserId { set; get; }
        public User User { set; get; }

        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset UpdatedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }

        public List<UserOnNoteNow> UserOnNotesNow { set; get; }
        public List<UserOnPrivateNotes> UsersOnPrivateNotes { set; get; }
        public List<LabelsNotes> LabelsNotes { get; set; }
        public List<FoldersNotes> FoldersNotes { set; get; }
        public List<ReletatedNoteToInnerNote> ReletatedNoteToInnerNotesFrom { set; get; }
        public List<ReletatedNoteToInnerNote> ReletatedNoteToInnerNotesTo { set; get; }
        public List<BaseNoteContent> Contents { set; get; }
        public List<NoteHistory> NoteHistories { set; get; }
    }
}
