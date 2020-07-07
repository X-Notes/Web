using MediatR;


namespace Domain.Commands.users
{
    public class UpdateMainUserInfoCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Name { set; get; }
    }
}
