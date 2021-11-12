﻿using System;
using System.Collections.Generic;
using Common.Attributes;
using MediatR;

namespace Domain.Commands.Notes
{
    public class SetDeleteNoteCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }

        public SetDeleteNoteCommand(string email, List<Guid> ids) : base(email)
        {
            Ids = ids;
        }
    }
}
