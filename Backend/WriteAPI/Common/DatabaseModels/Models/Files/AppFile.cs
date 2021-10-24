using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Common.DatabaseModels.Models.History;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Files
{
    [Table(nameof(AppFile), Schema = SchemeConfig.File)]
    public class AppFile : BaseEntity<Guid>
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

        public string TextFromPhoto { set; get; }

        public string RecognizeObject { set; get; }

        public Guid UserId { set; get; }
        public User User { get; set; }

        public AppFileUploadInfo AppFileUploadInfo { set; get; }

        public List<UserProfilePhoto> UserProfilePhotos { set; get; }

        public List<PhotosCollectionNote> PhotosCollectionNotes { set; get; }
        public List<PhotoNoteAppFile> PhotosCollectionNoteAppFiles { set; get; }

        public List<VideosCollectionNote> VideosCollectionNotes { set; get; }
        public List<VideoNoteAppFile> VideosCollectionNoteAppFiles { set; get; }

        public List<AudiosCollectionNote> AudiosCollectionNotes { set; get; }
        public List<AudioNoteAppFile> AudiosCollectionNoteAppFiles { set; get; }

        public List<DocumentsCollectionNote> DocumentsCollectionNotes { set; get; }
        public List<DocumentNoteAppFile> DocumentsCollectionNoteAppFiles { set; get; }

        public List<NoteSnapshot> NoteSnapshots { set; get; }
        public List<SnapshotFileContent> SnapshotFileContents { set; get; }

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
    }
}
