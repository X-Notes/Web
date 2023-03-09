using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.History.Contents;
using Common.DatabaseModels.Models.Notes;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.Helpers;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Common.DatabaseModels.Models.History
{
    [Table(nameof(NoteSnapshot), Schema = SchemeConfig.NoteHistory)]
    public class NoteSnapshot : BaseEntity<Guid>, IBaseNote<string>
    {
        public NoteTypeENUM NoteTypeId { set; get; }
        public NoteType NoteType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }

        [Column(TypeName = "jsonb")]
        public List<SnapshotNoteLabel> Labels { get; set; }

        [Column(TypeName = "jsonb")]
        public string Contents { set; get; }

        public DateTimeOffset SnapshotTime { set; get; }

        public List<User> Users { set; get; }
        public List<UserNoteSnapshotManyToMany> UserHistories { set; get; }

        public Guid NoteId { set; get; }
        public Note Note { set; get; }

        public List<AppFile> AppFiles { set; get; }
        public List<SnapshotFileContent> SnapshotFileContents { set; get; }


        public void SetContents(ContentSnapshot contents)
        {
            Contents = contents.JSerialize();
        }

        public ContentSnapshot GetContents()
        {
            return Contents.JDeserializeObject<ContentSnapshot>();
        }
    }
}
