using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Files;
using Common.DatabaseModels.Models.Users;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    // TODO OPTIMIZATION SQL QUERY
    public class UserRepository : Repository<User, Guid>
    {

        public UserRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task<User> GetUserByIdIncludeBilling(Guid id)
        {
            return await context.Users
                .Include(x => x.BillingPlan)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<User> GetUserByEmailIncludeBackgroundAndPhoto(Guid userId)
        {
            return await context.Users
                .Include(x => x.CurrentBackground)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task<User> GetUserWithBackgrounds(Guid userId)
        {
            return await context.Users.Include(x => x.Backgrounds).ThenInclude(x => x.File).FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task<List<User>> SearchByEmailAndName(string search, Guid userId) // TODO BAD TOLOWER MAYBE FIX
        {
            return await context.Users
                .Where(x => x.Email.ToLower().Contains(search) || x.Name.ToLower().Contains(search))
                .Where(x => x.Id != userId)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .ToListAsync();
        }

        public async Task<User> GetUserWithLabels(Guid userId)
        {
            return await context.Users.Include(x => x.Labels).FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task<User> GetUserWithNotesIncludeNoteType(Guid userId)
        {
            return await context.Users
                .Include(x => x.Notes)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task<User> GetUserWithFoldersIncludeFolderType(Guid userId)
        {
            return await context.Users
                .Include(x => x.Folders)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task<List<string>> GetUsersEmail(IEnumerable<Guid> ids) => await entities.Where(x => ids.Contains(x.Id)).Select(x => x.Email).ToListAsync();

        public async Task<List<User>> GetUsersWithPhotos(IEnumerable<Guid> ids) => 
            await entities.Where(x => ids.Contains(x.Id))
            .Include(x => x.UserProfilePhoto)
            .ThenInclude(x => x.AppFile)
            .ToListAsync();


        public async Task<bool> UpdatePhoto(User user, AppFile file)
        {
            var success = true;
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    await context.Files.AddAsync(file);
                    await context.SaveChangesAsync();

                    await context.UserProfilePhotos.AddAsync(new UserProfilePhoto { AppFileId = file.Id, UserId = user.Id });
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
