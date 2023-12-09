using System.Collections.Generic;
using Common.Interfaces.Note;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

namespace Common.DatabaseModels.Models.NoteContent.TextContent
{
    public class TextNote : BaseNoteContent, INoteText
    {
        [Column(TypeName = "jsonb")]
        public string Contents { set; get; }

        public string PlainContent { set; get; }
        
        public TextNoteIndex TextNoteIndex { set; get; }
        
        public TextNote()
        {
            ContentTypeId = ContentTypeENUM.Text;
            var metadata = new TextContentMetadata()
            {
                NoteTextTypeId = NoteTextTypeENUM.Default
            };
            Metadata = DbJsonConverter.Serialize(metadata);
        }

        public TextNote(TextNote text)
        {
            Order = text.Order;

            Contents = text.Contents;
            Metadata = text.Metadata;
            
            ContentTypeId = ContentTypeENUM.Text;
        }

        public void UpdateMetadataNoteTextType(NoteTextTypeENUM noteTextTypeId)
        {
            var metadata = GetMetadata();
            metadata.NoteTextTypeId = noteTextTypeId;
            Metadata = DbJsonConverter.Serialize(metadata);
        }
        
        public void UpdateMetadata(NoteTextTypeENUM noteTextTypeId, HTypeENUM? hTypeId, bool? @checked, int? tabCount)
        {
            var metadata = new TextContentMetadata
            {
                NoteTextTypeId = noteTextTypeId,
                HTypeId = hTypeId,
                Checked = @checked,
                TabCount = tabCount
            };
            Metadata = DbJsonConverter.Serialize(metadata);
        }

        public void UpdateContent(List<TextBlock> contents)
        {
            Contents = contents != null ? DbJsonConverter.Serialize(contents) : null;
        }

        public List<TextBlock> GetContents()
        {
            if (!string.IsNullOrEmpty(Contents))
            {
                return DbJsonConverter.DeserializeObject<List<TextBlock>>(Contents);
            }

            return null;
        }
        
        public TextContentMetadata GetMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<TextContentMetadata>(Metadata);
            }
            
            return null;
        }
        
        public string GetContentString()
        {
            if (Contents == null) return null;
            var texts = GetContents()?.Select(x => x.Text).ToList();
            if (texts == null || !texts.Any())
            {
                return "";
            }
            return string.Join("", texts);
        }
    }
}
