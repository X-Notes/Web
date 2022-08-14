using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.CQRS;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;

namespace Domain.Queries.RelatedNotes
{
    public class GetNotesForPreviewWindowQuery : BaseQueryEntity, IRequest<List<PreviewNoteForSelection>>
    {
        [ValidationGuid]
        public Guid NoteId { set; get; }

        public string Search { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }
    }
}
