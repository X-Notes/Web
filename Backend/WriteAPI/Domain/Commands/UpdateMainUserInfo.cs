using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public class UpdateMainUserInfo
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
    }
}
