using MediatR;
using Microsoft.AspNetCore.Http;


namespace Domain.Commands.users
{
    public class UpdatePhoto : IRequest<Unit>
    {
        public IFormFile File { set; get; }
        public string Email { set; get; }
        public UpdatePhoto(IFormFile File, string Email)
        {
            this.File = File;
            this.Email = Email;
        }
    }
}
