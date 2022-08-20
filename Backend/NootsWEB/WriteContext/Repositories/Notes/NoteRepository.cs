using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent;
using Common.DatabaseModels.Models.Notes;
using WriteContext.GenericRepositories;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Common.DatabaseModels.Models.NoteContent.TextContent;
using Common.DatabaseModels.Models.Files;
using Common.DTO.Personalization;

namespace WriteContext.Repositories.Notes
{
    public class NoteRepository : Repository<Note, Guid>
    {
        public NoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public Task<List<Note>> GetNotesThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.NoteTypeId == NoteTypeENUM.Deleted && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }

        public Task<Note> GetForCheckPermission(Guid id)
        {
            return context.Notes
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public Task<List<Note>> GetForCheckPermissions(List<Guid> ids)
        {
            return context.Notes
                .Include(x => x.User)
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => ids.Contains(x.Id)).ToListAsync();
        }


        public Task<Note> GetNoteWithLabels(Guid id)
        {
            return context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        private List<ContentTypeENUM> GetFilterTypes(PersonalizationSettingDTO settings)
        {
            var types = new List<ContentTypeENUM>();

            if (settings.IsViewTextOnNote)
            {
                types.Add(ContentTypeENUM.Text);
            }

            if (settings.IsViewPhotosOnNote || settings.IsViewVideoOnNote || settings.IsViewAudioOnNote || settings.IsViewDocumentOnNote)
            {
                types.Add(ContentTypeENUM.Collection);
            }

            return types;
        }


        private async Task<List<Note>> GetWithFilteredContent(List<Note> notes, PersonalizationSettingDTO settings)
        {
            settings = settings ?? new PersonalizationSettingDTO().GetDefault();

            var types = GetFilterTypes(settings);

            var notesIds = notes.Select(z => z.Id).ToHashSet();

            var contents = await context.BaseNoteContents
                .Include(z => (z as CollectionNote).Files)
                .Where(z => types.Contains(z.ContentTypeId) && notesIds.Contains(z.NoteId))
                .AsSplitQuery().AsNoTracking().ToListAsync();

            contents = FilterFileContents(contents, settings);
            var contentLookUp = contents.ToLookup(x => x.NoteId);

            notes.ForEach(note =>
            {
                SetListIdIfNeed(contentLookUp[note.Id]);
                var baseContent = contentLookUp[note.Id].Where(x => x.ContentTypeId != ContentTypeENUM.Text || (x.ContentTypeId == ContentTypeENUM.Text && (x as TextNote).Contents?.Count > 0));
                var content = baseContent.OrderBy(z => z.Order).Take(settings.ContentInNoteCount).ToList();
                note.Contents = content;
            });

            return notes;
        }

        private List<BaseNoteContent> FilterFileContents(List<BaseNoteContent> contents, PersonalizationSettingDTO settings)
        {
            var result = new List<BaseNoteContent>();
            foreach(var content in contents)
            {
                if (content.ContentTypeId == ContentTypeENUM.Collection)
                {
                    var fileContent = content as CollectionNote;
                    if (!settings.IsViewAudioOnNote && fileContent.FileTypeId == FileTypeEnum.Audio)
                    {
                        continue;
                    }
                    if (!settings.IsViewDocumentOnNote && fileContent.FileTypeId == FileTypeEnum.Document)
                    {
                        continue;
                    }
                    if (!settings.IsViewPhotosOnNote && fileContent.FileTypeId == FileTypeEnum.Photo)
                    {
                        continue;
                    }
                    if (!settings.IsViewVideoOnNote && fileContent.FileTypeId == FileTypeEnum.Video)
                    {
                        continue;
                    }
                }
                result.Add(content);
            }

            return result;
        }

        private void SetListIdIfNeed(IEnumerable<BaseNoteContent> contents)
        {
            var listId = 1;
            foreach(var content in contents.OrderBy(z => z.Order).ToList())
            {
                if(content.ContentTypeId == ContentTypeENUM.Text)
                {
                    var text = content as TextNote;
                    if(text.NoteTextTypeId == NoteTextTypeENUM.Numberlist)
                    {
                        text.ListId = listId;
                    }
                    else
                    {
                        listId++;
                    }
                }
            }
        }

        public async Task<List<Note>> GetNotesByUserIdAndTypeIdWithContent(
            Guid userId, NoteTypeENUM typeId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                    .Where(x => x.UserId == userId && x.NoteTypeId == typeId)
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByNoteIdsIdWithContent(
            IEnumerable<Guid> noteIds, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                    .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                    .Include(x => x.UsersOnPrivateNotes)
                    .Where(x => noteIds.Contains(x.Id))
                    .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public async Task<List<Note>> GetNotesByUserId(Guid userId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.UsersOnPrivateNotes)
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }

        public Task<List<Note>> GetNotesByUserIdWithContentNoLocked(Guid userId, List<Guid> exceptIds)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.Contents)
                .Where(x => x.UserId == userId && !exceptIds.Contains(x.Id) && x.Password == null).ToListAsync();
        }

        public async Task<List<Note>> GetNotesByUserIdNoLocked(Guid userId, List<Guid> exceptIds, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && !exceptIds.Contains(x.Id) && x.Password == null)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }


        public async Task<List<Note>> GetNotesByUserIdWithoutNoteNoLockedWithoutDeleted(Guid userId, Guid noteId, PersonalizationSettingDTO settings)
        {
            var notes = await context.Notes
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Where(x => x.UserId == userId && x.Id != noteId && x.Password == null && x.NoteTypeId != NoteTypeENUM.Deleted)
                .ToListAsync();

            return await GetWithFilteredContent(notes, settings);
        }


        public Task<List<Note>> GetNotesWithContent(List<Guid> noteIds)
        { 
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as CollectionNote).CollectionNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as CollectionNote).Files)
                .Where(x => noteIds.Contains(x.Id)).ToListAsync();
        }

        public Task<Note> GetNoteWithContent(Guid noteId)
        {
            return entities  // TODO OPTIMIZATION
                .Include(x => x.LabelsNotes).ThenInclude(z => z.Label)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as CollectionNote).CollectionNoteAppFiles)
                .Include(x => x.Contents)
                .ThenInclude(z => (z as CollectionNote).Files)
                .FirstOrDefaultAsync(x => x.Id == noteId);
        }
    }
}
