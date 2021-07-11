using System;
using System.Collections.Generic;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Users;

namespace Common.DatabaseModels.Models.Files
{
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

        public List<UserProfilePhoto> UserProfilePhotos { set; get; }

        public List<AlbumNote> AlbumNotes { set; get; }
        public List<AlbumNoteAppFile> AlbumNoteAppFiles { set; get; }

        public List<VideoNote> VideoNotes { set; get; }

        public List<AudiosPlaylistNote> AudioNotes { set; get; }
        public List<AudioNoteAppFile> AudioNoteAppFiles { set; get; }

        public List<DocumentNote> DocumentNotes { set; get; }

        public AppFile()
        {

        }

        public AppFile(string pathNonPhotoContent, string type, long size, FileTypeEnum fileTypeId, Guid userId, string name)
        {
            PathNonPhotoContent = pathNonPhotoContent;
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
            Name = name;
        }

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
        }

        public AppFile(string pathNoPhotoContent, AppFile appFile, Guid userId)
        {
            PathNonPhotoContent = pathNoPhotoContent;
            ContentType = appFile.ContentType;
            Size = appFile.Size;
            FileTypeId = appFile.FileTypeId;
            UserId = userId;
            Name = appFile.Name;
        }

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
