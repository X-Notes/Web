using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using WriteContext.models;

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
        public async Task<User> GetUserWithBackgrounds(string email)
        {
            return await contextDB.Users.Include(x => x.Backgrounds).FirstOrDefaultAsync(x => x.Email == email);
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
