using MediatR;
using Microsoft.AspNetCore.Http;


namespace Domain.Commands.users
{
    public class UpdatePhotoCommand : BaseCommandEntity, IRequest<Unit>
    {
        public IFormFile File { set; get; }
        public UpdatePhotoCommand(IFormFile File, string Email)
            :base(Email)
        {
            this.File = File;
        }
    }
}
