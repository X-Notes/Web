using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class NewUserCommand
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public string BackgroundId { set; get; }
    }
}
