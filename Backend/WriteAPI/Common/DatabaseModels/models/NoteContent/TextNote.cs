using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Common.DatabaseModels.models.NoteContent
{
    [Table("TextNote")]
    public class TextNote: BaseNoteContent
    {
        public string Content { set; get; }
        [Required]
        public string TextType { set; get; }
        public string HeadingType { set; get; }
        public bool Checked { set; get; }
    }
}
