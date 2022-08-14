using Common.CQRS;
using Common.DTO;
using Common.DTO.Users;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;

namespace Domain.Commands.Users
{
    public class UpdatePhotoCommand : BaseCommandEntity, IRequest<OperationResult<AnswerChangeUserPhoto>>
    {
        public IFormFile File { set; get; }

        public UpdatePhotoCommand(IFormFile file, Guid userId)
            :base(userId)
        {
            this.File = file;
        }
    }
}
