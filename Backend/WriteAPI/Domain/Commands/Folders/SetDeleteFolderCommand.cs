﻿using System;
using System.Collections.Generic;
using Common.Attributes;
using Common.DTO;
using MediatR;

namespace Domain.Commands.Folders
{
    public class SetDeleteFolderCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<Guid> Ids { set; get; }


        public SetDeleteFolderCommand(string email) : base(email)
        {

        }
    }
}
