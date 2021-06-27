
using Common.DatabaseModels.models;
using System;

namespace Common.DTO.notes
{
    public class FullNoteAnswer
    {
        public bool IsOwner { set; get; }

        public bool CanView { set; get; }

        public bool CanEdit { set; get; }

        public Guid? AuthorId { set; get; }

        public FullNote FullNote { set; get; }

        public FullNoteAnswer(bool isOwner, bool canView, bool canEdit, Guid? authorId, FullNote fullNote)
        {
            this.IsOwner = isOwner;
            this.CanView = canView;
            this.CanEdit = canEdit;
            this.FullNote = fullNote;
            this.AuthorId = authorId;
        }
    }
}
