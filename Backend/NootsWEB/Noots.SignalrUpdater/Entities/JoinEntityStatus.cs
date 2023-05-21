
namespace Noots.SignalrUpdater.Entities;

public class JoinEntityStatus
{
    public Guid EntityId { set; get; }

    public bool Joined { set; get; }

    public JoinEntityStatus(Guid entityId, bool joined)
    {
        EntityId = entityId;    
        Joined = joined;
    }
}
