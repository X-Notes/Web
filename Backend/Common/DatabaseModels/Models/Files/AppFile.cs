using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using Common.DatabaseModels.Models.Files.Models;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.NoteContent;
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
        public string PathSuffixes { set; get; }

        public string Name { set; get; }
        public long Size { set; get; }

        public string ContentType { set; get; }

        public FileTypeEnum FileTypeId { set; get; }
        public FileType FileType { set; get; }

        [Column(TypeName = "jsonb")]
        public string MetaData { set; get; }

        public Guid UserId { set; get; }
        public User User { get; set; }

        public StoragesEnum StorageId { set; get; }
        public Storage Storage { get; set; }

        public AppFileUploadInfo AppFileUploadInfo { set; get; }

        public Background Background { set; get; }

        public UserProfilePhoto UserProfilePhoto { set; get; }

        public List<BaseNoteContent> BaseNoteContents { set; get; }

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

        public AppFile InitPaths(StoragesEnum storageId, string prefixFolder, string pathFileId, string @default, string small, string medium, string large)
        {
            PathPrefix = prefixFolder;
            PathFileId = pathFileId;
            StorageId = storageId;

            UpdatePathSuffixes(new PathFileSuffixes(small, medium, large, @default));

            return this;
        }
        
        public AppFile InitSuffixes(StoragesEnum storageId, string prefixFolder, string pathFileId, string pathSuffixes)
        {
            PathPrefix = prefixFolder;
            PathFileId = pathFileId;
            StorageId = storageId;

            PathSuffixes = pathSuffixes;

            return this;
        }
        
        public PathFileSuffixes GetPathFileSuffixes()
        {
            if (!string.IsNullOrEmpty(PathSuffixes))
            {
                return DbJsonConverter.DeserializeObject<PathFileSuffixes>(PathSuffixes);
            }

            return new PathFileSuffixes();
        }
        
        public AppFileMetaData GetMetadata()
        {
            if (!string.IsNullOrEmpty(MetaData))
            {
                return DbJsonConverter.DeserializeObject<AppFileMetaData>(MetaData);
            }

            return new AppFileMetaData();
        }
        
        public void UpdateMetadata(AppFileMetaData metadata)
        {
            MetaData = metadata != null ? DbJsonConverter.Serialize(metadata) : null;
        }
        
        public void UpdatePathSuffixes(PathFileSuffixes pathSuffixes)
        {
            PathSuffixes = pathSuffixes != null ? DbJsonConverter.Serialize(pathSuffixes) : null;
        }
        
        public List<FilePathesDTO> GetNotNullPathes()
        {
            if (PathSuffixes == null) return null;

            string buildPath(string fileName) => PathPrefix + "/" + PathFileId + "/" + fileName;

            return GetPathFileSuffixes().GetNotNullPathes().Select(x => new FilePathesDTO { FileName = x, FullPath = buildPath(x) }).ToList();
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
            var metadata = GetMetadata();
            var ids = new List<Guid>(); 
            if (MetaData != null && metadata.ImageFileId.HasValue)
            {
                ids.Add(metadata.ImageFileId.Value);
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
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().GetFromSmallPath();
            }
        }

        [NotMapped]
        public string GetFromDefaultPath
        {
            get
            {
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().GetFromDefaultPath();
            }
        }

        [NotMapped]
        public string GetDefaultPath
        {
            get
            {
                if (string.IsNullOrEmpty(GetPathFileSuffixes().Default)) return null;
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().Default;
            }
        }

        [NotMapped]
        public string GetSmallPath
        {
            get
            {
                if (string.IsNullOrEmpty(GetPathFileSuffixes().Small)) return null;
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().Small;
            }
        }

        [NotMapped]
        public string GetMediumPath
        {
            get
            {
                if (string.IsNullOrEmpty(GetPathFileSuffixes().Medium)) return null;
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().Medium;
            }
        }

        [NotMapped]
        public string GetBigPath
        {
            get
            {
                if (string.IsNullOrEmpty(GetPathFileSuffixes().Large)) return null;
                return PathPrefix + "/" + PathFileId + "/" + GetPathFileSuffixes().Large;
            }
        }

    }
}
