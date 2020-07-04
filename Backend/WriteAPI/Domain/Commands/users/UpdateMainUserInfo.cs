using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class UpdateMainUserInfo : IRequest<string>
    {
        public string Name { set; get; }
    }
}
