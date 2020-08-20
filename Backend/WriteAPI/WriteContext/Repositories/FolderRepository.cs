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

        public async Task AddRange(List<Folder> list)
        {
            contextDB.Folders.AddRange(list);
            await contextDB.SaveChangesAsync();
        }

        public async Task UpdateFolder(Folder folder)
        {
            this.contextDB.Folders.Update(folder);
            await contextDB.SaveChangesAsync();
        }
        public async Task UpdateRangeFolders(List<Folder> folders)
        {
            this.contextDB.Folders.UpdateRange(folders);
            await contextDB.SaveChangesAsync();
        }

        public async Task Add(Folder folder)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var notes = await GetPrivateFoldersByUserId(folder.UserId);

                    if (notes.Count() > 0)
                    {
                        notes.ForEach(x => x.Order = x.Order + 1);
                        await UpdateRangeFolders(notes);
                    }

                    await contextDB.Folders.AddAsync(folder);
                    await contextDB.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }
        public async Task CastFolders(List<Folder> foldersForCasting, List<Folder> allUserFolders, FoldersType folderTypeFrom, FoldersType folderTypeTo)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var foldersTo = allUserFolders.Where(x => x.FolderType == folderTypeTo).ToList();
                    foldersTo.ForEach(x => x.Order = x.Order + foldersForCasting.Count());
                    await UpdateRangeFolders(foldersTo);

                    foldersForCasting.ForEach(x => x.FolderType = folderTypeTo);
                    ChangeOrderHelper(foldersForCasting);
                    await UpdateRangeFolders(foldersForCasting);

                    var oldFolders = allUserFolders.Where(x => x.FolderType == folderTypeFrom).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldFolders);
                    await UpdateRangeFolders(oldFolders);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        private void ChangeOrderHelper(List<Folder> notes)
        {
            int order = 1;
            foreach (var item in notes)
            {
                item.Order = order;
                order++;
            }
        }

        public async Task DeleteRangeDeleted(List<Folder> selectdeletefolders, List<Folder> deletedfolders)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    this.contextDB.Folders.RemoveRange(selectdeletefolders);
                    await contextDB.SaveChangesAsync();

                    foreach (var item in selectdeletefolders)
                    {
                        deletedfolders.Remove(item);
                    }

                    deletedfolders = deletedfolders.OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(deletedfolders);
                    await UpdateRangeFolders(deletedfolders);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task<List<Folder>> CopyFolders(List<Folder> foldersForCopy, List<Folder> allUserFolders, FoldersType folderTypeFrom, FoldersType folderTypeTo)
        {
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var foldersTo = allUserFolders.Where(x => x.FolderType == folderTypeTo).ToList();
                    foldersTo.ForEach(x => x.Order = x.Order + foldersForCopy.Count());
                    await UpdateRangeFolders(foldersTo);

                    var newFolders = foldersForCopy.Select(x => new Folder()
                    {
                        Color = x.Color,
                        CreatedAt = DateTimeOffset.Now,
                        FolderType = folderTypeTo,
                        Title = x.Title,
                        UserId = x.UserId
                    }).ToList();
                    ChangeOrderHelper(newFolders);
                    await AddRange(newFolders);

                    var oldFolders = allUserFolders.Where(x => x.FolderType == folderTypeFrom).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldFolders);
                    await UpdateRangeFolders(oldFolders);

                    await transaction.CommitAsync();

                    return newFolders.OrderBy(x => x.Order).ToList();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    throw new Exception();
                }

            }
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
