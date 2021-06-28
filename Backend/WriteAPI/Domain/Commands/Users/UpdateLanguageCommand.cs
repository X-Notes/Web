using Common.Attributes;
using Common.DatabaseModels.Models.Systems;
using MediatR;

namespace Domain.Commands.Users
{
    public class UpdateLanguageCommand : BaseCommandEntity, IRequest<Unit>
    {
        [RequiredEnumField(ErrorMessage = "Language Id is required.")]
        public LanguageENUM Id { set; get; }

        public UpdateLanguageCommand(LanguageENUM Id, string Email)
            :base(Email)
        {
            this.Id = Id;
        }
    }
}
