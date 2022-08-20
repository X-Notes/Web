using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Common.Attributes;
using Common.DTO;
using Common.CQRS;

namespace Domain.Queries.Notes
{
    public class GetNotesByNoteIdsQuery : BaseQueryEntity, IRequest<OperationResult<List<SmallNote>>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> NoteIds { set; get; }

        [Required]
        public PersonalizationSettingDTO Settings { set; get; }

        public GetNotesByNoteIdsQuery(Guid userId, List<Guid> noteIds, PersonalizationSettingDTO settings)
            : base(userId)
        {
            this.Settings = settings;
            this.NoteIds = noteIds;
        }
    }
}
