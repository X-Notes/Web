namespace Noots.SignalrUpdater.Entities
{
    public class LeaveFromEntity
    {
        public Guid EntityId { set; get; }

        public Guid UserIdentifier { set; get; }

        public Guid UserId { set; get; }

        public LeaveFromEntity(Guid entityId, Guid userIdentifier, Guid userId)
        {
            EntityId = entityId;
            UserIdentifier = userIdentifier;
            UserId = userId;
        }
    }
}
