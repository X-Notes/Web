using Common.DatabaseModels.models.Labels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.GenericRepositories;

namespace WriteContext.Repositories.Labels
{
    public class LabelRepository : Repository<Label>
    {
        public LabelRepository(WriteContextDB contextDB)
            : base(contextDB)
        {

        }

        public async Task SetDeleteLabel(Label label, List<Label> labels)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var order = label.Order;

                    context.Labels.Remove(label);
                    await context.SaveChangesAsync();

                    var labelsForUpdate = labels.Where(x => x.Order > order && x.IsDeleted == true).ToList();
                    labelsForUpdate.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRange(labelsForUpdate);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }

        }


        public async Task<List<Label>> GetAllByUserID(Guid id)
        {
            return await context.Labels
                .Include(x => x.LabelsNotes)
                .ThenInclude(x => x.Note)
                .Where(x => x.UserId == id)
                .ToListAsync();
        }

        public async Task<int> GetNotesCountByLabelId(Guid id)
        {
            return await context.LabelsNotes.Include(x => x.Note)
                .Where(x => x.LabelId == id && x.Note.IsHistory == false).CountAsync();
        }


        public async Task NewLabel(Label label)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    var labels = await GetAllByUserID(label.UserId);

                    if (labels.Count() > 0)
                    {
                        labels.Where(x => x.IsDeleted == false).ToList().ForEach(x => x.Order = x.Order + 1);
                        await UpdateRange(labels);
                    }

                    await context.Labels.AddAsync(label);
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task SetDeletedLabel(Label labelDeleted, List<Label> labels)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Update no deleted labels
                    var noDeletedLabels = labels.Where(x => x.IsDeleted == false && x.Order > labelDeleted.Order).ToList();
                    noDeletedLabels.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRange(noDeletedLabels);

                    // Update deleted labels
                    var deletedLabels = labels.Where(x => x.IsDeleted == true).ToList();
                    deletedLabels.ForEach(x => x.Order = x.Order + 1);
                    await UpdateRange(deletedLabels);

                    // New Deleted Label
                    labelDeleted.Order = 1;
                    labelDeleted.IsDeleted = true;
                    labelDeleted.DeletedAt = DateTimeOffset.Now;
                    labelDeleted.UpdatedAt = DateTimeOffset.Now;
                    await Update(labelDeleted);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }

        public async Task RestoreLabel(Label label, List<Label> labels)
        {
            using (var transaction = await context.Database.BeginTransactionAsync())
            {
                try
                {

                    // Update deleted labels
                    var deletedLabels = labels.Where(x => x.IsDeleted == true && x.Order > label.Order).ToList();
                    deletedLabels.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRange(deletedLabels);

                    // Update all labels
                    var allLabels = labels.Where(x => x.IsDeleted == false).ToList();
                    allLabels.ForEach(x => x.Order = x.Order + 1);
                    label.Order = 1;
                    label.IsDeleted = false;
                    label.UpdatedAt = DateTimeOffset.Now;
                    allLabels.Add(label);
                    await UpdateRange(allLabels);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
                }
            }
        }
    }
}
