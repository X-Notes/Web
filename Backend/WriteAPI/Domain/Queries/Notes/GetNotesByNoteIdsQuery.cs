using Common.Attributes;
using Common.DatabaseModels.Models.Notes;
using Common.DTO.Notes;
using Common.DTO.Personalization;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Queries.Notes
{
    public class GetNotesByNoteIdsQuery : BaseQueryEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public List<Guid> NoteIds { set; get; }

        public PersonalizationSettingDTO Settings { set; get; }

        public GetNotesByNoteIdsQuery(string email, List<Guid> noteIds, PersonalizationSettingDTO settings)
            : base(email)
        {
            this.Settings = settings;
            this.NoteIds = noteIds;
        }
    }
}
