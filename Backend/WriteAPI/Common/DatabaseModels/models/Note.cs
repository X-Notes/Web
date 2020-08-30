using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DatabaseModels.models
{
    public class Note
    {
        public Guid Id { get; set; }

        public NotesType NoteType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }

        public int UserId { set; get; }
        public User User { set; get; }

        public DateTimeOffset DeletedAt { set; get; }
        public DateTimeOffset CreatedAt { set; get; }

        public List<UserOnNote> UserOnNotes { set; get; }
        public List<LabelsNotes> LabelsNotes { get; set; }
        public List<FoldersNotes> FoldersNotes { set; get; }
    }
}
