using System;
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

        public TextNote(string Content, string TextType, int Order)
        {
            this.Content = Content;
            this.TextType = TextType;
            this.Order = Order;
        }

        public TextNote(string TextType, int Order)
        {
            this.TextType = TextType;
            this.Order = Order;
        }
        public TextNote(string TextType, int Order, Guid NoteId)
        {
            this.TextType = TextType;
            this.Order = Order;
            this.NoteId = NoteId;
        }

    }
}
