using System;
using System.Collections.Generic;
using System.Text;

namespace WriteContext.models
{
    public class Label
    {
        public int Id { set; get; }
        public string Color { set; get; }
        public string Name { set; get; }
        public bool IsDeleted { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
