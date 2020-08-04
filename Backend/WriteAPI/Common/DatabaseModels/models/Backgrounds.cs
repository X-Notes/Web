
namespace Common.DatabaseModels.models
{
    public class Backgrounds
    {
        public int Id { set; get; }
        public string Path { set; get; }
        public int UserId { set; get; }
        public User User { set; get; }
        public User CurrentUserBackground { set; get; }
    }
}
