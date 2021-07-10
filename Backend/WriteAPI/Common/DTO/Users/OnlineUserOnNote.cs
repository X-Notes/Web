using System;

namespace Common.DTO.Users
{
    public class OnlineUserOnNote
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
