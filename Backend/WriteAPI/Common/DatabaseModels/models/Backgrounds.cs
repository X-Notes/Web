
using System;

namespace Common.DatabaseModels.models
{
    public class Backgrounds
    {
        public Guid Id { set; get; }
        public string Path { set; get; }
        public Guid UserId { set; get; }
        public User User { set; get; }
        public User CurrentUserBackground { set; get; }
    }
}
