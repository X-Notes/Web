﻿using Common.CQRS;
using Common.DTO;
using MediatR;
using Microsoft.AspNetCore.Http;
using Users.Entities;

namespace Users.Commands
{
    public class UpdatePhotoCommand : BaseCommandEntity, IRequest<OperationResult<AnswerChangeUserPhoto>>
    {
        public IFormFile File { set; get; }

        public UpdatePhotoCommand(IFormFile file, Guid userId)
            : base(userId)
        {
            File = file;
        }
    }
}
