using Common.DatabaseModels.models.Folders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Folders
{
    public class FolderRepository : Repository<Folder, Guid>
    {
        public FolderRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }


        public async Task Add(Folder folder, FolderTypeENUM TypeId)
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
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                }
            }
        }
        public async Task CastFolders(List<Folder> foldersForCasting, List<Folder> allUserFolders, FolderTypeENUM FromId, FolderTypeENUM ToId)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var foldersTo = allUserFolders.Where(x => x.FolderTypeId == ToId).ToList();
                    foldersTo.ForEach(x => x.Order = x.Order + foldersForCasting.Count());
                    await UpdateRange(foldersTo);

                    foldersForCasting.ForEach(x =>
                    {
                        x.FolderTypeId = ToId;
                        x.UpdatedAt = DateTimeOffset.Now;
                    });

                    ChangeOrderHelper(foldersForCasting);
                    await UpdateRange(foldersForCasting);

                    var oldFolders = allUserFolders.Where(x => x.FolderTypeId == FromId).OrderBy(x => x.Order).ToList();
                    ChangeOrderHelper(oldFolders);
                    await UpdateRange(oldFolders);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
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
                    context.Folders.RemoveRange(selectdeletefolders);
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
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                }
            }
        }


        public async Task<Folder> GetForUpdateTitle(Guid id)
        {
            return await context.Folders
                .Include(x => x.UsersOnPrivateFolders)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Folder> GetFull(Guid id)
        {
            return await context.Folders
                .Include(folder => folder.FoldersNotes)
                .Include(folder => folder.UsersOnPrivateFolders)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Folder>> GetFoldersByUserIdAndTypeId(Guid userId, FolderTypeENUM typeId)
        {
            return await context.Folders
                .Where(x => x.UserId == userId && x.FolderTypeId == typeId).ToListAsync();
        }

        public async Task<Folder> GetFolderByIdForCopy(Guid id)
        {
            return await context.Folders
                .Include(x => x.FoldersNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Folder>> GetFoldersByUserIdAndTypeIdNotesInclude(Guid userId, FolderTypeENUM typeId)
        {
            return await context.Folders
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .OrderBy(x => x.Order)
                .Where(x => x.UserId == userId && x.FolderTypeId == typeId).ToListAsync();
        }

        public async Task<List<Folder>> GetFoldersByUserIdAndTypeIdNotesInclude(IEnumerable<Guid> folderIds)
        {
            return await context.Folders
                .Include(x => x.FoldersNotes)
                .ThenInclude(x => x.Note)
                .OrderBy(x => x.Order)
                .Where(x => folderIds.Contains(x.Id)).ToListAsync();
        }

        public async Task<Folder> GetOneById(Guid folderId)
        {
            return await context.Folders.FirstOrDefaultAsync(x => x.Id == folderId);
        }

    }
}
