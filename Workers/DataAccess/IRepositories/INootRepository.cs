using Domain.Mongo;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.IRepositories
{
    public interface INootRepository
    {
        Task<MongoNoot> Add(MongoNoot noot);
    }
}
