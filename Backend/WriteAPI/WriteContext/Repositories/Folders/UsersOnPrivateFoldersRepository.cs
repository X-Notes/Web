using Common.DatabaseModels.models.Folders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.Repositories.Folders
{
    public class UsersOnPrivateFoldersRepository
    {
        private readonly WriteContextDB contextDB;
        public UsersOnPrivateFoldersRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task Add(UsersOnPrivateFolders userOnNote)
        {
            await contextDB.UsersOnPrivateFolders.AddAsync(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task AddRange(List<UsersOnPrivateFolders> permissions)
        {
            await contextDB.UsersOnPrivateFolders.AddRangeAsync(permissions);
            await contextDB.SaveChangesAsync();
        }

        public async Task<UsersOnPrivateFolders> GetById(Guid userId, Guid folderId)
        {
            return await contextDB.UsersOnPrivateFolders.FirstOrDefaultAsync(x => x.FolderId == folderId && x.UserId == userId);
        }


        public async Task Update(UsersOnPrivateFolders userOnNote)
        {
            contextDB.UsersOnPrivateFolders.Update(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task Remove(UsersOnPrivateFolders userOnNote)
        {
            contextDB.UsersOnPrivateFolders.Remove(userOnNote);
            await contextDB.SaveChangesAsync();
        }

        public async Task<List<UsersOnPrivateFolders>> GetByFolderIdUserOnPrivateFolder(Guid folderId)
        {
            return await contextDB.UsersOnPrivateFolders
                .Include(x => x.User)
                .Include(x => x.AccessType)
                .Where(x => x.FolderId == folderId).ToListAsync();
        }
    }
}
