using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Labels;
using WriteContext.GenericRepositories;
using Common;

namespace WriteContext.Repositories.Labels
{
    public class LabelRepository : Repository<Label, Guid>
    {
        public LabelRepository(WriteContextDB contextDB)
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
