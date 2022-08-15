using System;

namespace Common.CQRS
{
    public abstract class BaseCommandEntity
    {
        public Guid UserId { set; get; }

        public BaseCommandEntity(Guid userId)
        {
            UserId = userId;
        }

        public BaseCommandEntity()
        {

        }
    }
}
