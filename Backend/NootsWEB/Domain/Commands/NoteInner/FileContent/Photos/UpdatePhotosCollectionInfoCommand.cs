using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.NoteInner.FileContent.Photos
{
    public class UpdatePhotosCollectionInfoCommand : BaseUpdateCollectionInfo
    {
        public UpdatePhotosCollectionInfoCommand(Guid noteId, Guid contentId, string name) : base(noteId, contentId, name)
        {
        }

        [Range(1, 4)]
        public int Count { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Width { set; get; }

        [Required(AllowEmptyStrings = false)]
        public string Height { set; get; }
    }
}
