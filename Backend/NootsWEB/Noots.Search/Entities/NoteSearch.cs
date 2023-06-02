namespace Noots.Search.Entities
{
    public class NoteSearch
    {
        public Guid Id { set; get; }

        public string Name { set; get; }

        public NoteSearch(Guid id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
