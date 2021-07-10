﻿using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.History;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Histories
{
    public class NoteHistoryRepository : Repository<NoteHistory, Guid>
    {
        public NoteHistoryRepository(WriteContextDB contextDB)
        : base(contextDB)
        {

        }


        public async Task<List<NoteHistory>> GetNoteHistories(Guid noteId)
        {
            return await entities.Where(x => x.NoteId == noteId)
                .Include(x => x.Users)
                .ThenInclude(x => x.UserProfilePhoto)
                .ThenInclude(x => x.AppFile)
                .OrderByDescending(x => x.SnapshotTime).ToListAsync();
        }

    }
}
