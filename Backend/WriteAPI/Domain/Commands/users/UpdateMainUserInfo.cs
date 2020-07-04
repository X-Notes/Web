using Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class UpdateMainUserInfo : IRequest<Unit>
    {
        public string Email { set; get; }
        public string Name { set; get; }
    }
}
