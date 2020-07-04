using MediatR;


namespace Domain.Commands.users
{
    public class UpdateMainUserInfo : BaseCommandEntity, IRequest<Unit>
    {
        public string Name { set; get; }
    }
}
