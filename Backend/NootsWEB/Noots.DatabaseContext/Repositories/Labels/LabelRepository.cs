using Common.DatabaseModels.Models.Labels;
using Microsoft.EntityFrameworkCore;
using Noots.DatabaseContext.GenericRepositories;

namespace Noots.DatabaseContext.Repositories.Labels
{
    public class LabelRepository : Repository<Label, Guid>
    {
        public LabelRepository(NootsDBContext contextDB)
            : base(contextDB)
        {

        }

        public Task<List<Label>> GetLabelsThatNeedDeleteAfterTime(DateTimeOffset earliestTimestamp)
        {
            return entities.Where(x => x.IsDeleted == true && x.DeletedAt.HasValue && x.DeletedAt.Value < earliestTimestamp).ToListAsync();
        }

        public Task<List<Label>> GetAllByUserID(Guid id)
        {
            return context.Labels
                .Include(x => x.LabelsNotes)
                .Where(x => x.UserId == id)
                .ToListAsync();
        }

        public Task<int> GetNotesCountByLabelId(Guid id)
        {
            return context.LabelsNotes.Include(x => x.Note).Where(x => x.LabelId == id).CountAsync();
        }
    }
}
