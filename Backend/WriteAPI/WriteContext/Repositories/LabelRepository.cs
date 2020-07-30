using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.models;

namespace WriteContext.Repositories
{
    public class LabelRepository
    {
        private readonly WriteContextDB contextDB;

        public LabelRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }

        public async Task DeleteLabel(Label label, List<Label> labels)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    var order = label.Order;

                    this.contextDB.Labels.Remove(label);
                    await contextDB.SaveChangesAsync();

                    var labelsForUpdate = labels.Where(x => x.Order > order && x.IsDeleted == true).ToList();
                    labelsForUpdate.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRangeLabels(labelsForUpdate);

                    transaction.Commit();
                }
                catch(Exception e)
                {
                    transaction.Rollback();
                }
            }

        }

        public async Task<List<Label>> GetAllByUserID(int id)
        {
            return await this.contextDB.Labels.Where(x => x.UserId == id).ToListAsync();
        }

        public async Task UpdateLabel(Label label)
        {
            this.contextDB.Labels.Update(label);
            await contextDB.SaveChangesAsync();
        }

        public async Task UpdateRangeLabels(List<Label> label)
        {
            this.contextDB.Labels.UpdateRange(label);
            await contextDB.SaveChangesAsync();
        }

        public async Task NewLabel(Label label)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    var labels = await GetAllByUserID(label.UserId);

                    if (labels.Count() > 0)
                    {
                        labels.Where(x => x.IsDeleted == false).ToList().ForEach(x => x.Order = x.Order + 1);
                        await UpdateRangeLabels(labels);
                    }

                    await contextDB.Labels.AddAsync(label);
                    await contextDB.SaveChangesAsync();

                    transaction.Commit();
                }
                catch (Exception e)
                {
                    transaction.Rollback();
                }
            }
        }

        public async Task SetDeletedLabel(Label labelDeleted, List<Label> labels)
        {
            using (var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    // Update no deleted labels
                    var noDeletedLabels = labels.Where(x => x.IsDeleted == false && x.Order > labelDeleted.Order).ToList();
                    noDeletedLabels.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRangeLabels(noDeletedLabels);

                    // Update deleted labels
                    var deletedLabels = labels.Where(x => x.IsDeleted == true).ToList();
                    deletedLabels.ForEach(x => x.Order = x.Order + 1);
                    await UpdateRangeLabels(deletedLabels);

                    // New Deleted Label
                    labelDeleted.Order = 1;
                    labelDeleted.IsDeleted = true;
                    await UpdateLabel(labelDeleted);

                    transaction.Commit();
                }
                catch(Exception e)
                {
                    transaction.Rollback();
                }
            }
        }
    }
}
