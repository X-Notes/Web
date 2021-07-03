using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.Labels;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Notes
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

        // TODO THIS MUST BE NULLABLE
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
