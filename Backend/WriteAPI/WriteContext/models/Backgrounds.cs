using System;
using System.Collections.Generic;
using System.Text;

namespace WriteContext.models
{
    public class Backgrounds
    {
        public int Id { set; get; }
        public string Path { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
        public User CurrentUserBackground { set; get; }
    }
}
