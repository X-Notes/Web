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

        public async Task DeleteLabel(Label label)
        {
            this.contextDB.Labels.Remove(label);
            await contextDB.SaveChangesAsync();
        }

        public async Task<List<Label>> GetAll(int id)
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
            using(var transaction = contextDB.Database.BeginTransaction())
            {
                try
                {
                    var labels = await GetAll(label.UserId);

                    if (labels.Count() > 0)
                    {
                        labels.ForEach(x => x.Order = x.Order + 1);
                        await UpdateRangeLabels(labels);
                    }

                    await contextDB.Labels.AddAsync(label);
                    await contextDB.SaveChangesAsync();

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
