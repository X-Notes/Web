using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Users;
using Common.DTO.Files;
using Common.Interfaces;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFile), Schema = SchemeConfig.File)]
    public class AppFile : BaseEntity<Guid>, IDateCreator
    {
        public string PathPrefix { set; get; }

        public string PathFileId { set; get; }

        [Column(TypeName = "jsonb")]
        public PathFileSuffixes PathSuffixes { set; get; }

        public string Name { set; get; }
        public long Size { set; get; }

        public string ContentType { set; get; }

        public FileTypeEnum FileTypeId { set; get; }
        public FileType FileType { set; get; }

        [Column(TypeName = "jsonb")]
        public AppFileMetaData MetaData { set; get; }

        public Guid UserId { set; get; }
        public User User { get; set; }

        public StoragesEnum StorageId { set; get; }
        public Storage Storage { get; set; }

        public AppFileUploadInfo AppFileUploadInfo { set; get; }

        public Background Background { set; get; }

        public UserProfilePhoto UserProfilePhoto { set; get; }

        public List<CollectionNote> CollectionNotes { set; get; }

        public List<CollectionNoteAppFile> CollectionNoteAppFiles { set; get; }

        public List<NoteSnapshot> NoteSnapshots { set; get; }

        public List<SnapshotFileContent> SnapshotFileContents { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public DateTimeOffset LostCheckedAt { set; get; }

        public AppFile()
        {

        }

        public AppFile(string type, long size, FileTypeEnum fileTypeId, Guid userId, string name)
        {
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
            Name = name;
            CreatedAt = DateTimeProvider.Time;

            AppFileUploadInfo = new AppFileUploadInfo().SetUnLinked();
        }

        public AppFile InitPathes(StoragesEnum storageId, string prefixFolder, string pathFileId, string _default, string small = null, string medium = null, string large = null)
        {
            PathPrefix = prefixFolder;
            PathFileId = pathFileId;
            StorageId = storageId;

            InitPathSuffixes(_default, small, medium, large);

            return this;
        }

        private AppFile InitPathSuffixes(string _default, string small, string medium, string large)
        {
            PathSuffixes ??= new PathFileSuffixes();
            PathSuffixes.Default = _default;
            PathSuffixes.Small = small;
            PathSuffixes.Medium = medium;
            PathSuffixes.Large = large;

            return this;
        }


        public AppFile InitPathes(StoragesEnum storageId, string prefixFolder, string pathFileId, PathFileSuffixes suffixes)
        {
            PathPrefix = prefixFolder;
            PathFileId = pathFileId;
            StorageId = storageId;

            PathSuffixes = suffixes;

            return this;
        }


        public List<FilePathesDTO> GetNotNullPathes()
        {
            if (PathSuffixes == null) return null;

            string buildPath(string fileName) => PathPrefix + "/" + PathFileId + "/" + fileName;

            return PathSuffixes.GetNotNullPathes().Select(x => new FilePathesDTO { FileName = x, FullPath = buildPath(x) }).ToList();
        }

        public bool IsLinkedSomeWhere()
        {
            if(
                UserProfilePhoto != null || 
                Background != null || 
                (CollectionNoteAppFiles != null && CollectionNoteAppFiles.Any()) ||
                (SnapshotFileContents != null && SnapshotFileContents.Any())
                )
            {
                return true;
            }

            return false;
        }

        public List<Guid> GetAdditionalIds()
        {
           var ids = new List<Guid>(); 
           if (MetaData != null && MetaData.ImageFileId.HasValue)
           {
                ids.Add(MetaData.ImageFileId.Value);
           }
           return ids;
        }

        public IEnumerable<Guid> GetIds()
        {
            var ids = GetAdditionalIds();
            ids.Add(Id);
            return ids;
        }

        [NotMapped]
        public string GetFromSmallPath
        {
            get
            {
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.GetFromSmallPath();
            }
        }

        [NotMapped]
        public string GetFromDefaultPath
        {
            get
            {
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.GetFromDefaultPath();
            }
        }

        [NotMapped]
        public string GetDefaultPath
        {
            get
            {
                if (string.IsNullOrEmpty(PathSuffixes.Default)) return null;
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.Default;
            }
        }

        [NotMapped]
        public string GetSmallPath
        {
            get
            {
                if (string.IsNullOrEmpty(PathSuffixes.Small)) return null;
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.Small;
            }
        }

        [NotMapped]
        public string GetMediumPath
        {
            get
            {
                if (string.IsNullOrEmpty(PathSuffixes.Medium)) return null;
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.Medium;
            }
        }

        [NotMapped]
        public string GetBigPath
        {
            get
            {
                if (string.IsNullOrEmpty(PathSuffixes.Large)) return null;
                return PathPrefix + "/" + PathFileId + "/" + PathSuffixes.Large;
            }
        }

    }
}
