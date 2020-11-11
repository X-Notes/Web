using Common.DatabaseModels.helpers;
using Common.DTO.notes;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.notes
{
    public class CopyNoteCommand : BaseCommandEntity, IRequest<List<SmallNote>>
    {
        public List<string> Ids { set; get; }
        public CopyNoteCommand(string email) : base(email)
        {

        }
    }
}
