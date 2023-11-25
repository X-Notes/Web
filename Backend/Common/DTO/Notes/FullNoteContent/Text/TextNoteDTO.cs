using System;
using System.Collections.Generic;
using System.Linq;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;

namespace Common.DTO.Notes.FullNoteContent.Text
{
    public class TextNoteDto : BaseNoteContentDTO
    {
        public List<TextBlockDto> Contents { set; get; }
        
        public string PlainContent { set; get; }

        public TextContentMetadataDto Metadata { set; get; }
        
        public TextNoteDto(
            List<TextBlock> contents, 
            Guid id, 
            int order,
            TextContentMetadata metadata,
            DateTimeOffset updatedAt,
            int version, string plainContent)
            :base(id, order, ContentTypeEnumDTO.Text, updatedAt, version)
        {
            Contents = contents?.Select(x => new TextBlockDto()
            {
                Text = x.Text,
                HighlightColor = x.HighlightColor,
                TextColor = x.TextColor,
                Link = x.Link,
                TextTypes = x.TextTypes,
            }).ToList();
            PlainContent = plainContent;
            Metadata = MapMetadata(metadata);
        }

        private TextContentMetadataDto MapMetadata(TextContentMetadata metadata)
        {
            if (metadata == null) return null;

            return new TextContentMetadataDto(metadata.NoteTextTypeId, metadata.HTypeId, metadata.Checked, metadata.TabCount);
        }
    }
}
