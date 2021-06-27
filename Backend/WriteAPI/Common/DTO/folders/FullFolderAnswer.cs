
using Common.DatabaseModels.models;
using System;

namespace Common.DTO.folders
{
    public class FullFolderAnswer
    {
        public bool IsOwner { set; get; }

        public bool CanView { set; get; }

        public bool CanEdit { set; get; }

        public Guid? AuthorId { set; get; }

        public FullFolder FullFolder { set; get; }

        public FullFolderAnswer(bool isOwner, bool canView, bool canEdit, Guid? authorId, FullFolder fullFolder)
        {
            this.IsOwner = isOwner;
            this.CanView = canView;
            this.CanEdit = canEdit;
            this.FullFolder = fullFolder;
            this.AuthorId = authorId;
        }
    }
}
