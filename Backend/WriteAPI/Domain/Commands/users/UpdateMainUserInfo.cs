using MediatR;


namespace Domain.Commands.users
{
    public class UpdateMainUserInfo : IRequest<Unit>
    {
        public string Email { set; get; }
        public string Name { set; get; }
    }
}
