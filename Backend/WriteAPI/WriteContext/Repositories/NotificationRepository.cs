﻿using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class NotificationRepository : Repository<Notification>
    {
        public NotificationRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task<List<Notification>> GetByUserOrdered(Guid userId)
        {
            return await entities
                .Include(x => x.UserFrom)
                .Where(x => x.UserToId == userId)
                .OrderByDescending(x => x.Date).ToListAsync();
        }
    }
}