namespace Noots.DatabaseContext.Repositories
{
    public class SearchRepository
    {
        private readonly NootsDBContext context;

        public SearchRepository(NootsDBContext contextDB)
        {
            this.context = contextDB;
        }
    }
}
