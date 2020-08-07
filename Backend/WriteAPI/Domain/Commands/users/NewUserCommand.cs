using Common;
using Common.DatabaseModels.helpers;
using Domain.Models;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands.users
{
    public class NewUserCommand : BaseCommandEntity, IRequest<Unit>
    {
        public string Name { set; get; }
        public string PhotoId { set; get; }
        public Language Language { set; get; }
    }
}
