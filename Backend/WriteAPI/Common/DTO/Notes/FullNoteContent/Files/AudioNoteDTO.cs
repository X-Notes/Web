using System;

namespace Common.DTO.Notes.FullNoteContent.Files
{
    public class AudioNoteDTO : BaseFileNoteDTO
    {
        public string AudioPath { set; get; }

        public int? SecondsDuration { set; get; }

        public string PathToImage { set; get; }

        public AudioNoteDTO(string name, Guid fileId, string audioPath, Guid userId, int? secondsDuration, string pathToImage, DateTimeOffset uploadAt)
        {
            FileId = fileId;
            Name = name;
            AudioPath = audioPath;
            AuthorId = userId;
            UploadAt = uploadAt;
            SecondsDuration = secondsDuration;
            PathToImage = pathToImage;
        }
    }
}
