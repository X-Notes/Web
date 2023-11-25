using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DatabaseModels.Models.WS;
using Common.Interfaces;

namespace Common.DatabaseModels.Models.Folders
{
    [Table(nameof(Folder), Schema = SchemeConfig.Folder)]
    public class Folder : BaseEntity<Guid>, IDateCreator, IDateUpdater, IDateDeleter
    {
        public int _version;

        public FolderTypeENUM FolderTypeId { set; get; }
        public FolderType FolderType { set; get; }

        public RefTypeENUM RefTypeId { set; get; }
        public RefType RefType { set; get; }

        public string Title { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }

        [Range(1, int.MaxValue)]
        public int Version
        {
            get
            {
                return this._version;
            }
            set
            {
                if (value <= 0) throw new Exception("Value cannot be 0");
                this._version = value;
            }
        }

        public Guid UserId { set; get; }
        public User User { set; get; }


        public List<FoldersNotes> FoldersNotes { set; get; }
        public List<UsersOnPrivateFolders> UsersOnPrivateFolders { set; get; }

        public List<FolderConnection> FolderConnections { set; get; }

        public DateTimeOffset? DeletedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        [NotMapped]
        public List<Guid> NoteIds { set; get; }

        [NotMapped]
        public Guid PrevId { set; get; }

        public void ToType(FolderTypeENUM folderTypeId, DateTimeOffset? deletedAt = null)
        {
            DeletedAt = deletedAt;
            FolderTypeId = folderTypeId;
        }

        public void SetDateAndVersion()
        {
            UpdatedAt = DateTimeProvider.Time;
            Version++;
        }

        public bool IsShared() => FolderTypeId == FolderTypeENUM.Shared;

        public bool ContainsPrivateUsers() => UsersOnPrivateFolders != null && UsersOnPrivateFolders.Count > 0;
    }
}
