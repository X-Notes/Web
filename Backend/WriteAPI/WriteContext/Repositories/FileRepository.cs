using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class FileRepository : Repository<AppFile>
    {
        public FileRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

    }
}
