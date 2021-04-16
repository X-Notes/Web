﻿using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories
{
    public class FoldersNotesRepository : Repository<FoldersNotes>
    {
        public FoldersNotesRepository(WriteContextDB contextDB)
        : base(contextDB)
        {
        }

        public async Task<List<FoldersNotes>> GetOrderedByFolderIdWithNotes(Guid folderId)
        {
            return await entities.Where(x => x.FolderId == folderId)
                .Include(x => x.Note)
                .OrderBy(x => x.Order).ToListAsync();
        }

        public async Task<List<FoldersNotes>> GetOrderedByFolderId(Guid folderId)
        {
            return await entities.Where(x => x.FolderId == folderId).OrderBy(x => x.Order).ToListAsync();
        }

        public async Task<List<FoldersNotes>> GetOrderedByFolderIdAndNotesId(Guid folderId, List<Guid> notesIds)
        {
            return await entities.Where(x => x.FolderId == folderId && notesIds.Contains(x.NoteId)).OrderBy(x => x.Order).ToListAsync();
        }

    }
}
