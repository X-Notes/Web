using Common.DatabaseModels.models.Files;
using Common.DatabaseModels.models.Users;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Users
{
    public class UserRepository : Repository<User>
    {

        public UserRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }


        public async Task<User> GetUserByEmailWithPersonalization(string email)
        {
            return await context.Users
                .Include(x => x.CurrentBackground)
                .Include(x => x.Language)
                .Include(x => x.FontSize)
                .Include(x => x.Theme)
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithBackgrounds(string email)
        {
            return await context.Users.Include(x => x.Backgrounds).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<List<User>> SearchByEmailAndName(string search, string email) // TODO BAD TOLOWER MAYBE FIX
        {
            return await context.Users
                .Where(x => x.Email.ToLower().Contains(search) || x.Name.ToLower().Contains(search))
                .Where(x => x.Email != email)
                .ToListAsync();
        }

        public async Task<User> GetUserWithLabels(string email)
        {
            return await context.Users.Include(x => x.Labels).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithNotes(string email)
        {
            return await context.Users
                .Include(x => x.Notes)
                .ThenInclude(x => x.NoteType)
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithFolders(string email)
        {
            return await context.Users
                .Include(x => x.Folders)
                .ThenInclude(x => x.FolderType)
                .FirstOrDefaultAsync(x => x.Email == email);
        }


        public async Task<bool> UpdatePhoto(User user, AppFile file)
        {
            var success = true;
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    await context.Files.AddAsync(file);
                    await context.SaveChangesAsync();

                    user.PhotoId = file.Id;
                    await Update(user);

                    await transaction.CommitAsync();

                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                    success = false;
                }
            }
            return success;
        }
    }
}
