using Domain.Commands;
using MediatR;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services
{
    public class UserHandler : 
        IRequestHandler<NewUser, string>,
        IRequestHandler<UpdateMainUserInfo, string>
    {
        private readonly UserRepository userRepository;

        public UserHandler(UserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public Task<string> Handle(NewUser request, CancellationToken cancellationToken)
        {
            throw new Exception();
        }

        public Task<string> Handle(UpdateMainUserInfo request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
