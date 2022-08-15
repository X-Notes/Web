using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Users;
using Common.Interfaces;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFile), Schema = SchemeConfig.File)]
    public class AppFile : BaseEntity<Guid>, IDateCreator
    {
        public string PathPhotoSmall { set; get; }
        public string PathPhotoMedium { set; get; }
        public string PathPhotoBig { set; get; }

        public string Name { set; get; }
        public long Size { set; get; }

        public string PathNonPhotoContent { set; get; }
        public string ContentType { set; get; }

        public FileTypeEnum FileTypeId { set; get; }
        public FileType FileType { set; get; }

        [Column(TypeName = "jsonb")]
        public AppFileMetaData MetaData { set; get; }

        public Guid UserId { set; get; }
        public User User { get; set; }

        public AppFileUploadInfo AppFileUploadInfo { set; get; }

        public List<UserProfilePhoto> UserProfilePhotos { set; get; }

        public List<CollectionNote> PhotosCollectionNotes { set; get; }
        public List<CollectionNoteAppFile> PhotosCollectionNoteAppFiles { set; get; }

        public List<NoteSnapshot> NoteSnapshots { set; get; }
        public List<SnapshotFileContent> SnapshotFileContents { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public AppFile()
        {

        }

        // FOR NO PHOTOS TYPES
        public AppFile(string pathNonPhotoContent, string type, long size, FileTypeEnum fileTypeId, Guid userId, string name)
        {
            PathNonPhotoContent = pathNonPhotoContent;
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
            Name = name;
            CreatedAt = DateTimeProvider.Time;

            AppFileUploadInfo = new AppFileUploadInfo().SetUnLinked();
        }


        // FOR PHOTOS
        public AppFile(string pathPhotoSmall, string pathPhotoMedium, string pathPhotoBig, 
            string type, long size, FileTypeEnum fileTypeId, Guid userId, string name)
        {
            PathPhotoSmall = pathPhotoSmall;
            PathPhotoMedium = pathPhotoMedium;
            PathPhotoBig = pathPhotoBig;
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
            Name = name;
            CreatedAt = DateTimeProvider.Time;

            AppFileUploadInfo = new AppFileUploadInfo().SetUnLinked();
        }

        // FOR NO PHOTOS TYPES
        public AppFile(string pathNoPhotoContent, AppFile appFile, Guid userId)
        {
            PathNonPhotoContent = pathNoPhotoContent;
            ContentType = appFile.ContentType;
            Size = appFile.Size;
            FileTypeId = appFile.FileTypeId;
            UserId = userId;
            Name = appFile.Name;
            CreatedAt = DateTimeProvider.Time;

            AppFileUploadInfo = new AppFileUploadInfo().SetUnLinked();
        }

        // FOR PHOTOS
        public AppFile(string pathPhotoSmall, string pathPhotoMedium, string pathPhotoBig, AppFile appFile, Guid userId)
        {
            PathPhotoSmall = pathPhotoSmall;
            PathPhotoMedium = pathPhotoMedium;
            PathPhotoBig = pathPhotoBig;
            ContentType = appFile.ContentType;
            Size = appFile.Size;
            FileTypeId = appFile.FileTypeId;
            UserId = userId;
            Name = appFile.Name;
            CreatedAt = DateTimeProvider.Time;

            AppFileUploadInfo = new AppFileUploadInfo().SetUnLinked();
        }

        public string GetFromSmallPath
        { 
            get
            {
                return PathPhotoSmall ?? PathPhotoMedium ?? PathPhotoBig;
            } 
        }

        public string GetFromBigPath
        {
            get
            {
                return PathPhotoBig ?? PathPhotoMedium ?? PathPhotoSmall;
            }
        }

        public List<string> GetNotNullPathes()
        {
            var result = new List<string>();
            if (!string.IsNullOrEmpty(PathPhotoSmall))
            {
                result.Add(PathPhotoSmall);
            }
            if (!string.IsNullOrEmpty(PathPhotoMedium))
            {
                result.Add(PathPhotoMedium);
            }
            if (!string.IsNullOrEmpty(PathPhotoBig))
            {
                result.Add(PathPhotoBig);
            }
            if (!string.IsNullOrEmpty(PathNonPhotoContent))
            {
                result.Add(PathNonPhotoContent);
            }
            return result;
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

        public void SetAuthorPath(Func<Guid, string, string> setFieldAction, Guid authorId)
        {
            PathNonPhotoContent = setFieldAction(authorId, PathNonPhotoContent);

            PathPhotoSmall = setFieldAction(authorId, PathPhotoSmall);
            PathPhotoMedium = setFieldAction(authorId, PathPhotoMedium);
            PathPhotoBig = setFieldAction(authorId, PathPhotoBig);
        }
    }
}
