using Noots.Domain.Elastic;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Noots.BusinessLogic.Interfaces
{
    public interface INootService
    {
        Task<IEnumerable<ElasticNoot>> GetAllNoots();
    }
}
