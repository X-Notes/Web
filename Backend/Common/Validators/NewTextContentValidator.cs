using System.Collections.Generic;
using System.Linq;
using Common.DTO.Notes.FullNoteContent.Text;
using Common.DTO.Notes.FullNoteSyncContents;
using FluentValidation;

namespace Common.Validators;

public class NewTextContentValidator : AbstractValidator<NewTextContent>
{
    public NewTextContentValidator()
    {
        RuleFor(textDiff => textDiff.Contents)
            .Must(BeLessThanNCharacters)
            .WithMessage("The total length of all text blocks must be less than 10000 characters.");
    }

    private bool BeLessThanNCharacters(List<TextBlockDto> contents)
    {
        var totalLength = contents?.Sum(block => block.Text?.Length ?? 0) ?? 0;
        return totalLength < 12000;
    }
}