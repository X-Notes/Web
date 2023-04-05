using System;
using System.Collections.Generic;

namespace Common.DTO.Users
{
    public class OnlineUserOnNote
    {
        public List<Guid> UserIdentifiers { set; get; }

        public Guid UserId { set; get; }

        public string Name { set; get; }

        public Guid? PhotoId { set; get; }

        public string PhotoPath { set; get; }
    }
}
