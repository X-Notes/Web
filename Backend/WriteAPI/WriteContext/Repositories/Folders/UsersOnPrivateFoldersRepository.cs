using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Folders;
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
                .Where(x => x.FolderId == folderId).ToListAsync();
        }
    }
}
