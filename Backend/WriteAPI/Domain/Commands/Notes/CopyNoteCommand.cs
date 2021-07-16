using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using MediatR;

namespace Domain.Commands.Notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<List<Guid>>
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
