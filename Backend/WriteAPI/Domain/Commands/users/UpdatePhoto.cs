using MediatR;
using Microsoft.AspNetCore.Http;


namespace Domain.Commands.users
{
    public class UpdatePhoto : BaseCommandEntity, IRequest<Unit>
    {
        public IFormFile File { set; get; }
        public UpdatePhoto(IFormFile File, string Email)
            :base(Email)
        {
            this.File = File;
        }
    }
}
