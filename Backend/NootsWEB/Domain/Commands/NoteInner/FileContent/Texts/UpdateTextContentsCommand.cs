using Common.Attributes;
using Common.CQRS;
using Common.DTO;
using Common.DTO.Notes.FullNoteContent;
using Common.DTO.Notes.FullNoteSyncContents;
using Domain.Commands.NoteInner.FileContent.Texts.Entities;
using MediatR;
using System;
using System.Collections.Generic;

namespace Domain.Commands.NoteInner.FileContent.Texts
{
    public class UpdateTextContentsCommand : BaseCommandEntity, IRequest<OperationResult<List<UpdateBaseContentResult>>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        [RequiredListNotEmptyAttribute]
        public List<TextDiff> Texts { set; get; } = new List<TextDiff>();
    }
}
