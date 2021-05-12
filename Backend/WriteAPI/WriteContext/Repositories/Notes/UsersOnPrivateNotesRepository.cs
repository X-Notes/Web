﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Common.DatabaseModels.models.Notes;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Notes
{
    public class UsersOnPrivateNotesRepository : Repository<UserOnPrivateNotes>
    {
        public UsersOnPrivateNotesRepository(WriteContextDB contextDB)
            :base(contextDB)
        {
        }

        public async Task<List<UserOnPrivateNotes>> GetByNoteIdUserOnPrivateNote(Guid noteId)
        {
            return await context.UserOnPrivateNotes
                .Include(x => x.User)
                .Include(x => x.AccessType)
                .Where(x => x.NoteId == noteId).ToListAsync();
        }
    }
}