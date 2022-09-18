using Common.DatabaseModels.Models.Files;
using System;

namespace Common.DTO.Files
{
    public class FileDTO
    {
        public Guid Id { set; get; }

        public string StorageUrl { set; get; }

        public string PathPrefix { set; get; }

        public string PathFileId { set; get; }

        public PathFileSuffixes PathSuffixes { set; get; }

        public string Name { set; get; }

        public AppFileMetaData MetaData { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public FileDTO(
            Guid id, 
            string storageUrl, string pathPrefix, string pathFileId, PathFileSuffixes pathSuffixes, 
            string name, Guid authorId, AppFileMetaData metaData, DateTimeOffset createdAt)
        {
            Id = id;

            StorageUrl = storageUrl;

            PathPrefix = pathPrefix;
            PathFileId = pathFileId;
            PathSuffixes = pathSuffixes;

            AuthorId = authorId;
            CreatedAt = createdAt;

            Name = name;
            MetaData = metaData;
        }
    }
}
