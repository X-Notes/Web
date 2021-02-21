using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WriteContext.Repositories
{
    public class UserRepository
    {
        private readonly WriteContextDB contextDB;

        public UserRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await contextDB.Users.FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserByEmailWithPersonalization(string email)
        {
            return await contextDB.Users
                .Include(x => x.CurrentBackground)
                .Include(x => x.Language)
                .Include(x => x.FontSize)
                .Include(x => x.Theme)
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithBackgrounds(string email)
        {
            return await contextDB.Users.Include(x => x.Backgrounds).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<List<User>> SearchByEmailAndName(string search, string email) // TODO BAD TOLOWER MAYBE FIX
        {
            return await contextDB.Users
                .Where(x => x.Email.ToLower().Contains(search) || x.Name.ToLower().Contains(search))
                .Where(x => x.Email != email)
                .ToListAsync();
        }

        public async Task<User> GetUserWithLabels(string email)
        {
            return await contextDB.Users.Include(x => x.Labels).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithNotes(string email)
        {
            return await contextDB.Users.Include(x => x.Notes).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithFolders(string email)
        {
            return await contextDB.Users.Include(x => x.Folders).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task Add(User user)
        {
            await contextDB.Users.AddAsync(user);
            await contextDB.SaveChangesAsync();
        }

        public async Task Update(User user)
        {
            contextDB.Users.Update(user);
            await contextDB.SaveChangesAsync();
        }

        public async Task<bool> UpdatePhoto(User user, AppFile file)
        {
            var success = true;
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    await contextDB.Files.AddAsync(file);
                    await contextDB.SaveChangesAsync();

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



        public async Task<bool> IsUserNote(string email, Guid noteId)
        {
            var user  = await contextDB.Users.Include(x => x.Notes).FirstOrDefaultAsync(x => x.Email == email);
            if(user.Notes.Any(x => x.Id == noteId))
            {
                return true;
            }
            return false;
        }

        public async Task<bool> IsUserFolder(string email, Guid folderId)
        {
            var user = await contextDB.Users.Include(x => x.Folders).FirstOrDefaultAsync(x => x.Email == email);
            if (user.Folders.Any(x => x.Id == folderId))
            {
                return true;
            }
            return false;
        }
    }
}
