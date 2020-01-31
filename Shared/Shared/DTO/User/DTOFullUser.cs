using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.DTO.User
{
    public class DTOFullUser
    {
        public string Name { set; get; }
        public string Email { set; get; }
        public string Photo { set; get; }
        public string[] Backgrounds { set; get; }
    }
}
