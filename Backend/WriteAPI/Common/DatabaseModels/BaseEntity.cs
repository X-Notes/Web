using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels
{
    public class BaseEntity<T>
    {
        public virtual T Id { set; get; }
    }
}
