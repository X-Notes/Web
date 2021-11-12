using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.NoteContent.FileContent;
using Microsoft.EntityFrameworkCore;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.NoteContent
{
    public class PhotosCollectionNoteRepository : Repository<PhotosCollectionNote, Guid>
    {
        public PhotosCollectionNoteRepository(WriteContextDB contextDB)
            : base(contextDB)
        {
        }

        public async Task<PhotosCollectionNote> GetOneIncludePhotoNoteAppFiles(Guid id)
        {
            return await entities.Include(x => x.PhotoNoteAppFiles).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<PhotosCollectionNote> GetOneIncludePhotos(Guid id)
        {
            return await entities.Include(x => x.Photos).FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<PhotosCollectionNote>> GetManyIncludePhotoNoteAppFiles(List<Guid> ids)
        {
            return await entities.Include(x => x.PhotoNoteAppFiles).Where(x => ids.Contains(x.Id)).ToListAsync();
        }

        public async Task<List<PhotosCollectionNote>> GetManyIncludePhotos(List<Guid> ids)
        {
            return await entities.Include(x => x.Photos).Where(x => ids.Contains(x.Id)).ToListAsync();
        }
    }
}
