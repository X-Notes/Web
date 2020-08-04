
namespace Common.DatabaseModels.models
{
    public class Folder
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public string Color { set; get; }
        public int Order { set; get; }
        public bool IsDeleted { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
    }
}
