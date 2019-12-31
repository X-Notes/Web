using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.BusinessLogic.Interfaces
{
    public interface IQueueService
    {
        bool PostValue(string value);
    }
}
