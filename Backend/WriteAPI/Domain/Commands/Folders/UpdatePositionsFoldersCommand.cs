﻿using Common.Attributes;
using Common.DTO;
using Common.DTO.Notes;
using MediatR;
using System.Collections.Generic;

namespace Domain.Commands.Folders
{
    public class UpdatePositionsFoldersCommand : BaseCommandEntity, IRequest<OperationResult<Unit>>
    {
        [RequiredListNotEmptyAttribute]
        public List<EntityPositionDTO> Positions { set; get; }
    }
}