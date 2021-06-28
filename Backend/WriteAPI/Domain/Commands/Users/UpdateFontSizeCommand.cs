using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Users
{
    public class UpdateFontSizeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Id is required.")]
        public FontSizeENUM Id { set; get; }
        public UpdateFontSizeCommand(FontSizeENUM Id, string Email) : base(Email)
        {
            this.Id = Id;
        }
    }
}
