using Common.DTO.Users;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Domain.Commands.Users
{
    public class UpdatePhotoCommand : BaseCommandEntity, IRequest<AnswerChangeUserPhoto>
    {
        public IFormFile File { set; get; }
        public UpdatePhotoCommand(IFormFile File, string Email)
            :base(Email)
        {
            this.File = File;
        }
    }
}
