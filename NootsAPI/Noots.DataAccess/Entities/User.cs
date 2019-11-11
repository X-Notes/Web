using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.DataAccess.Entities
{
    public class User
    {
        public int Id { set; get; }
        public string Name { set; get;}
        public string Email { set; get; }
        public string PhotoId { set; get; }
    }
}
