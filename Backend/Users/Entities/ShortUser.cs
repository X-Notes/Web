

namespace Users.Entities
{
    public class ShortUser
    {
        public Guid Id { set; get; }

        public string Name { set; get; }

        public string Email { set; get; }

        public Guid? PhotoId { set; get; }
        public string PhotoPath { set; get; }
    }
}
