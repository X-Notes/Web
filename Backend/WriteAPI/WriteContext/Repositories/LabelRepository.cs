using Common.DatabaseModels.models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                    var order = label.Order;

                    this.contextDB.Labels.Remove(label);
                    await contextDB.SaveChangesAsync();

                    var labelsForUpdate = labels.Where(x => x.Order > order && x.IsDeleted == true).ToList();
                    labelsForUpdate.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRangeLabels(labelsForUpdate);

                    await transaction.CommitAsync();
                }
                catch (Exception e)
                {
                    await transaction.RollbackAsync();
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
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
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
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
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
            using (var transaction = await contextDB.Database.BeginTransactionAsync())
            {
                try
                {
                  
                    // Update deleted labels
                    var deletedLabels = labels.Where(x => x.IsDeleted == true && x.Order > label.Order).ToList();
                    deletedLabels.ForEach(x => x.Order = x.Order - 1);
                    await UpdateRangeLabels(deletedLabels);

                    // Update all labels
                    var allLabels = labels.Where(x => x.IsDeleted == false).ToList();
                    allLabels.ForEach(x => x.Order = x.Order + 1);
                    label.Order = 1;
                    label.IsDeleted = false;
                    allLabels.Add(label);
                    await UpdateRangeLabels(allLabels);

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
