using Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class NewUser
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public Language Language { set; get; }
    }
}
