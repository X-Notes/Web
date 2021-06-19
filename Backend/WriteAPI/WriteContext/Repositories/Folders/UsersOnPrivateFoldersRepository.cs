using Common.DatabaseModels.models.Folders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Folders
{
    public class UsersOnPrivateFoldersRepository : Repository<UsersOnPrivateFolders, Guid>
    {
        public UsersOnPrivateFoldersRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

        public async Task<List<UsersOnPrivateFolders>> GetByFolderIdUserOnPrivateFolder(Guid folderId)
        {
            return await context.UsersOnPrivateFolders
                .Include(x => x.User)
                .Include(x => x.AccessType)
                .Where(x => x.FolderId == folderId).ToListAsync();
        }
    }
}
