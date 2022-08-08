using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Queries
{
    public class BaseQueryEntity
    {
        public Guid UserId { set; get; }

        public BaseQueryEntity(Guid userId)
        {
            this.UserId = userId;
        }

        public BaseQueryEntity()
        {

        }
    }
}
