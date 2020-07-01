using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Ids
{
    public interface IIdGenerator
    {
        Guid New();
    }
}
