using System;

namespace Common.CQRS
{
    public class BaseQueryEntity
    {
        public Guid UserId { set; get; }

        public BaseQueryEntity(Guid userId)
        {
            UserId = userId;
        }

        public BaseQueryEntity()
        {

        }
    }
}
