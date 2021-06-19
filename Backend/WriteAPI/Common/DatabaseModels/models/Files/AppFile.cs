using Common.DatabaseModels.models.NoteContent;
using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models.Files
{
    public class AppFile : BaseEntity
    {
        public string PathPhotoSmall { set; get; }
        public string PathPhotoMedium { set; get; }
        public string PathPhotoBig { set; get; }

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
        public List<AudioNote> AudioNotes { set; get; }
        public List<DocumentNote> DocumentNotes { set; get; }

        public AppFile()
        {

        }

        public AppFile(string pathNonPhotoContent, string type, long size, FileTypeEnum fileTypeId, Guid userId)
        {
            PathNonPhotoContent = pathNonPhotoContent;
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
        }

        public AppFile(string pathPhotoSmall, string pathPhotoMedium, string pathPhotoBig, string type, long size, FileTypeEnum fileTypeId, Guid userId)
        {
            PathPhotoSmall = pathPhotoSmall;
            PathPhotoMedium = pathPhotoMedium;
            PathPhotoBig = pathPhotoBig;
            ContentType = type;
            Size = size;
            FileTypeId = fileTypeId;
            UserId = userId;
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
