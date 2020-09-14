using MediatR;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;

namespace Domain.Commands.users
{
    public class UpdatePhotoCommand : BaseCommandEntity, IRequest<JObject>
    {
        public IFormFile File { set; get; }
        public UpdatePhotoCommand(IFormFile File, string Email)
            :base(Email)
        {
            this.File = File;
        }
    }
}
