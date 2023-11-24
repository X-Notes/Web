
using Common.DTO;

namespace SignalrUpdater.Entities;

public class JoinEntityStatus
{
    public Guid EntityId { set; get; }

    public OperationResult<bool> Result { set; get; }

    public JoinEntityStatus(Guid entityId, OperationResult<bool> result)
    {
        EntityId = entityId;
        Result = result;
    }
}
