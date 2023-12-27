using System;

namespace Common.DTO;

public class VersionUpdateResult(Guid entityId, int version)
{
    public Guid EntityId { set; get; } = entityId;

    public int Version { set; get; } = version;
}