using System;
using Common.DatabaseModels.Models.Files;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class FileRepository : Repository<AppFile, Guid>
    {
        public FileRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

    }
}
