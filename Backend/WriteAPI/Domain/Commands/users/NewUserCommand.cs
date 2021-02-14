using Common.DatabaseModels.helpers;
using MediatR;


namespace Domain.Commands.users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Name { set; get; }
        public string PhotoId { set; get; }
        public Language Language { set; get; }
    }
}
