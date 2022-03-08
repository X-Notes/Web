using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Commands
{
    public abstract class BaseCommandEntity
    {
        public Guid UserId { set; get; }

        public BaseCommandEntity(Guid userId)
        {
            this.UserId = userId;
        }

        public BaseCommandEntity()
        {

        }
    }
}
