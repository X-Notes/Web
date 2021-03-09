using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class FolderRepository : Repository<Folder>
    {
        public FolderRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }


        public async Task Add(Folder folder, Guid TypeId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var folders = await GetFoldersByUserIdAndTypeId(folder.UserId, TypeId);

                    if (folders.Count() > 0)
                    {
                        folders.ForEach(x => x.Order = x.Order + 1);
                        await UpdateRange(folders);
                    }

                    await context.Folders.AddAsync(folder);
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }
        public async Task CastFolders(List<Folder> foldersForCasting, List<Folder> allUserFolders, Guid FromId, Guid ToId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var foldersTo = allUserFolders.Where(x => x.FolderTypeId == ToId).ToList();
                    foldersTo.ForEach(x => x.Order = x.Order + foldersForCasting.Count());
                    await UpdateRange(foldersTo);

                    foldersForCasting.ForEach(x => x.FolderTypeId = ToId);
                    ChangeOrderHelper(foldersForCasting);
                    await UpdateRange(foldersForCasting);

                    var oldFolders = allUserFolders.Where(x => x.FolderTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldFolders);
                    await UpdateRange(oldFolders);

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
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    this.context.Folders.RemoveRange(selectdeletefolders);
                    await context.SaveChangesAsync();

                    foreach (var item in selectdeletefolders)
                    {
                        deletedfolders.Remove(item);
                    }

                    deletedfolders = deletedfolders.OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(deletedfolders);
                    await UpdateRange(deletedfolders);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task<List<Folder>> CopyFolders(List<Folder> foldersForCopy, List<Folder> allUserFolders, Guid FromId, Guid ToId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var foldersTo = allUserFolders.Where(x => x.FolderTypeId == ToId).ToList();
                    foldersTo.ForEach(x => x.Order = x.Order + foldersForCopy.Count());
                    await UpdateRange(foldersTo);

                    var newFolders = foldersForCopy.Select(x => new Folder()
                    {
                        Color = x.Color,
                        CreatedAt = DateTimeOffset.Now,
                        FolderTypeId = ToId,
                        Title = x.Title,
                        UserId = x.UserId,
                        RefTypeId = x.RefTypeId
                    }).ToList();
                    ChangeOrderHelper(newFolders);
                    await AddRange(newFolders);

                    var oldFolders = allUserFolders.Where(x => x.FolderTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldFolders);
                    await UpdateRange(oldFolders);

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


        public async Task<Folder> GetForUpdateTitle(Guid id)
        {
            return await context.Folders
                .Include(x => x.FolderType)
                .Include(x => x.RefType)
                .Include(x => x.UsersOnPrivateFolders)
                .ThenInclude(x => x.AccessType)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Folder> GetFull(Guid id)
        {
            return await context.Folders
                .Include(folder => folder.FoldersNotes)
                .Include(folder => folder.UsersOnPrivateFolders)
                .Include(x => x.FolderType)
                .Include(x => x.RefType)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Folder>> GetFoldersByUserIdAndTypeId(Guid userId, Guid typeId)
        {
            return await context.Folders
                .Include(x => x.RefType)
                .Include(x => x.FolderType)
                .Where(x => x.UserId == userId && x.FolderTypeId == typeId).ToListAsync();
        }

        public async Task<Folder> GetOneById(Guid folderId)
        {
            return await context.Folders.Include(x => x.RefType).FirstOrDefaultAsync(x => x.Id == folderId);
        }

    }
}
