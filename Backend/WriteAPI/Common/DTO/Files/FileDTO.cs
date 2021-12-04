using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.Files
{
    public class FileDTO
    {
        public Guid Id { set; get; }

        public string PathPhotoSmall { set; get; }

        public string PathPhotoMedium { set; get; }

        public string PathPhotoBig { set; get; }

        public string PathNonPhotoContent { set; get; }

        public string Name { set; get; }

        public Guid AuthorId { set; get; }

        public DateTimeOffset CreatedAt { set; get; }

        public FileDTO(Guid id, string pathPhotoSmall, string pathPhotoMedium, string pathPhotoBig, string pathNonPhotoContent, string name, Guid authorId, DateTimeOffset createdAt)
        {
            Id = id;
            PathPhotoSmall = pathPhotoSmall;
            PathPhotoMedium = pathPhotoMedium;
            PathPhotoBig = pathPhotoBig;
            PathNonPhotoContent = pathNonPhotoContent;
            AuthorId = authorId;
            CreatedAt = createdAt;
            Name = name;
        }
    }
}
