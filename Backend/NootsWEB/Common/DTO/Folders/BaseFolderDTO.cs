using Common.DatabaseModels.Models.Folders;
using Common.DatabaseModels.Models.Systems;
using Common.Interfaces;
using System;
using System.Collections.Generic;

namespace Common.DTO.Folders
{
    public class BaseFolderDTO : IDateCreator, IDateUpdater, IDateDeleter
    {
        public Guid Id { get; set; }

        public string Title { set; get; }

        public string Color { set; get; }

        public Guid UserId { set; get; }

        public bool IsCanEdit { set; get; }

        public FolderTypeENUM FolderTypeId { set; get; }

        public RefTypeENUM RefTypeId { set; get; }

        public DateTimeOffset? DeletedAt { set; get; }

        public DateTimeOffset UpdatedAt { set; get; }

        public DateTimeOffset CreatedAt { set; get; }
    }
}
