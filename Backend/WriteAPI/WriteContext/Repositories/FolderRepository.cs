using Common.DatabaseModels.helpers;
using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class FolderRepository
    {
        private readonly WriteContextDB contextDB;
        public FolderRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }


        public async Task<Folder> GetFull(Guid id)
        {
            return await contextDB.Folders.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Folder>> GetPrivateFoldersByUserId(int userId)
        {
            return await contextDB.Folders
                .Where(x => x.UserId == userId && x.FolderType == FoldersType.Private).ToListAsync();
        }

        public async Task<List<Folder>> GetSharedFoldersByUserId(int userId)
        {
            return await contextDB.Folders
                .Where(x => x.UserId == userId && x.FolderType == FoldersType.Shared).ToListAsync();
        }

        public async Task<List<Folder>> GetArchiveFoldersByUserId(int userId)
        {
            return await contextDB.Folders
                .Where(x => x.UserId == userId && x.FolderType == FoldersType.Archive).ToListAsync();
        }

        public async Task<List<Folder>> GetDeletedFoldersByUserId(int userId)
        {
            return await contextDB.Folders
                .Where(x => x.UserId == userId && x.FolderType == FoldersType.Deleted).ToListAsync();
        }
    }
}
