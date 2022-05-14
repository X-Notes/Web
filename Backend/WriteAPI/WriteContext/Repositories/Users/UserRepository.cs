﻿using Microsoft.EntityFrameworkCore;
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

        public Task<User> GetUserByIdIncludeBilling(Guid id)
        {
            return context.Users
                .Include(x => x.BillingPlan)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<User> GetUserByEmailIncludeBackgroundAndPhoto(Guid userId)
        {
            return context.Users
                .Include(x => x.CurrentBackground)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public Task<User> GetUserWithBackgrounds(Guid userId)
        {
            return context.Users.Include(x => x.Backgrounds).ThenInclude(x => x.File).FirstOrDefaultAsync(x => x.Id == userId);
        }

        public Task<List<User>> SearchByEmailAndName(string search, Guid userId, int? take)
        {
            var query = context.Users
                .Where(x => x.Email.ToLower().Contains(search) || x.Name.ToLower().Contains(search))
                .Where(x => x.Id != userId)
                .Include(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile);
            if (take.HasValue)
            {
                return query.Take(take.Value).ToListAsync();
            }
            return query.ToListAsync();
        }


        public Task<List<string>> GetUsersEmail(IEnumerable<Guid> ids) => entities.Where(x => ids.Contains(x.Id)).Select(x => x.Email).ToListAsync();

        public Task<List<User>> GetUsersWithPhotos(IEnumerable<Guid> ids) => 
             entities.Where(x => ids.Contains(x.Id))
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
