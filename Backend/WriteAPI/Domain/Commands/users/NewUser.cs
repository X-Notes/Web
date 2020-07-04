using Common;
using Domain.Models;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;
using WriteContext.helpers;

namespace Domain.Commands
{
    public class NewUser : IRequest<Unit>
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public Language Language { set; get; }
    }
}
