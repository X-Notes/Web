using Common.Attributes;
using Common.CQRS;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Noots.Users.Commands
{
    public class UpdateLanguageCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Language Id is required.")]
        public LanguageENUM Id { set; get; }

        public UpdateLanguageCommand(LanguageENUM Id, Guid userId) : base(userId)
        {
            this.Id = Id;
        }
    }
}
