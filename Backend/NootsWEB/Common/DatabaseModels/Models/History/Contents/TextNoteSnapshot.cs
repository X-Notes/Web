using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using Common.Interfaces.Note;
using System;
using System.Collections.Generic;

namespace Common.DatabaseModels.Models.History.Contents
{
    public class TextNoteSnapshot : BaseNoteContentSnapshot, INoteText
    {
        public string  Contents { set; get; }

        public string PlainContent { set; get; }
        
        public string Metadata { set; get; }
        
        public List<TextBlock> GetContents()
        {
            return DbJsonConverter.DeserializeObject<List<TextBlock>>(Contents);
        }
        
        public TextContentMetadata GetMetadata()
        {
            if (!string.IsNullOrEmpty(Metadata))
            {
                return DbJsonConverter.DeserializeObject<TextContentMetadata>(Metadata);
            }

            return null;
        }
        
        public TextNoteSnapshot(string contents, string textContentMetadata, string plainContent,
            int order, ContentTypeENUM contentTypeId, DateTimeOffset updatedAt) : base(order, contentTypeId, updatedAt)
        {
            Contents = contents;
            Metadata = textContentMetadata;
            PlainContent = plainContent;
        }
    }
}
