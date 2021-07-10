using System;

namespace Common.DTO.Users
{
    public class AnswerChangeUserPhoto
    {
        public bool Success { set; get; }
        public Guid Id { set; get; }
        public string PhotoPath { set; get; }
    }
}
