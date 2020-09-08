using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
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
                .Include(x => x.PersonalitionSettings).FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserWithBackgrounds(string email)
        {
            return await contextDB.Users.Include(x => x.Backgrounds).FirstOrDefaultAsync(x => x.Email == email);
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
    }
}
