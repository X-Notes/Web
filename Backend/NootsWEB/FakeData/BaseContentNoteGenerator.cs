using Bogus;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.NoteContent.TextContent.TextBlockElements;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FakeData;

public class BaseContentNoteGenerator
{
    public List<TextNote> GetContents(int count, Guid noteId)
    {
        var faker = new Faker();
        return Enumerable.Range(0, count).Select(order =>
        {
            NoteTextTypeENUM type = faker.Random.Enum<NoteTextTypeENUM>();
   
            return new TextNote()
            {
                NoteId = noteId,
                ContentTypeId = ContentTypeENUM.Text,
                NoteTextTypeId = type,
                Checked = type == NoteTextTypeENUM.Checklist ? faker.Random.Bool() : null,
                HTypeId = type == NoteTextTypeENUM.Heading ? faker.Random.Enum<HTypeENUM>() : null,
                Order = order,
                Contents = SplitTextIntoSegments(faker),
                Version = 1
            };
        }).ToList();
    }

    public List<TextBlock> SplitTextIntoSegments(Faker faker)
    {
        int minSegmentLength = 20;
        int maxSegmentLength = 100;

        string inputText = faker.Lorem.Paragraphs(5); // Generate random text with 5 paragraphs

        var styles = new List<TextType> { TextType.Italic, TextType.Bold };
        List<TextBlock> textBlocks = new List<TextBlock>();

        // Split the input text into segments of varying lengths
        string[] words = inputText.Split(' ');
        int segmentLength = faker.Random.Int(minSegmentLength, maxSegmentLength);
        string segment = "";
        foreach (var word in words)
        {
            if ((segment + " " + word).Length <= segmentLength)
            {
                segment += " " + word;
            }
            else
            {
                TextBlock textBlock = new TextBlock
                {
                    Text = segment.Trim(),
                    HighlightColor = faker.Commerce.Color(),
                    TextColor = faker.Commerce.Color(),
                    Link = faker.Internet.Url(),
                    TextTypes = faker.Random.ListItems(styles).ToList()
                };

                textBlocks.Add(textBlock);

                segment = word;
                segmentLength = faker.Random.Int(minSegmentLength, maxSegmentLength);
            }
        }

        // Add the last segment
        if (!string.IsNullOrWhiteSpace(segment))
        {
            TextBlock textBlock = new TextBlock
            {
                Text = segment.Trim(),
                HighlightColor = faker.Commerce.Color(),
                TextColor = faker.Commerce.Color(),
                Link = faker.Internet.Url(),
                TextTypes = faker.Random.ListItems(styles).ToList()
            };

            textBlocks.Add(textBlock);
        }

        return textBlocks;
    }
}
