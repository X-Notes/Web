using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Commands.notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<List<SmallNote>>
    {
        [Required]
        public List<Guid> Ids { set; get; }
        public bool IsHistory { set; get; }

        public CopyNoteCommand()
        {

        }

        public CopyNoteCommand(string email) : base(email)
        {

        }

        public CopyNoteCommand GetIsHistory(string email, List<Guid> ids)
        {
            return new CopyNoteCommand(email)
            {
                IsHistory = true,
                Ids = ids
            };
        }
    }
}
