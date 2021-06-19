using Common.DatabaseModels.models.Files;
using System;
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
