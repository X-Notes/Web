using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models
{
    public class Language
    {
        public Guid Id { set; get; }
        public string Name { set; get; }
        public List<User> Users { set; get; }
    }
}
