using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels
{
    public class BaseEntity
    {
        public virtual Guid Id { set; get; }
    }
}
