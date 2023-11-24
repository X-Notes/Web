using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Users.Commands
{
    public class UpdateFontSizeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Id is required.")]
        public FontSizeENUM Id { set; get; }

        public UpdateFontSizeCommand(FontSizeENUM Id, Guid userId) : base(userId)
        {
            this.Id = Id;
        }
    }
}
