using System;

namespace Common.DTO.Users
{
    public class UserNoteHistory
    {
        public Guid Id { set; get; }
        public string PhotoPath { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }

        public UserNoteHistory()
        {

        }

    }
}
