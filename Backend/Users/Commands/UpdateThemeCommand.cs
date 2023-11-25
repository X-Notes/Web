using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Users.Commands
{
    public class UpdateThemeCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Theme id is required.")]
        public ThemeENUM Id { set; get; }

        public UpdateThemeCommand(ThemeENUM Id, Guid userId)
            : base(userId)
        {
            this.Id = Id;
        }
    }
}
