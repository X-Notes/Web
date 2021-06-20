using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.users
{
    public class OnlineUserOnNote
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
